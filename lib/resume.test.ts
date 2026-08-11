import { describe, it, expect } from 'vitest';
import { ResumeDataSchema } from './resume';

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
