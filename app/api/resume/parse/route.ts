import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { GoogleGenAI } from '@google/genai';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ResumeDataSchema } from '@/lib/resume';
import { checkRateLimit } from '@/lib/server/rateLimit';
import {
  GROQ_MAX_TEXT_CHARS,
  GROQ_MIN_TEXT_CHARS,
  extractPdfText,
  groqEnabled,
  parseResumeTextWithGroq,
} from '@/lib/server/resumeParsing';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const RESUME_JSON_SCHEMA = zodToJsonSchema(ResumeDataSchema, 'ResumeData');

// Google retires models without much warning (2.5 Flash now 404s for new API
// keys), so the model can be changed with GEMINI_MODEL in Vercel, no deploy.
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

// Gemini sometimes answers 503 "high demand" for a moment and then succeeds,
// so those (and only those) are retried a couple of times.
const GEMINI_ATTEMPTS = 3;
const GEMINI_RETRY_DELAY_MS = 1500;

async function generateWithRetry(
  request: Parameters<typeof ai.models.generateContent>[0],
) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await ai.models.generateContent(request);
    } catch (error) {
      const status = (error as { status?: number } | null)?.status;
      if (status !== 503 || attempt >= GEMINI_ATTEMPTS) throw error;
      await new Promise((r) => setTimeout(r, GEMINI_RETRY_DELAY_MS * attempt));
    }
  }
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB — generous for a resume PDF
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { allowed, retryAfterMs } = await checkRateLimit(
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
    // First choice: read the PDF's text and have Groq structure it (fast, and
    // free). Anything unusual (no key, a scanned PDF, a long one, a Groq error)
    // falls through to Gemini, which reads the PDF itself.
    let parsedData: unknown;
    if (groqEnabled()) {
      try {
        const text = await extractPdfText(buffer);
        if (
          text.length >= GROQ_MIN_TEXT_CHARS &&
          text.length <= GROQ_MAX_TEXT_CHARS
        ) {
          parsedData = await parseResumeTextWithGroq(text);
        } else {
          console.info(
            `Resume parse: using Gemini (PDF text is ${text.length} characters)`,
          );
        }
      } catch (error) {
        console.error(
          'Resume parse: Groq failed, falling back to Gemini:',
          error instanceof Error ? error.message : error,
        );
      }
    }

    if (parsedData === undefined) {
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
      const response = await generateWithRetry({
        model: GEMINI_MODEL,
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

      try {
        parsedData = JSON.parse(outputText);
      } catch (e) {
        console.error('Failed to parse Gemini output as JSON:', outputText);
        return NextResponse.json(
          { error: 'Failed to process resume data into structured format' },
          { status: 500 },
        );
      }
    }

    // Validate the extracted data against our Zod schema.
    const validationResult = ResumeDataSchema.safeParse(parsedData);

    if (validationResult.success) {
      return NextResponse.json({ success: true, data: validationResult.data });
    }

    // Partial match: keep each top-level section that validates on its own, so
    // one bad field doesn't discard the whole import.
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
    // Log the message and status explicitly: the log viewer collapses an
    // ApiError object to {…}, which hid the real cause of a failure.
    console.error(
      'Resume parsing error:',
      error instanceof Error ? error.message : error,
      (error as { status?: number } | null)?.status ?? '',
    );
    // Still overloaded after the retries: say so, rather than blaming the file.
    if ((error as { status?: number } | null)?.status === 503) {
      return NextResponse.json(
        {
          error:
            'Our resume reader is busy right now. Please try again in a minute.',
        },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred while parsing the resume' },
      { status: 500 },
    );
  }
}
