import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { GoogleGenAI } from '@google/genai';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ResumeDataSchema } from '@/lib/resume';
import { checkRateLimit } from '@/lib/server/rateLimit';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// zodToJsonSchema(ResumeDataSchema, ...) is deterministic and only depends on
// the static schema, so it's computed once at module load instead of on
// every request.
const RESUME_JSON_SCHEMA = zodToJsonSchema(ResumeDataSchema, 'ResumeData');

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB — generous for a resume PDF
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { allowed, retryAfterMs } = checkRateLimit(
      `resume-parse:${session.user.id}`,
      RATE_LIMIT_MAX_REQUESTS,
      RATE_LIMIT_WINDOW_MS,
    );
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many resume uploads — please try again shortly.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) },
        },
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are supported' },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'File is too large (10MB max)' },
        { status: 400 },
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');

    const prompt = `You are an expert data extraction assistant. I have provided a PDF document of a resume or a LinkedIn profile export.
Your task is to extract all the relevant information and structure it perfectly according to the provided JSON schema.

Instructions:
1. Extract the name, contact info, summary, work experience, education, projects, skills, etc.
2. For dates (start, end), format them as simple years (e.g., "2020") unless a specific month is required by the context. If "present" or "ongoing", use "Now" or "Ongoing".
3. Output ONLY valid JSON matching the schema. Do not add markdown code blocks, just raw JSON.

CRITICAL CONSTRAINTS:
- For the \`shortAbout\` field under \`header\`, YOU MUST keep it to an absolute maximum of 32 characters. It must be very brief, like a tiny sub-headline (e.g. "Software Engineer", "Product Designer", "Data Scientist"). Do NOT exceed 32 characters under any circumstances!

Schema:
${JSON.stringify(RESUME_JSON_SCHEMA, null, 2)}`;

    // Call Gemini to structure the data natively from the PDF
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { data: base64Data, mimeType: 'application/pdf' } },
            { text: prompt },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error('Gemini returned an empty response');
    }

    let parsedData;
    try {
      parsedData = JSON.parse(outputText);
    } catch (e) {
      console.error('Failed to parse Gemini output as JSON:', outputText);
      return NextResponse.json(
        { error: 'Failed to process resume data into structured format' },
        { status: 500 },
      );
    }

    // Validate the extracted data against our Zod schema.
    const validationResult = ResumeDataSchema.safeParse(parsedData);

    if (validationResult.success) {
      return NextResponse.json({ success: true, data: validationResult.data });
    }

    // The LLM's output didn't match the schema as a whole (e.g. one field has
    // an unexpected type) — rather than either hard-failing the import or
    // returning the raw, schema-violating object as-is, validate each
    // top-level section independently and keep only the ones that pass. This
    // is the "map as best as possible" the original comment here intended:
    // a bad `education` entry shouldn't also throw away a perfectly good
    // `workExperience` array.
    console.error('Full-document validation failed:', validationResult.error);

    const salvaged: Record<string, unknown> = {};
    for (const [key, fieldSchema] of Object.entries(ResumeDataSchema.shape)) {
      const fieldResult = fieldSchema.safeParse(
        (parsedData as Record<string, unknown> | null)?.[key],
      );
      if (fieldResult.success) {
        salvaged[key] = fieldResult.data;
      }
    }

    return NextResponse.json({ success: true, data: salvaged });
  } catch (error) {
    console.error('Resume parsing error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while parsing the resume' },
      { status: 500 },
    );
  }
}
