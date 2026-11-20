// Resume import, first attempt: read the PDF's text ourselves and have Groq
// structure it. Groq's free tier allows ~8,000 tokens a minute, so the model is
// shown a compact outline of the resume schema (built from the real one, so it
// can't drift) and long or scanned PDFs are left to Gemini.

import { extractText, getDocumentProxy } from 'unpdf';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ResumeDataSchema } from '@/lib/resume';

/** Below this the PDF is probably scanned (an image), so Gemini reads it. */
export const GROQ_MIN_TEXT_CHARS = 200;
/** Above this the request would overrun Groq's free per-minute token limit. */
export const GROQ_MAX_TEXT_CHARS = 9000;

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_TIMEOUT_MS = 25_000;
const GROQ_MAX_OUTPUT_TOKENS = 3000;

export function groqModel() {
  return process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
}

export function groqEnabled() {
  return !!process.env.GROQ_API_KEY;
}

/** The text layer of a PDF; empty for image-only PDFs. */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return text
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ── A short outline of the schema ───────────────────────────────────────────

type JsonSchema = {
  $ref?: string;
  type?: string | string[];
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  anyOf?: JsonSchema[];
  enum?: unknown[];
  description?: string;
};

// Parts of a resume that come from the text vs. ones the app fills in.
const NOT_IN_A_RESUME = new Set([
  'pages',
  'preferences',
  'sectionOrder',
  'design',
]);
const FILLED_IN_BY_APP = new Set([
  'id',
  'hidden',
  'attachments',
  'collaborators',
]);

function outline(
  schema: JsonSchema,
  defs: Record<string, JsonSchema>,
  depth = 0,
): unknown {
  if (schema.$ref) {
    const target = defs[schema.$ref.split('/').pop() ?? ''];
    return target ? outline(target, defs, depth) : 'string';
  }
  if (schema.anyOf) {
    const real = schema.anyOf.find((s) => s.type !== 'null');
    return real ? outline(real, defs, depth) : 'string';
  }
  if (schema.enum) return schema.enum.join('|');
  switch (schema.type) {
    case 'object': {
      const out: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(schema.properties ?? {})) {
        if (depth === 0 && NOT_IN_A_RESUME.has(key)) continue;
        if (FILLED_IN_BY_APP.has(key)) continue;
        out[key] = outline(value, defs, depth + 1);
      }
      return out;
    }
    case 'array':
      return [schema.items ? outline(schema.items, defs, depth + 1) : 'string'];
    case 'boolean':
      return 'boolean';
    case 'number':
    case 'integer':
      return 'number';
    default: {
      // A few words of the field's description help, e.g. "City, Country".
      const hint = schema.description?.split(/[.(]/)[0].trim().slice(0, 70);
      return hint ? `string (${hint})` : 'string';
    }
  }
}

let cachedOutline: string | null = null;

export function resumeOutline(): string {
  if (cachedOutline) return cachedOutline;
  const json = zodToJsonSchema(ResumeDataSchema, 'ResumeData') as {
    definitions?: Record<string, JsonSchema>;
  };
  const defs = json.definitions ?? {};
  cachedOutline = JSON.stringify(outline(defs.ResumeData, defs));
  return cachedOutline;
}

const INSTRUCTIONS = `You extract the contents of a resume or LinkedIn profile export into JSON.
Output ONLY one JSON object that follows the outline below. No markdown, no commentary.

Rules:
- Use only what the text says. Use "" for a string it doesn't give and [] for a list it doesn't have.
- Dates are plain years like "2020". For something current use "Now".
- Descriptions and the summary are HTML: wrap paragraphs in <p>…</p> and bullet points as <ul><li><p>…</p></li></ul>.
- header.shortAbout is a tiny sub-headline such as "Product Designer": at most 32 characters.
- Keep every job, school, project and other entry the text lists, newest first.

Outline (each value shows the type of that field):
`;

/** Pulls the JSON object out of a reply that may be wrapped in text or fences. */
export function jsonFromReply(reply: string): unknown {
  const start = reply.indexOf('{');
  const end = reply.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error('Groq reply had no JSON');
  return JSON.parse(reply.slice(start, end + 1));
}

/**
 * Structures resume text with Groq. Throws on anything unusual (key missing,
 * HTTP error, timeout, cut-off or unusable reply) so the caller can fall back.
 */
export async function parseResumeTextWithGroq(
  text: string,
): Promise<Record<string, any>> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not set');

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: groqModel(),
      temperature: 0,
      max_tokens: GROQ_MAX_OUTPUT_TOKENS,
      response_format: { type: 'json_object' },
      // gpt-oss "thinks" before answering, and thinking tokens count against
      // the free per-minute limit; a resume doesn't need much of it.
      ...(groqModel().startsWith('openai/gpt-oss')
        ? { reasoning_effort: 'low' }
        : {}),
      messages: [
        { role: 'system', content: INSTRUCTIONS + resumeOutline() },
        { role: 'user', content: text },
      ],
    }),
    signal: AbortSignal.timeout(GROQ_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(
      `Groq ${response.status}: ${(await response.text()).slice(0, 200)}`,
    );
  }

  const data = await response.json();
  const choice = data?.choices?.[0];
  if (choice?.finish_reason === 'length') {
    throw new Error('Groq reply was cut off at the token limit');
  }
  const parsed = jsonFromReply(String(choice?.message?.content ?? ''));
  if (!parsed || typeof parsed !== 'object')
    throw new Error('Groq reply was not an object');

  const resume = parsed as Record<string, any>;
  // A resume always has a name; without one the reply is unusable.
  if (!String(resume.header?.name ?? '').trim()) {
    throw new Error('Groq reply had no name');
  }
  // Keep the sub-headline within its limit.
  if (typeof resume.header.shortAbout === 'string') {
    resume.header.shortAbout = resume.header.shortAbout.slice(0, 32).trim();
  }
  // "janedoe.com" -> "https://janedoe.com", like the Website field does.
  const site = String(resume.header.website ?? '').trim();
  if (site && !/^https?:\/\//i.test(site)) {
    resume.header.website = `https://${site}`;
  }
  return resume;
}
