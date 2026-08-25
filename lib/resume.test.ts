import { describe, it, expect } from 'vitest';
import {
  ResumeDataSchema,
  getListAdjacency,
  findPageBySlug,
  getUsedPageSlugs,
  slugify,
  dedupeSlug,
  estimateReadMinutes,
} from './resume';

const baseResume = {
  header: { name: 'Test User', shortAbout: 'Tester', skills: [] },
  summary: '',
  workExperience: [],
  education: [],
};

describe('ResumeDataSchema — website field', () => {
  it('rejects a value with no dot in the hostname', () => {
    const result = ResumeDataSchema.safeParse({
      ...baseResume,
      header: { ...baseResume.header, website: 'notavalidurl' },
    });
    expect(result.success).toBe(false);
  });

  it('accepts a proper URL', () => {
    const result = ResumeDataSchema.safeParse({
      ...baseResume,
      header: { ...baseResume.header, website: 'https://example.com' },
    });
    expect(result.success).toBe(true);
  });

  it('accepts an empty/missing website', () => {
    const result = ResumeDataSchema.safeParse(baseResume);
    expect(result.success).toBe(true);
  });
});

describe('ResumeDataSchema — date-range validation', () => {
  it('rejects a work experience entry with end year before start year', () => {
    const result = ResumeDataSchema.safeParse({
      ...baseResume,
      workExperience: [
        {
          company: 'Acme',
          location: 'Remote',
          title: 'Engineer',
          start: '2026',
          end: '2020',
          description: 'desc',
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('accepts a work experience entry with a valid range', () => {
    const result = ResumeDataSchema.safeParse({
      ...baseResume,
      workExperience: [
        {
          company: 'Acme',
          location: 'Remote',
          title: 'Engineer',
          start: '2020',
          end: '2026',
          description: 'desc',
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('accepts an ongoing work experience entry ("Now")', () => {
    const result = ResumeDataSchema.safeParse({
      ...baseResume,
      workExperience: [
        {
          company: 'Acme',
          location: 'Remote',
          title: 'Engineer',
          start: '2020',
          end: 'Now',
          description: 'desc',
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects an education entry with end year before start year', () => {
    const result = ResumeDataSchema.safeParse({
      ...baseResume,
      education: [
        {
          school: 'Test University',
          degree: 'BSc',
          start: '2026',
          end: '2020',
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a volunteering entry with end year before start year', () => {
    const result = ResumeDataSchema.safeParse({
      ...baseResume,
      volunteering: [
        {
          role: 'Helper',
          organization: 'Test Org',
          startYear: '2026',
          endYear: '2020',
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});

describe('getListAdjacency', () => {
  it('allows moving between entries with the same year', () => {
    const items = [{ year: '2024' }, { year: '2024' }, { year: '2023' }];
    expect(getListAdjacency(items, 0)).toMatchObject({
      canMoveUp: false,
      canMoveDown: true,
    });
    expect(getListAdjacency(items, 1)).toMatchObject({
      canMoveUp: true,
      canMoveDown: false,
    });
  });

  it('blocks moving into an entry with a different year', () => {
    const items = [{ year: '2024' }, { year: '2023' }];
    expect(getListAdjacency(items, 0)).toMatchObject({
      canMoveUp: false,
      canMoveDown: false,
    });
  });

  it('resolves the date field via startYear, then start, then year', () => {
    const items = [{ start: '2020' }, { start: '2020' }];
    expect(getListAdjacency(items, 0).canMoveDown).toBe(true);

    const startYearItems = [{ startYear: '2019' }, { startYear: '2019' }];
    expect(getListAdjacency(startYearItems, 0).canMoveDown).toBe(true);
  });

  it('returns null neighbors at the array boundaries', () => {
    const items = [{ year: '2024' }];
    const result = getListAdjacency(items, 0);
    expect(result.prevItem).toBeNull();
    expect(result.nextItem).toBeNull();
  });
});

describe('findPageBySlug / getUsedPageSlugs', () => {
  const pageAttachment = {
    id: 'page-1',
    url: 'https://example.com/thumb.png',
    type: 'page' as const,
    title: 'My Deep Dive',
    slug: 'my-deep-dive',
    content: '<p>hello</p>',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  const resumeWithPage = {
    ...baseResume,
    workExperience: [
      {
        id: 'work-1',
        company: 'Acme',
        location: 'Remote',
        title: 'Engineer',
        start: '2020',
        end: 'Now',
        description: 'desc',
        attachments: [pageAttachment],
      },
    ],
  };

  it('finds a page by its slug and reports the owning item', () => {
    const found = findPageBySlug(resumeWithPage as any, 'my-deep-dive');
    expect(found).toMatchObject({
      sectionKey: 'workExperience',
      itemId: 'work-1',
    });
    expect(found?.page.id).toBe('page-1');
  });

  it('returns undefined for a slug that does not exist', () => {
    expect(findPageBySlug(resumeWithPage as any, 'nope')).toBeUndefined();
  });

  it('returns undefined for empty resume data or slug', () => {
    expect(findPageBySlug(null, 'my-deep-dive')).toBeUndefined();
    expect(findPageBySlug(resumeWithPage as any, '')).toBeUndefined();
  });

  it('collects every used slug, excluding a given attachment id', () => {
    const used = getUsedPageSlugs(resumeWithPage as any);
    expect(used.has('my-deep-dive')).toBe(true);

    const usedExcludingSelf = getUsedPageSlugs(resumeWithPage as any, 'page-1');
    expect(usedExcludingSelf.has('my-deep-dive')).toBe(false);
  });
});

describe('slugify / dedupeSlug', () => {
  it('lowercases, hyphenates, and trims', () => {
    expect(slugify('  My Deep Dive!! ')).toBe('my-deep-dive');
    expect(slugify('Hello   World')).toBe('hello-world');
    expect(slugify('---leading and trailing---')).toBe('leading-and-trailing');
  });

  it('returns the base slug unchanged when unused', () => {
    expect(dedupeSlug('hello-world', new Set())).toBe('hello-world');
  });

  it('appends -2, -3, etc. on collision', () => {
    const used = new Set(['hello-world', 'hello-world-2']);
    expect(dedupeSlug('hello-world', used)).toBe('hello-world-3');
  });

  it('treats a reserved slug as a collision', () => {
    expect(dedupeSlug('og', new Set())).toBe('og-2');
  });

  it('falls back to "untitled" for an empty base', () => {
    expect(dedupeSlug('', new Set())).toBe('untitled');
  });
});

describe('estimateReadMinutes', () => {
  it('strips HTML before counting words', () => {
    const html = '<p>' + Array(200).fill('word').join(' ') + '</p>';
    expect(estimateReadMinutes(html)).toBe(1);
  });

  it('rounds up to the next minute', () => {
    const html = Array(201).fill('word').join(' ');
    expect(estimateReadMinutes(html)).toBe(2);
  });

  it('never returns less than 1 minute, even for empty content', () => {
    expect(estimateReadMinutes('')).toBe(1);
    expect(estimateReadMinutes('<p></p>')).toBe(1);
  });

  it('matches the read.cv-derived 200-words-per-minute formula', () => {
    const html = Array(650).fill('word').join(' ');
    expect(estimateReadMinutes(html)).toBe(4); // ceil(650 / 200)
  });
});
