import { z } from 'zod';
import { isReversedRange } from './validation/dates';
import { isValidWebsite } from './validation/url';

export const DEFAULT_SECTION_ORDER = [
  'projects',
  'side_projects',
  'exhibitions',
  'speaking',
  'writing',
  'awards',
  'features',
  'work',
  'volunteering',
  'skills',
  'education',
  'certifications',
  'contact',
];

export const SECTION_LABELS: Record<string, string> = {
  work: 'Work Experience',
  side_projects: 'Side Projects',
  speaking: 'Speaking',
  writing: 'Writing',
  exhibitions: 'Exhibitions',
  features: 'Features',
  volunteering: 'Volunteering',
  projects: 'Projects',
  skills: 'Skills',
  education: 'Education',
  contact: 'Contact',
  awards: 'Awards',
  certifications: 'Certifications',
};

export const AttachmentSchema = z.object({
  id: z.string().describe('Unique identifier for the attachment'),
  // Optional: a page-type entry inside an item's `attachments` array is a
  // lightweight reference stub (just `{id, type: 'page'}`) once pages moved
  // to the top-level `pages` array below — the real url/title/etc. live on
  // the canonical entry there, resolved via resolveAttachedPages().
  url: z
    .string()
    .optional()
    .describe(
      'S3 URL of the attachment (image/video source, or a page thumbnail)',
    ),
  type: z.enum(['image', 'video', 'page']).describe('Type of attachment'),
  filename: z.string().optional().describe('Original filename'),
  width: z.number().optional().describe('Width of the media'),
  height: z.number().optional().describe('Height of the media'),
  // Page-only fields — optional so image/video attachments are unaffected.
  title: z.string().optional().describe('Title of the page'),
  slug: z.string().optional().describe('URL slug of the page, unique per user'),
  content: z
    .string()
    .optional()
    .describe('Sanitized rich-text HTML body of the page'),
  createdAt: z
    .string()
    .optional()
    .describe(
      'ISO timestamp for the page, shown as its date and used for sorting — defaults to creation time but is user-editable',
    ),
  hidden: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether the page is a draft (unpublished)'),
  isBlurred: z
    .boolean()
    .optional()
    .default(false)
    .describe('Whether the page is hidden/blurred from public view'),
});

export type AttachmentSchemaType = z.infer<typeof AttachmentSchema>;

// A page-type entry inside an item's `attachments` array is just a
// `{id, type: 'page'}` reference stub — the canonical page (title, slug,
// content, hidden, etc.) lives in the top-level `pages` array. This resolves
// an item's stubs to their full page objects for rendering, silently
// dropping any stub whose target page was deleted.
export function resolveAttachedPages(
  attachments: AttachmentSchemaType[] | undefined,
  pages: AttachmentSchemaType[] | undefined,
): AttachmentSchemaType[] {
  if (!attachments?.length || !pages?.length) return [];
  const byId = new Map(pages.map((p) => [p.id, p]));
  return attachments
    .filter((a) => a.type === 'page')
    .map((stub) => byId.get(stub.id))
    .filter((p): p is AttachmentSchemaType => !!p);
}

export const PAGE_ATTACHMENT_SECTION_KEYS: (keyof ResumeDataSchemaType)[] = [
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
];

// Before pages became their own top-level list, a page was a full object
// embedded directly in whichever item's `attachments` array it was attached
// to. Older resumes on read still have that shape — this pulls every
// embedded full page object into resume.pages and replaces it in place with
// a lightweight {id, type:'page'} reference stub, so nothing that already
// existed silently disappears just because the storage shape changed.
// Idempotent: a no-op once a resume has already been migrated.
export function migrateEmbeddedPages(
  resumeData: ResumeDataSchemaType | null | undefined,
): ResumeDataSchemaType | null | undefined {
  if (!resumeData) return resumeData;

  const existingPageIds = new Set((resumeData.pages || []).map((p) => p.id));
  const migratedPages: AttachmentSchemaType[] = [];
  let changed = false;

  const migrated: any = { ...resumeData };

  for (const sectionKey of PAGE_ATTACHMENT_SECTION_KEYS) {
    const items = resumeData[sectionKey];
    if (!Array.isArray(items)) continue;

    migrated[sectionKey] = items.map((item: any) => {
      if (!Array.isArray(item.attachments) || item.attachments.length === 0) {
        return item;
      }

      let itemChanged = false;
      const newAttachments = item.attachments.map((a: AttachmentSchemaType) => {
        // A reference stub only ever has {id, type}. content/slug being
        // present (even an empty string) means it's the old embedded shape.
        const isEmbeddedPage =
          a.type === 'page' &&
          (a.content !== undefined || a.slug !== undefined);
        if (!isEmbeddedPage) return a;

        itemChanged = true;
        changed = true;
        if (!existingPageIds.has(a.id)) {
          existingPageIds.add(a.id);
          migratedPages.push(a);
        }
        return {
          id: a.id,
          type: 'page' as const,
          hidden: a.hidden ?? false,
          isBlurred: a.isBlurred ?? false,
        };
      });

      return itemChanged ? { ...item, attachments: newAttachments } : item;
    });
  }

  if (!changed) return resumeData;

  migrated.pages = [...(resumeData.pages || []), ...migratedPages];
  return migrated;
}

