// What the profile editor offers for each list section: its fields, what makes
// an entry complete, and how it shows in a list. It mirrors the website's
// editor tabs, so the website and the mobile app ask for the same things.

import { sortByDateDesc } from './resume';
import type { ResumeDataSchemaType } from './resume';
import { isReversedRange } from './validation/dates';

export type ListStoreKey =
  | 'workExperience'
  | 'education'
  | 'projects'
  | 'sideProjects'
  | 'speaking'
  | 'writing'
  | 'exhibitions'
  | 'features'
  | 'volunteering'
  | 'awards'
  | 'certifications';

export type SectionId =
  | 'work'
  | 'education'
  | 'projects'
  | 'side_projects'
  | 'speaking'
  | 'writing'
  | 'exhibitions'
  | 'features'
  | 'volunteering'
  | 'awards'
  | 'certifications';

/** One input in an entry's form, in the order it is shown. */
export type SectionField =
  | {
      kind: 'text' | 'url';
      key: string;
      label: string;
      placeholder?: string;
    }
  | { kind: 'year'; key: string; label: string }
  | {
      /** Two year pickers; the end may be "Now". */
      kind: 'yearRange';
      startKey: string;
      endKey: string;
      startLabel: string;
      endLabel: string;
    }
  | { kind: 'richText'; key: string; label: string };

export type Entry = Record<string, any>;

export interface EntryRow {
  /** The main line. */
  title: string;
  /** Shown after the title, e.g. "at Acme inc.". */
  subtitle?: string;
  /** The date or year, shown beside the entry. */
  when?: string;
}

export interface SectionConfig {
  id: SectionId;
  storeKey: ListStoreKey;
  label: string;
  /** "a project", for button and confirmation text. */
  singular: string;
  addLabel: string;
  emptyLabel: string;
  fields: SectionField[];
  newEntry: (currentYear: number) => Entry;
  isValid: (entry: Entry | null | undefined) => boolean;
  describe: (entry: Entry) => EntryRow;
}

const has = (value: unknown) =>
  typeof value === 'string' && value.trim() !== '';

const text = (
  key: string,
  label: string,
  placeholder?: string,
): SectionField => ({
  kind: 'text',
  key,
  label,
  placeholder,
});
const url = (key: string, label: string): SectionField => ({
  kind: 'url',
  key,
  label,
  placeholder: 'https://example.com',
});
const year = (): SectionField => ({
  kind: 'year',
  key: 'year',
  label: 'Year*',
});
const description = (label = 'Description'): SectionField => ({
  kind: 'richText',
  key: 'description',
  label,
});

const hasTitleAndYear = (e?: Entry | null) => has(e?.title) && has(e?.year);

