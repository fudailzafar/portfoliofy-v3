import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { GoogleGenAI } from '@google/genai';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ResumeDataSchema } from '@/lib/resume';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are supported' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');

    // Convert our Zod schema to a JSON schema to guide the LLM
    const jsonSchema = zodToJsonSchema(ResumeDataSchema, 'ResumeData');

    const prompt = `You are an expert data extraction assistant. I have provided a PDF document of a resume or a LinkedIn profile export.
Your task is to extract all the relevant information and structure it perfectly according to the provided JSON schema.

Instructions:
1. Extract the name, contact info, summary, work experience, education, projects, skills, etc.
2. For dates (start, end), format them as simple years (e.g., "2020") unless a specific month is required by the context. If "present" or "ongoing", use "Now" or "Ongoing".
3. Output ONLY valid JSON matching the schema. Do not add markdown code blocks, just raw JSON.

CRITICAL CONSTRAINTS:
- For the \`shortAbout\` field under \`header\`, YOU MUST keep it to an absolute maximum of 32 characters. It must be very brief, like a tiny sub-headline (e.g. "Software Engineer", "Product Designer", "Data Scientist"). Do NOT exceed 32 characters under any circumstances!

Schema:
${JSON.stringify(jsonSchema, null, 2)}`;

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
        { status: 500 }
      );
    }

    // Validate the extracted data against our Zod schema
    const validationResult = ResumeDataSchema.safeParse(parsedData);

    if (!validationResult.success) {
      console.error('Validation failed:', validationResult.error);
      // We still return the parsedData so the frontend can pre-fill what it can,
      // but ideally we return the fully validated object.
      // Let's force it to map as best as possible.
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
    });

  } catch (error) {
    console.error('Resume parsing error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while parsing the resume' },
      { status: 500 }
    );
  }
}
