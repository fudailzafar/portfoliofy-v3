// Pure edits to a profile. Each returns a new profile or throws EditError with
// a message written for the AI to relay. Saving happens in writeTools.ts.

import { z } from 'zod';
import {
  AttachmentSchemaType,
  dedupeSlug,
  DEFAULT_SECTION_ORDER,
  getUsedPageSlugs,
  ResumeDataSchema,
  ResumeDataSchemaType,
  slugify,
} from '@portfoliofy/shared/resume';

type ResumeData = ResumeDataSchemaType;

/** A problem the AI can fix or explain, as opposed to a server failure. */
export class EditError extends Error {}

export const ITEM_SECTIONS = [
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
  'contacts',
] as const;

export type ItemSection = (typeof ITEM_SECTIONS)[number];

// Set by the app, not the AI: ids link items together, and attachments and
// collaborators hold references to other records.
const PROTECTED_ITEM_FIELDS = ['id', 'attachments', 'collaborators'];

function itemSchema(section: ItemSection): z.ZodTypeAny {
  let schema: z.ZodTypeAny = ResumeDataSchema.shape[section];
  while (
    schema instanceof z.ZodDefault ||
    schema instanceof z.ZodOptional ||
    schema instanceof z.ZodEffects
  ) {
    schema =
      schema instanceof z.ZodEffects
        ? schema.innerType()
        : schema._def.innerType;
  }
  return (schema as z.ZodArray<z.ZodTypeAny>).element;
}

/** Field names for a section's items, for tool descriptions. */
export function itemFieldNames(section: ItemSection): string[] {
  let schema = itemSchema(section);
  if (schema instanceof z.ZodEffects) schema = schema.innerType();
  return Object.keys((schema as z.AnyZodObject).shape).filter(
    (field) => !PROTECTED_ITEM_FIELDS.includes(field),
  );
}

export function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) =>
      issue.path.length
        ? `${issue.path.join('.')}: ${issue.message}`
        : issue.message,
    )
    .join('; ');
}

function withoutProtectedFields(fields: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(fields).filter(
      ([field]) => !PROTECTED_ITEM_FIELDS.includes(field),
    ),
  );
}

function parseItem(section: ItemSection, item: Record<string, unknown>) {
  const parsed = itemSchema(section).safeParse(item);
  if (!parsed.success) throw new EditError(formatIssues(parsed.error));
  return parsed.data;
}

function itemsIn(data: ResumeData, section: ItemSection) {
  return (data[section] ?? []) as { id?: string }[];
}

export function addItem(
  data: ResumeData,
  section: ItemSection,
  fields: Record<string, unknown>,
  id: string,
): ResumeData {
  const item = parseItem(section, { ...withoutProtectedFields(fields), id });
  return { ...data, [section]: [...itemsIn(data, section), item] };
}

export function updateItem(
  data: ResumeData,
  section: ItemSection,
  itemId: string,
  fields: Record<string, unknown>,
): ResumeData {
  const items = itemsIn(data, section);
  const existing = items.find((item) => item.id === itemId);
  if (!existing) throw new EditError(`No item in ${section} has that id.`);

  const updated = parseItem(section, {
    ...existing,
    ...withoutProtectedFields(fields),
  });
  return {
    ...data,
    [section]: items.map((item) => (item === existing ? updated : item)),
  };
}

export function removeItem(
  data: ResumeData,
  section: ItemSection,
  itemId: string,
): ResumeData {
  const items = itemsIn(data, section);
  if (!items.some((item) => item.id === itemId)) {
    throw new EditError(`No item in ${section} has that id.`);
  }
  return {
    ...data,
    [section]: items.filter((item) => item.id !== itemId),
  };
}

/** Sets the section order. Sections left out keep their place at the end. */
export function reorderSections(data: ResumeData, order: string[]): ResumeData {
  const unknown = order.filter((s) => !DEFAULT_SECTION_ORDER.includes(s));
  if (unknown.length > 0) {
    throw new EditError(
      `Unknown sections: ${unknown.join(', ')}. Valid sections: ${DEFAULT_SECTION_ORDER.join(', ')}.`,
    );
  }
  const requested = [...new Set(order)];
  return {
    ...data,
    sectionOrder: [
      ...requested,
      ...DEFAULT_SECTION_ORDER.filter((s) => !requested.includes(s)),
    ],
  };
}

function findPage(data: ResumeData, pageId: string) {
  const page = data.pages?.find((p) => p.id === pageId);
  if (!page) throw new EditError('No page with that id.');
  return page;
}

function replacePage(data: ResumeData, updated: AttachmentSchemaType) {
  return {
    ...data,
    pages: (data.pages ?? []).map((p) => (p.id === updated.id ? updated : p)),
  };
}

export function createDraft(
  data: ResumeData,
  { title, content }: { title: string; content: string },
  id: string,
  now: Date,
): ResumeData {
  const draft: AttachmentSchemaType = {
    id,
    type: 'page',
    title,
    content,
    slug: dedupeSlug(slugify(title), getUsedPageSlugs(data)),
    createdAt: now.toISOString(),
    hidden: true,
    isBlurred: false,
  };
  return { ...data, pages: [...(data.pages ?? []), draft] };
}

export function updatePage(
  data: ResumeData,
  pageId: string,
  { title, content }: { title?: string; content?: string },
): ResumeData {
  const page = findPage(data, pageId);
  return replacePage(data, {
    ...page,
    title: title ?? page.title,
    content: content ?? page.content,
  });
}

export function setPagePublished(
  data: ResumeData,
  pageId: string,
  published: boolean,
): ResumeData {
  return replacePage(data, { ...findPage(data, pageId), hidden: !published });
}