export const SECTIONS: SectionConfig[] = [
  {
    id: 'projects',
    storeKey: 'projects',
    label: 'Projects',
    singular: 'project',
    addLabel: 'Add project',
    emptyLabel: "Add a work project you're proud of",
    fields: [
      text('title', 'Title*', 'My Great Project'),
      year(),
      text('company', 'Company or client', 'Acme inc.'),
      url('link', 'Link to project'),
      description(),
    ],
    newEntry: (y) => ({
      title: '',
      year: String(y),
      company: '',
      link: '',
      description: '',
    }),
    isValid: hasTitleAndYear,
    describe: (e) => ({
      title: e.title,
      subtitle: e.company && ` for ${e.company}`,
      when: e.year,
    }),
  },
  {
    id: 'side_projects',
    storeKey: 'sideProjects',
    label: 'Side Projects',
    singular: 'side project',
    addLabel: 'Add side project',
    emptyLabel: "Add a side project you're proud of",
    fields: [
      text('title', 'Title*', 'My Side-Project'),
      year(),
      text('company', 'Company or client', 'Acme inc.'),
      url('link', 'Link to side-project'),
      description(),
    ],
    newEntry: (y) => ({
      title: '',
      year: String(y),
      company: '',
      link: '',
      description: '',
    }),
    isValid: hasTitleAndYear,
    describe: (e) => ({
      title: e.title,
      subtitle: e.company && ` for ${e.company}`,
      when: e.year,
    }),
  },
  {
    id: 'exhibitions',
    storeKey: 'exhibitions',
    label: 'Exhibitions',
    singular: 'exhibition',
    addLabel: 'Add exhibition',
    emptyLabel: 'Add an exhibition you were in',
    fields: [
      text('title', 'Exhibition title*', 'My great show'),
      year(),
      text('organization', 'Organization', 'The Vancouver Art Gallery'),
      text('location', 'Location', 'City or country'),
      url('link', 'URL'),
      description(),
    ],
    newEntry: (y) => ({
      title: '',
      year: String(y),
      organization: '',
      link: '',
      location: '',
      description: '',
    }),
    isValid: hasTitleAndYear,
    describe: (e) => ({
      title: e.title,
      subtitle: e.organization && ` at ${e.organization}`,
      when: e.year,
    }),
  },
  {
    id: 'speaking',
    storeKey: 'speaking',
    label: 'Speaking',
    singular: 'talk',
    addLabel: 'Add talk',
    emptyLabel: "Add a talk you've given",
    fields: [
      text('title', 'Talk title*', 'My great talk'),
      year(),
      text('organization', 'Event', 'SXSW'),
      text('location', 'Location', 'City or country'),
      url('link', 'URL'),
      description(),
    ],
    newEntry: (y) => ({
      title: '',
      year: String(y),
      organization: '',
      link: '',
      location: '',
      description: '',
    }),
    isValid: hasTitleAndYear,
    describe: (e) => ({
      title: e.title,
      subtitle: e.organization && ` at ${e.organization}`,
      when: e.year,
    }),
  },
  {
    id: 'writing',
    storeKey: 'writing',
    label: 'Writing',
    singular: 'piece',
    addLabel: 'Add writing',
    emptyLabel: "Add something great you've written",
    fields: [
      text('title', 'Title*', 'My great piece'),
      year(),
      text('publication', 'Publication', 'Jacobin Magazine'),
      url('link', 'Link'),
      description(),
    ],
    newEntry: (y) => ({
      title: '',
      year: String(y),
      publication: '',
      link: '',
      description: '',
    }),
    isValid: hasTitleAndYear,
    describe: (e) => ({
      title: e.title,
      subtitle: e.publication && ` in ${e.publication}`,
      when: e.year,
    }),
  },
  {
    id: 'awards',
    storeKey: 'awards',
    label: 'Awards',
    singular: 'award',
    addLabel: 'Add award',
    emptyLabel: 'Add an award you received',
    fields: [
      text('title', 'Title*', 'My great award'),
      year(),
      text('issuer', 'Issuer*', 'Apple'),
      url('link', 'Link to award'),
      description(),
    ],
    newEntry: (y) => ({
      title: '',
      issuer: '',
      year: String(y),
      link: '',
      description: '',
    }),
    isValid: (e) => hasTitleAndYear(e) && has(e?.issuer),
    describe: (e) => ({
      title: e.title,
      subtitle: e.issuer && ` from ${e.issuer}`,
      when: e.year,
    }),
  },
  {
    id: 'features',
    storeKey: 'features',
    label: 'Features',
    singular: 'feature',
    addLabel: 'Add feature',
    emptyLabel: 'Add a feature',
    fields: [
      text('title', 'Thing done*', 'My great feature'),
      year(),
      text('location', 'Where', 'The Verge'),
      url('link', 'Link to feature'),
      description(),
    ],
    newEntry: (y) => ({
      title: '',
      year: String(y),
      link: '',
      location: '',
      description: '',
    }),
    isValid: hasTitleAndYear,
    describe: (e) => ({
      title: e.title,
      subtitle: e.location && ` in ${e.location}`,
      when: e.year,
    }),
  },
  {
    id: 'work',
    storeKey: 'workExperience',
    label: 'Work Experience',
    singular: 'workplace',
    addLabel: 'Add workplace',
    emptyLabel: "Add a job you've had",
    fields: [
      {
        kind: 'yearRange',
        startKey: 'start',
        endKey: 'end',
        startLabel: 'From*',
        endLabel: 'To*',
      },
      text('title', 'Title', 'Architect, painter, etc'),
      text('company', 'Company*', 'Acme inc.'),
      text('location', 'Location', 'Where was it'),
      url('link', 'URL'),
      description(),
    ],
    newEntry: (y) => ({
      company: '',
      title: '',
      startMonth: '',
      start: String(y),
      endMonth: '',
      end: 'Now',
      location: '',
      link: '',
      contract: '',
      description: '',
    }),
    isValid: (e) =>
      has(e?.company) &&
      has(e?.start) &&
      has(e?.end) &&
      !isReversedRange(e?.start, e?.end),
    describe: (e) => ({
      title: e.title || e.company,
      subtitle: e.title && e.company ? ` at ${e.company}` : undefined,
      when: `${e.start} — ${e.end}`,
    }),
  },
  {
    id: 'volunteering',
    storeKey: 'volunteering',
    label: 'Volunteering',
    singular: 'volunteering entry',
    addLabel: 'Add volunteering',
    emptyLabel: 'Add volunteering',
    fields: [
      {
        kind: 'yearRange',
        startKey: 'startYear',
        endKey: 'endYear',
        startLabel: 'From*',
        endLabel: 'To*',
      },
      text('role', 'Role', 'Volunteer'),
      text('organization', 'Organization*', 'Acme inc.'),
      text('location', 'Location', 'City or country'),
      url('link', 'URL'),
      description(),
    ],
    newEntry: (y) => ({
      role: '',
      organization: '',
      startYear: String(y),
      endYear: 'Now',
      location: '',
      link: '',
      description: '',
    }),
    isValid: (e) =>
      has(e?.organization) &&
      has(e?.startYear) &&
      has(e?.endYear) &&
      !isReversedRange(e?.startYear, e?.endYear),
    describe: (e) => ({
      title: e.role || e.organization,
      subtitle: e.role && e.organization ? ` at ${e.organization}` : undefined,
      when: `${e.startYear} — ${e.endYear}`,
    }),
  },
  {
    id: 'education',
    storeKey: 'education',
    label: 'Education',
    singular: 'school',
    addLabel: 'Add school',
    emptyLabel: 'Add a school you attended',
    fields: [
      {
        kind: 'yearRange',
        startKey: 'start',
        endKey: 'end',
        startLabel: 'From*',
        endLabel: 'To*',
      },
      text('degree', 'Degree or certification', 'Bachelor of Design'),
      text('school', 'School or institution*', 'Emily Carr University'),
      text('location', 'Location', 'Where was it'),
      url('link', 'URL'),
      description(),
    ],
    newEntry: (y) => ({
      school: '',
      degree: '',
      start: String(y),
      end: 'Now',
      location: '',
      link: '',
      description: '',
    }),
    isValid: (e) =>
      has(e?.school) &&
      has(e?.start) &&
      has(e?.end) &&
      !isReversedRange(e?.start, e?.end),
    describe: (e) => ({
      title: e.degree || e.school,
      subtitle: e.degree && e.school ? ` at ${e.school}` : undefined,
      when: `${e.start} — ${e.end}`,
    }),
  },
  {
    id: 'certifications',
    storeKey: 'certifications',
    label: 'Certifications',
    singular: 'certification',
    addLabel: 'Add certification',
    emptyLabel: 'Add a certification you received',
    fields: [
      text('title', 'Title*', 'My certification'),
      year(),
      text('issuer', 'Issuer*', 'Issuing organization'),
      url('link', 'Link to certification'),
      description(),
    ],
    newEntry: (y) => ({
      title: '',
      issuer: '',
      year: String(y),
      link: '',
      description: '',
    }),
    isValid: (e) => hasTitleAndYear(e) && has(e?.issuer),
    describe: (e) => ({
      title: e.title,
      subtitle: e.issuer && ` from ${e.issuer}`,
      when: e.year,
    }),
  },
];

const BY_ID = new Map<string, SectionConfig>(SECTIONS.map((s) => [s.id, s]));

export function getSection(id: string): SectionConfig | undefined {
  return BY_ID.get(id);
}

/** Years to pick from: this year back to 1980, as on the website. */
export function yearOptions(currentYear: number): number[] {
  return Array.from(
    { length: currentYear - 1980 + 1 },
    (_, i) => currentYear - i,
  );
}

/** An entry's list order: newest first, as the website shows them. */
export function sortEntries<T extends Entry>(entries: T[]): T[] {
  return sortByDateDesc(entries as any) as T[];
}

/** How many entries a section has, for the editor's section list. */
export function countEntries(
  resume: Pick<ResumeDataSchemaType, ListStoreKey>,
  section: SectionConfig,
): number {
  return resume[section.storeKey]?.length ?? 0;
}
