import { describe, it, expect } from 'vitest';
import { ResumeDataSchema, getListAdjacency } from './resume';

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
