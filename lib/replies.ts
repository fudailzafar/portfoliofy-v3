// Shared rules for private replies. Pure (no database, no Next.js) so the
// API routes, the data layer and the UI can all use the same definitions.

import { z } from 'zod';
import type { ResumeData } from '@/lib/server/dbActions';

export const REPLY_MAX_LENGTH = 2000;
export const REPLY_EXCERPT_LENGTH = 280;

// Sections whose items can be replied to. Contacts and the header are left
// out on purpose: only items that carry content get a reply arrow.
export const REPLYABLE_SECTIONS = [
  'workExperience',
  'education',
  'projects',
  'sideProjects',
  'speaking',
  'writing',
  'exhibitions',
  'features',
  'volunteering',
  'awards',
  'certifications',
] as const;

export type ReplySection = (typeof REPLYABLE_SECTIONS)[number];

// How each section is named in "replied to your ...".
export const REPLY_SECTION_NOUN: Record<ReplySection, string> = {
  workExperience: 'work experience',
  education: 'education',
  projects: 'project',
  sideProjects: 'side project',
  speaking: 'talk',
  writing: 'writing',
  exhibitions: 'exhibition',
  features: 'feature',
  volunteering: 'volunteering',
  awards: 'award',
  certifications: 'certification',
};

export const REPORT_REASONS = [
  'spam',
  'harassment',
  'inappropriate',
  'impersonation',
  'other',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

/** What a reply is about: the owner's status, one profile item, or nothing. */
export const ReplyTargetSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('status') }),
  z.object({
    kind: z.literal('item'),
    section: z.enum(REPLYABLE_SECTIONS),
    itemId: z.string().min(1).max(200),
  }),
]);

export type ReplyTarget = z.infer<typeof ReplyTargetSchema>;

const MessageBodySchema = z
  .string()
  .transform((value) => value.trim())
  .pipe(
    z
      .string()
      .min(1, 'Write a message first')
      .max(REPLY_MAX_LENGTH, `Keep it under ${REPLY_MAX_LENGTH} characters`),
  );

export const SendReplySchema = z.object({
  // Visitors know a username, not an internal id.
  username: z.string().min(1).max(100),
  body: MessageBodySchema,
  target: ReplyTargetSchema.optional(),
});

export const ThreadMessageBodySchema = z.object({ body: MessageBodySchema });

export const ReportSchema = z.object({
  conversationId: z.string().uuid(),
  messageId: z.number().int().positive().optional(),
  reason: z.enum(REPORT_REASONS),
  details: z.string().trim().max(1000).optional(),
});

export type ReplyContext =
  | { kind: 'status'; emoji: string | null; text: string | null }
  | {
      kind: 'item';
      section: ReplySection;
      itemId: string;
      title: string;
      subtitle: string | null;
      year: string | null;
      excerpt: string | null;
    };

// Emoji, joiners, variation selectors, skin tones and flag letters, with
// whitespace between. Digits and punctuation are not emoji, so "123" is text.
const EMOJI_ONLY =
  /^(?:\p{Extended_Pictographic}|[‍️\u{1F3FB}-\u{1F3FF}\u{1F1E6}-\u{1F1FF}]|\s)+$/u;

/** True when a message is only emoji, so the thread can show it large. */
export function isEmojiOnly(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  return (
    EMOJI_ONLY.test(trimmed) &&
    /\p{Extended_Pictographic}|\p{Regional_Indicator}/u.test(trimmed)
  );
}

/** Plain-text excerpt of rich text, for quoting in a conversation. */
export function toExcerpt(
  html: string | null | undefined,
  maxLength = REPLY_EXCERPT_LENGTH,
): string | null {
  if (!html) return null;
  const text = html
    .replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return null;
  return text.length > maxLength
    ? `${text.slice(0, maxLength - 1).trimEnd()}…`
    : text;
}

const blank = (value: string | null | undefined) => {
  const trimmed = (value ?? '').trim();
  return trimmed || null;
};

function yearRange(from?: string | null, to?: string | null): string | null {
  const start = blank(from);
  const end = blank(to);
  if (start && end && start !== end) return `${start} — ${end}`;
  return start ?? end;
}

type AnyItem = Record<string, unknown> & { id?: string; hidden?: boolean };

// How each section's fields map to a title, a subtitle and a year.
const FIELD_MAP: Record<
  ReplySection,
  (item: AnyItem) => {
    title: unknown;
    subtitle: unknown;
    year: string | null;
    excerpt: unknown;
  }
> = {
  workExperience: (i) => ({
    title: i.title,
    subtitle: i.company,
    year: yearRange(i.start as string, i.end as string),
    excerpt: i.description,
  }),
  education: (i) => ({
    title: i.degree,
    subtitle: i.school,
    year: yearRange(i.start as string, i.end as string),
    excerpt: i.description,
  }),
  projects: (i) => ({
    title: i.title,
    subtitle: i.company,
    year: blank(i.year as string),
    excerpt: i.description,
  }),
  sideProjects: (i) => ({
    title: i.title,
    subtitle: i.company,
    year: blank(i.year as string),
    excerpt: i.description,
  }),
  speaking: (i) => ({
    title: i.title,
    subtitle: i.organization,
    year: blank(i.year as string),
    excerpt: i.description,
  }),
  writing: (i) => ({
    title: i.title,
    subtitle: i.publication,
    year: blank(i.year as string),
    excerpt: i.description,
  }),
  exhibitions: (i) => ({
    title: i.title,
    subtitle: i.organization,
    year: blank(i.year as string),
    excerpt: i.description,
  }),
  features: (i) => ({
    title: i.title,
    subtitle: i.location,
    year: blank(i.year as string),
    excerpt: i.description,
  }),
  volunteering: (i) => ({
    title: i.role,
    subtitle: i.organization,
    year: yearRange(i.startYear as string, i.endYear as string),
    excerpt: i.description,
  }),
  awards: (i) => ({
    title: i.title,
    subtitle: i.issuer,
    year: blank(i.year as string),
    excerpt: i.description,
  }),
  certifications: (i) => ({
    title: i.title,
    subtitle: i.issuer,
    year: blank(i.year as string),
    excerpt: i.description,
  }),
};

/**
 * Freezes the item being replied to. Returns null when it doesn't exist, is
 * hidden from the public profile, or has no title, so a reply can't quote
 * something a visitor wasn't able to see.
 */
export function buildItemContext(
  resumeData: ResumeData | null | undefined,
  section: ReplySection,
  itemId: string,
): Extract<ReplyContext, { kind: 'item' }> | null {
  const items = resumeData?.[section] as AnyItem[] | undefined;
  const item = items?.find((candidate) => candidate.id === itemId);
  if (!item || item.hidden) return null;

  const fields = FIELD_MAP[section](item);
  const title = blank(fields.title as string);
  if (!title) return null;

  return {
    kind: 'item',
    section,
    itemId,
    title,
    subtitle: blank(fields.subtitle as string),
    year: fields.year,
    excerpt: toExcerpt(fields.excerpt as string),
  };
}

/** Freezes the owner's status. Null when they have none set. */
export function buildStatusContext(
  emoji: string | null | undefined,
  text: string | null | undefined,
): Extract<ReplyContext, { kind: 'status' }> | null {
  const cleanEmoji = blank(emoji);
  const cleanText = blank(text);
  if (!cleanEmoji && !cleanText) return null;
  return { kind: 'status', emoji: cleanEmoji, text: cleanText };
}