// Ported from the writing-panel branch's read-time calculation, used on both
// the editor and public attachment cards for a page.
export function estimateReadMinutes(html: string): number {
  const words = html
    .replace(/<[^>]*>?/gm, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return Math.max(1, Math.ceil(words.length / 200));
}

// Static segments that already exist under /[username]/ (e.g. the OG image
// route) — Next.js resolves these before the dynamic /[username]/[slug]
// page route, so a page slug matching one of these would be unreachable.
export const RESERVED_PAGE_SLUGS = ['og'];

// Pages are their own top-level list (resume.pages) — a page can be attached
// to more than one section item at once, so it can no longer be "owned" by
// a single item's attachments array. Items keep {id, type:'page'} reference
// stubs (see resolveAttachedPages above); these three helpers are the only
// places that need the canonical page, so they read resume.pages directly.
export function findPageBySlug(
  resumeData: ResumeDataSchemaType | null | undefined,
  slug: string,
): AttachmentSchemaType | undefined {
  if (!resumeData || !slug) return undefined;
  return resumeData.pages?.find((p) => p.slug === slug);
}

// Every slug currently in use across the whole resume, for uniqueness
// checks — excludes the given page id so editing a page doesn't collide
// with itself.
export function getUsedPageSlugs(
  resumeData: ResumeDataSchemaType | null | undefined,
  excludePageId?: string,
): Set<string> {
  const used = new Set<string>();
  if (!resumeData) return used;
  for (const page of resumeData.pages || []) {
    if (page.slug && page.id !== excludePageId) used.add(page.slug);
  }
  return used;
}

// Removes a page and every {id, type:'page'} reference stub to it across
// all attaching section items — a page can be attached to more than one
// item at once (see resolveAttachedPages above), so deleting it has to
// sweep all of them, not just wherever the delete was triggered from.
export function withPageRemoved(
  resumeData: ResumeDataSchemaType,
  pageId: string,
): Partial<ResumeDataSchemaType> {
  const patch: Record<string, any> = {
    pages: (resumeData.pages || []).filter((p) => p.id !== pageId),
  };
  for (const key of PAGE_ATTACHMENT_SECTION_KEYS) {
    const items = resumeData[key];
    if (!Array.isArray(items)) continue;
    patch[key] = items.map((item: any) =>
      item.attachments?.some(
        (a: AttachmentSchemaType) => a.type === 'page' && a.id === pageId,
      )
        ? {
            ...item,
            attachments: item.attachments.filter(
              (a: AttachmentSchemaType) =>
                !(a.type === 'page' && a.id === pageId),
            ),
          }
        : item,
    );
  }
  return patch;
}

// Every page on the resume, for sitemap generation.
export function getAllPageAttachments(
  resumeData: ResumeDataSchemaType | null | undefined,
): AttachmentSchemaType[] {
  return (resumeData?.pages || []).filter((p) => p.slug);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Appends -2, -3, etc. until the slug no longer collides with an existing
// one or a reserved route segment — never blocks the user with an error,
// just quietly picks an available slug.
export function dedupeSlug(base: string, used: Set<string>): string {
  const safeBase = base || 'untitled';
  if (!used.has(safeBase) && !RESERVED_PAGE_SLUGS.includes(safeBase)) {
    return safeBase;
  }
  let n = 2;
  while (
    used.has(`${safeBase}-${n}`) ||
    RESERVED_PAGE_SLUGS.includes(`${safeBase}-${n}`)
  ) {
    n += 1;
  }
  return `${safeBase}-${n}`;
}

export const CollaboratorSchema = z.object({
  id: z.string().describe('User id of the tagged collaborator'),
  username: z.string().describe('Username of the tagged collaborator'),
  name: z.string().describe('Display name of the tagged collaborator'),
  image: z
    .string()
    .nullable()
    .describe('Avatar URL of the tagged collaborator'),
});

export type CollaboratorSchemaType = z.infer<typeof CollaboratorSchema>;

export const normalizeSectionOrder = (order?: string[] | null) => {
  const existingOrder = order || DEFAULT_SECTION_ORDER;
  const missingSections = DEFAULT_SECTION_ORDER.filter(
    (section) => !existingOrder.includes(section),
  );
  return [...existingOrder, ...missingSections];
};

export const sortByDateDesc = <
  T extends {
    startYear?: string;
    start?: string;
    year?: string;
    endYear?: string;
    end?: string | null;
  },
>(
  items?: T[],
): T[] => {
  if (!items) return [];
  return [...items].sort((a, b) => {
    const getEndYear = (item: any) => {
      const y = item.endYear || item.end;
      if (y === 'Now' || y === 'Ongoing' || !y) return 9999;
      return parseInt(y) || 0;
    };
    const getStartYear = (item: any) => {
      const y = item.startYear || item.start || item.year;
      if (y === 'Now' || y === 'Ongoing') return 9999;
      return parseInt(y) || 0;
    };

    // Sort by end year first if it exists
    const aEnd = getEndYear(a);
    const bEnd = getEndYear(b);
    if (aEnd !== bEnd) return bEnd - aEnd;

    // Fallback to start year
    return getStartYear(b) - getStartYear(a);
  });
};

// Manual reordering only makes sense as a tie-breaker between entries that
// share the same date, since everything else is auto-sorted by date.
export const getListAdjacency = <
  T extends {
    startYear?: string;
    start?: string;
    year?: string;
    endYear?: string;
    end?: string | null;
  },
>(
  items: T[],
  index: number,
): {
  prevItem: T | null;
  nextItem: T | null;
  canMoveUp: boolean;
  canMoveDown: boolean;
} => {
  const getEndYear = (item: T) => {
    const y = item.endYear || item.end;
    if (y === 'Now' || y === 'Ongoing' || !y) return 9999;
    return parseInt(y) || 0;
  };

  const getStartYear = (item: T) => {
    const y = item.startYear || item.start || item.year;
    if (y === 'Now' || y === 'Ongoing') return 9999;
    return parseInt(y || '0') || 0;
  };

  const prevItem = index > 0 ? items[index - 1] : null;
  const nextItem = index < items.length - 1 ? items[index + 1] : null;
  const currentStart = getStartYear(items[index]);
  const currentEnd = getEndYear(items[index]);

  return {
    prevItem,
    nextItem,
    canMoveUp:
      !!prevItem &&
      getStartYear(prevItem) === currentStart &&
      getEndYear(prevItem) === currentEnd,
    canMoveDown:
      !!nextItem &&
      getStartYear(nextItem) === currentStart &&
      getEndYear(nextItem) === currentEnd,
  };
};

const HeaderSection = z.object({
  name: z.string(),
  shortAbout: z.string().describe('Short description of your profile'),
  location: z
    .string()
    .describe("Location with format 'City, Country'")
    .optional(),
  pronouns: z
    .string()
    .describe("Preferred pronouns (e.g., 'He/Him')")
    .optional(),
  website: z
    .string()
    .describe('Personal website link')
    .optional()
    .refine((val) => !val || isValidWebsite(val), {
      message: 'Enter a valid web address',
    }),
  skills: z
    .array(z.string())
    .describe('Skills used within the different jobs the user has had.'),
});

const SummarySection = z.string().describe('Summary of your profile');

const WorkExperienceSection = z.array(
  z
    .object({
      id: z
        .string()
        .optional()
        .describe('Unique identifier for the work experience'),
      company: z.string().describe('Company name'),
      link: z.string().optional().describe('Company website URL'),
      location: z
        .string()
        .describe(
          "Location with format 'City, Country' or could be Hybrid or Remote",
        ),
      contract: z
        .string()
        .optional()
        .describe('Type of work contract like Full-time, Part-time, Contract'),
      title: z.string().describe('Job title'),
      startMonth: z.string().optional().describe('Start month'),
      start: z.string().describe('Start year'),
      endMonth: z.string().optional().describe('End month'),
      end: z.string().optional().nullable().describe("End year or 'Now'"),
      description: z.string().describe('Job description'),
      hidden: z.boolean().optional().default(false),
      attachments: z.array(AttachmentSchema).optional().default([]),
      collaborators: z.array(CollaboratorSchema).optional().default([]),
    })
    .refine((data) => !isReversedRange(data.start, data.end), {
      message: "End year can't be earlier than the start year",
      path: ['end'],
    }),
);

const EducationSection = z.array(
  z
    .object({
      id: z
        .string()
        .optional()
        .describe('Unique identifier for the education entry'),
      school: z.string().describe('School or university name'),
      degree: z.string().describe('Degree or certification obtained'),
      start: z.string().describe('Start year'),
      end: z.string().describe('End year'),
      link: z.string().optional().describe('Link to the school or program'),
      location: z.string().optional().describe('Location of the school'),
      description: z
        .string()
        .optional()
        .describe('Rich text description of education'),
      hidden: z.boolean().optional().default(false),
      attachments: z.array(AttachmentSchema).optional().default([]),
      collaborators: z.array(CollaboratorSchema).optional().default([]),
    })
    .refine((data) => !isReversedRange(data.start, data.end), {
      message: "End year can't be earlier than the start year",
      path: ['end'],
    }),
);

const ProjectSection = z.array(
  z.object({
    id: z.string().optional().describe('Unique identifier for the project'),
    title: z.string().describe('Project title'),
    year: z.string().describe('Year of the project'),
    company: z.string().optional().describe('Company or client name'),
    link: z.string().optional().describe('Link to project'),
    description: z
      .string()
      .optional()
      .describe('Rich text description of the project'),
    hidden: z.boolean().optional().default(false),
    attachments: z.array(AttachmentSchema).optional().default([]),
    collaborators: z.array(CollaboratorSchema).optional().default([]),
  }),
);

const ContactSection = z.array(
  z.object({
    id: z.string().optional().describe('Unique identifier for the contact'),
    platform: z
      .string()
      .describe('Platform name (e.g., X, LinkedIn, Email, Custom)'),
    link: z.string().describe('URL to profile'),
    hidden: z.boolean().optional().default(false),
  }),
);

const SideProjectSection = z.array(
  z.object({
    id: z
      .string()
      .optional()
      .describe('Unique identifier for the side project'),
    title: z.string().describe('Side project title'),
    year: z.string().describe('Year of the side project'),
    company: z.string().optional().describe('Company or client name'),
    link: z.string().optional().describe('Link to side project'),
    description: z
      .string()
      .optional()
      .describe('Rich text description of the side project'),
    hidden: z.boolean().optional().default(false),
    attachments: z.array(AttachmentSchema).optional().default([]),
    collaborators: z.array(CollaboratorSchema).optional().default([]),
  }),
);

const SpeakingSection = z.array(
  z.object({
    id: z
      .string()
      .optional()
      .describe('Unique identifier for the speaking engagement'),
    title: z.string().describe('Speaking engagement title'),
    year: z.string().describe('Year of the engagement'),
    organization: z.string().optional().describe('Organization or event name'),
    link: z.string().optional().describe('Link to recording or slides'),
    location: z.string().optional().describe('Location or venue name'),
    description: z
      .string()
      .optional()
      .describe('Rich text description of the speaking engagement'),
    hidden: z.boolean().optional().default(false),
    attachments: z.array(AttachmentSchema).optional().default([]),
    collaborators: z.array(CollaboratorSchema).optional().default([]),
  }),
);

const FeaturesSection = z.array(
  z.object({
    id: z.string().optional().describe('Unique identifier for the feature'),
    title: z.string().describe('Feature title'),
    year: z.string().describe('Year of the feature'),
    link: z.string().optional().describe('Link to feature'),
    location: z
      .string()
      .optional()
      .describe('Location or place of the feature'),
    description: z
      .string()
      .optional()
      .describe('Rich text description of the feature'),
    hidden: z.boolean().optional().default(false),
    attachments: z.array(AttachmentSchema).optional().default([]),
    collaborators: z.array(CollaboratorSchema).optional().default([]),
  }),
);

const VolunteeringSection = z.array(
  z
    .object({
      id: z
        .string()
        .optional()
        .describe('Unique identifier for the volunteering engagement'),
      role: z.string().describe('Role or title'),
      organization: z.string().describe('Organization or place'),
      startYear: z.string().describe('Start year'),
      endYear: z.string().describe('End year'),
      location: z.string().optional().describe('Location'),
      link: z.string().optional().describe('Link to organization or role'),
      description: z
        .string()
        .optional()
        .describe('Rich text description of the volunteering engagement'),
      hidden: z.boolean().optional().default(false),
      attachments: z.array(AttachmentSchema).optional().default([]),
      collaborators: z.array(CollaboratorSchema).optional().default([]),
    })
    .refine((data) => !isReversedRange(data.startYear, data.endYear), {
      message: "End year can't be earlier than the start year",
      path: ['endYear'],
    }),
);

const AwardsSection = z.array(
  z.object({
    id: z.string().optional().describe('Unique identifier for the award'),
    title: z.string().describe('Award title'),
    issuer: z.string().describe('Issuer of the award'),
    year: z.string().describe('Year the award was received'),
    link: z.string().optional().describe('Link to the award'),
    description: z.string().optional().describe('Description of the award'),
    hidden: z.boolean().optional().default(false),
    attachments: z.array(AttachmentSchema).optional().default([]),
    collaborators: z.array(CollaboratorSchema).optional().default([]),
  }),
);

const CertificationsSection = z.array(
  z.object({
    id: z
      .string()
      .optional()
      .describe('Unique identifier for the certification'),
    title: z.string().describe('Certification title'),
    issuer: z.string().describe('Issuing organization'),
    year: z.string().describe('Year the certification was received'),
    link: z.string().optional().describe('Link to the certification'),
    description: z
      .string()
      .optional()
      .describe('Description of the certification'),
    hidden: z.boolean().optional().default(false),
    attachments: z.array(AttachmentSchema).optional().default([]),
    collaborators: z.array(CollaboratorSchema).optional().default([]),
  }),
);

const WritingSection = z.array(
  z.object({
    id: z
      .string()
      .optional()
      .describe('Unique identifier for the writing piece'),
    title: z.string().describe('Title of the piece'),
    year: z.string().describe('Year of publication'),
    publication: z.string().optional().describe('Publication or platform name'),
    link: z.string().optional().describe('Link to the piece'),
    description: z.string().optional().describe('Rich text description'),
    hidden: z.boolean().optional().default(false),
    attachments: z.array(AttachmentSchema).optional().default([]),
    collaborators: z.array(CollaboratorSchema).optional().default([]),
  }),
);

const ExhibitionsSection = z.array(
  z.object({
    id: z.string().optional().describe('Unique identifier for the exhibition'),
    title: z.string().describe('Title of the exhibition'),
    year: z.string().describe('Year of the exhibition'),
    organization: z
      .string()
      .optional()
      .describe('Organization or gallery name'),
    location: z.string().optional().describe('Location'),
    link: z.string().optional().describe('Link to the exhibition'),
    description: z
      .string()
      .optional()
      .describe('Rich text description of the exhibition'),
    hidden: z.boolean().optional().default(false),
    attachments: z.array(AttachmentSchema).optional().default([]),
    collaborators: z.array(CollaboratorSchema).optional().default([]),
  }),
);

export const ResumeDataSchema = z.object({
  header: HeaderSection,
  summary: SummarySection,
  workExperience: WorkExperienceSection,
  education: EducationSection,
  projects: ProjectSection.optional().default([]),
  sideProjects: SideProjectSection.optional().default([]),
  speaking: SpeakingSection.optional().default([]),
  writing: WritingSection.optional().default([]),
  exhibitions: ExhibitionsSection.optional().default([]),
  features: FeaturesSection.optional().default([]),
  volunteering: VolunteeringSection.optional().default([]),
  awards: AwardsSection.optional().default([]),
  certifications: CertificationsSection.optional().default([]),
  contacts: ContactSection.optional().default([]),
  // Every page on the resume — the single source of truth for a page's
  // title/slug/content/hidden state. Section items reference pages by id
  // via {id, type:'page'} stubs in their own `attachments` array (see
  // resolveAttachedPages), so the same page can be attached to more than
  // one item.
  pages: z.array(AttachmentSchema).optional().default([]),
  preferences: z
    .object({
      writingEnabled: z.boolean().optional().default(true),
    })
    .optional()
    .default({ writingEnabled: true }),
  sectionOrder: z.array(z.string()).optional().default(DEFAULT_SECTION_ORDER),
  design: z
    .object({
      typography: z.enum(['sans', 'serif', 'mono']).optional().default('sans'),
      theme: z
        .enum([
          'default',
          'brutalist',
          'swiss',
          'klein',
          'red',
          'green',
          'blue',
          'albers',
        ])
        .optional()
        .default('default'),
      hideSocialFeatures: z.boolean().optional().default(false),
      ogImage: z
        .string()
        .optional()
        .describe('Custom Open Graph image URL, must be 1200x630'),
      favicon: z
        .string()
        .optional()
        .describe('Custom favicon URL, must be 32x32'),
    })
    .optional()
    .default({
      typography: 'sans',
      theme: 'default',
      hideSocialFeatures: false,
    }),
});

export type ResumeDataSchemaType = z.infer<typeof ResumeDataSchema>;
