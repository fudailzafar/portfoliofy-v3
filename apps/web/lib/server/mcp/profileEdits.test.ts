import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SECTION_ORDER,
  ResumeDataSchemaType,
} from '@portfoliofy/shared/resume';
import {
  addItem,
  createDraft,
  EditError,
  itemFieldNames,
  removeItem,
  reorderSections,
  setPagePublished,
  updateItem,
  updatePage,
} from './profileEdits';

const job = {
  id: 'job-1',
  company: 'Acme',
  location: 'Remote',
  title: 'Designer',
  start: '2024',
  description: 'Design',
  hidden: false,
  attachments: [{ id: 'page-1', type: 'page' }],
  collaborators: [],
};

const page = {
  id: 'page-1',
  type: 'page',
  title: 'Hello world',
  slug: 'hello-world',
  content: '<p>Hi</p>',
  hidden: true,
  isBlurred: false,
  passwordHash: 'stored-hash',
};

const data = {
  header: { name: 'A', shortAbout: 'B', skills: [] },
  summary: '',
  workExperience: [job],
  education: [],
  pages: [page],
} as unknown as ResumeDataSchemaType;

describe('item edits', () => {
  it('lists editable fields, not the app-managed ones', () => {
    const fields = itemFieldNames('workExperience');
    expect(fields).toContain('company');
    expect(fields).not.toContain('id');
    expect(fields).not.toContain('attachments');
  });

  it('adds a valid item with the given id, ignoring a supplied one', () => {
    const next = addItem(
      data,
      'workExperience',
      { ...job, id: 'chosen-by-ai', company: 'Globex' },
      'new-id',
    );
    expect(next.workExperience).toHaveLength(2);
    expect(next.workExperience[1]).toMatchObject({
      id: 'new-id',
      company: 'Globex',
      attachments: [],
    });
  });

  it('explains what is wrong with an invalid item', () => {
    expect(() =>
      addItem(data, 'workExperience', { company: 'Globex' }, 'new-id'),
    ).toThrow(EditError);
    expect(() =>
      addItem(
        data,
        'workExperience',
        { ...job, start: '2024', end: '2020' },
        'x',
      ),
    ).toThrow("End year can't be earlier");
  });

  it('merges updates and keeps links to other records', () => {
    const next = updateItem(data, 'workExperience', 'job-1', {
      title: 'Lead Designer',
      attachments: [],
      id: 'other',
    });
    expect(next.workExperience[0]).toMatchObject({
      id: 'job-1',
      title: 'Lead Designer',
      attachments: [{ id: 'page-1', type: 'page' }],
    });
  });

  it('removes an item, and rejects unknown ids', () => {
    expect(removeItem(data, 'workExperience', 'job-1').workExperience).toEqual(
      [],
    );
    expect(() => removeItem(data, 'workExperience', 'nope')).toThrow(EditError);
    expect(() =>
      updateItem(data, 'workExperience', 'nope', { title: 'x' }),
    ).toThrow(EditError);
  });

  it('does not change the original profile', () => {
    addItem(data, 'workExperience', { ...job }, 'new-id');
    expect(data.workExperience).toHaveLength(1);
  });
});

describe('reorderSections', () => {
  it('moves named sections first and keeps every section', () => {
    const { sectionOrder } = reorderSections(data, ['work', 'skills']);
    expect(sectionOrder.slice(0, 2)).toEqual(['work', 'skills']);
    expect([...sectionOrder].sort()).toEqual([...DEFAULT_SECTION_ORDER].sort());
  });

  it('rejects unknown sections', () => {
    expect(() => reorderSections(data, ['nonsense'])).toThrow(EditError);
  });
});

describe('page edits', () => {
  const now = new Date('2026-11-04T00:00:00Z');

  it('creates an unpublished draft with a unique slug', () => {
    const next = createDraft(
      data,
      { title: 'Hello World', content: '<p>x</p>' },
      'page-2',
      now,
    );
    expect(next.pages?.[1]).toMatchObject({
      id: 'page-2',
      type: 'page',
      hidden: true,
      slug: 'hello-world-2',
    });
  });

  it('updates only what was given and keeps the password', () => {
    const next = updatePage(data, 'page-1', { title: 'New title' });
    expect(next.pages?.[0]).toMatchObject({
      title: 'New title',
      content: '<p>Hi</p>',
      slug: 'hello-world',
      passwordHash: 'stored-hash',
    });
  });

  it('publishes and unpublishes', () => {
    const published = setPagePublished(data, 'page-1', true);
    expect(published.pages?.[0].hidden).toBe(false);
    expect(setPagePublished(published, 'page-1', false).pages?.[0].hidden).toBe(
      true,
    );
    expect(() => setPagePublished(data, 'nope', true)).toThrow(EditError);
  });
});
