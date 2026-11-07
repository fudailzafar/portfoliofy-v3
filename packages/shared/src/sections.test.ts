import { describe, expect, it } from 'vitest';
import { DEFAULT_SECTION_ORDER, ResumeDataSchema } from './resume';
import {
  countEntries,
  getSection,
  SECTIONS,
  sortEntries,
  yearOptions,
} from './sections';

const YEAR = 2026;

describe('SECTIONS', () => {
  it('covers every list section the editor orders, once', () => {
    const ids = SECTIONS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    // 'skills' and 'contact' are edited on their own screens.
    const expected = DEFAULT_SECTION_ORDER.filter(
      (id) => id !== 'skills' && id !== 'contact',
    );
    expect([...ids].sort()).toEqual([...expected].sort());
  });

  it('uses store keys that exist in the resume schema', () => {
    const keys = Object.keys(ResumeDataSchema.shape);
    for (const section of SECTIONS) {
      expect(keys).toContain(section.storeKey);
    }
  });

  it('only asks for fields the schema allows', () => {
    // Every key a form writes must be a field of that section's entries.
    const empty = ResumeDataSchema.parse({
      header: { name: 'A', shortAbout: '', skills: [] },
      summary: '',
      workExperience: [],
      education: [],
    });
    for (const section of SECTIONS) {
      const entry = section.newEntry(YEAR);
      const parsed = ResumeDataSchema.safeParse({
        ...empty,
        [section.storeKey]: [{ ...entry, id: 'x' }],
      });
      // Empty required fields are fine to fail on, but never for an unknown key.
      if (!parsed.success) {
        const unknown = parsed.error.issues.filter(
          (i) => i.code === 'unrecognized_keys',
        );
        expect(unknown).toEqual([]);
      }
    }
  });

  it.each(SECTIONS.map((s) => [s.id, s] as const))(
    '%s: a blank new entry is not yet valid',
    (_id, section) => {
      expect(section.isValid(section.newEntry(YEAR))).toBe(false);
      expect(section.isValid(null)).toBe(false);
    },
  );

  it.each(SECTIONS.map((s) => [s.id, s] as const))(
    '%s: every field key is on the new entry',
    (_id, section) => {
      const entry = section.newEntry(YEAR);
      for (const field of section.fields) {
        const keys =
          field.kind === 'yearRange'
            ? [field.startKey, field.endKey]
            : [field.key];
        for (const key of keys) {
          // description is optional in the schema, so a form may add it later.
          if (key === 'description') continue;
          expect(Object.keys(entry)).toContain(key);
        }
      }
    },
  );
});

describe('required fields', () => {
  it('projects need a title and year', () => {
    const projects = getSection('projects')!;
    expect(projects.isValid({ title: 'Site', year: '2024' })).toBe(true);
    expect(projects.isValid({ title: '  ', year: '2024' })).toBe(false);
    expect(projects.isValid({ title: 'Site', year: '' })).toBe(false);
  });

  it('awards and certifications also need an issuer', () => {
    for (const id of ['awards', 'certifications']) {
      const section = getSection(id)!;
      expect(section.isValid({ title: 'A', year: '2024', issuer: '' })).toBe(
        false,
      );
      expect(section.isValid({ title: 'A', year: '2024', issuer: 'B' })).toBe(
        true,
      );
    }
  });

  it('work needs a company and a forward date range', () => {
    const work = getSection('work')!;
    expect(work.isValid({ company: 'Acme', start: '2020', end: 'Now' })).toBe(
      true,
    );
    expect(work.isValid({ company: 'Acme', start: '2020', end: '2022' })).toBe(
      true,
    );
    expect(work.isValid({ company: 'Acme', start: '2022', end: '2020' })).toBe(
      false,
    );
    expect(work.isValid({ company: '', start: '2020', end: '2022' })).toBe(
      false,
    );
  });

  it('education and volunteering use their own range keys', () => {
    expect(
      getSection('education')!.isValid({
        school: 'U',
        start: '2010',
        end: '2014',
      }),
    ).toBe(true);
    expect(
      getSection('volunteering')!.isValid({
        organization: 'Org',
        startYear: '2015',
        endYear: '2010',
      }),
    ).toBe(false);
  });
});

describe('describe', () => {
  it('shows a work entry like the website does', () => {
    expect(
      getSection('work')!.describe({
        title: 'Designer',
        company: 'Acme',
        start: '2020',
        end: 'Now',
      }),
    ).toEqual({ title: 'Designer', subtitle: ' at Acme', when: '2020 — Now' });
  });

  it('falls back to the company when there is no title', () => {
    const row = getSection('work')!.describe({
      title: '',
      company: 'Acme',
      start: '2020',
      end: '2021',
    });
    expect(row.title).toBe('Acme');
    expect(row.subtitle).toBeUndefined();
  });
});

describe('helpers', () => {
  it('lists years from this year back to 1980', () => {
    const years = yearOptions(2026);
    expect(years[0]).toBe(2026);
    expect(years.at(-1)).toBe(1980);
    expect(years).toHaveLength(47);
  });

  it('sorts newest first', () => {
    const sorted = sortEntries([
      { id: 'a', year: '2019' },
      { id: 'b', year: '2023' },
    ] as any);
    expect(sorted.map((e: any) => e.id)).toEqual(['b', 'a']);
  });

  it('counts entries, treating a missing list as empty', () => {
    expect(
      countEntries({ projects: [{ id: '1' }] } as any, getSection('projects')!),
    ).toBe(1);
    expect(countEntries({} as any, getSection('awards')!)).toBe(0);
  });
});
