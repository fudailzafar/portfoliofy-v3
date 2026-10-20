import { describe, it, expect } from 'vitest';
import {
  hashPagePassword,
  toOwnerResume,
  toPublicResume,
  verifyPagePassword,
  withStoredPagePasswords,
} from './pagePasswords';
import { isRedactedPage, type ResumeDataSchemaType } from '@/lib/resume';

const page = (overrides: Record<string, unknown> = {}) => ({
  id: 'p1',
  type: 'page' as const,
  slug: 'case-study',
  title: 'Secret project',
  content: '<p>Under NDA</p>',
  url: 'https://bucket.s3.amazonaws.com/thumb.png',
  createdAt: '2026-01-01T00:00:00.000Z',
  hidden: false,
  isBlurred: false,
  ...overrides,
});

const resumeWith = (pages: ReturnType<typeof page>[]) =>
  ({ pages }) as unknown as ResumeDataSchemaType;

describe('hashPagePassword / verifyPagePassword', () => {
  it('accepts the right password and rejects others', () => {
    const hash = hashPagePassword('hunter22');
    expect(hash.startsWith('scrypt$')).toBe(true);
    expect(hash).not.toContain('hunter22');
    expect(verifyPagePassword('hunter22', hash)).toBe(true);
    expect(verifyPagePassword('hunter2', hash)).toBe(false);
    expect(verifyPagePassword('', hash)).toBe(false);
  });

  it('salts every hash', () => {
    expect(hashPagePassword('same')).not.toBe(hashPagePassword('same'));
  });

  it('rejects malformed stored values', () => {
    expect(verifyPagePassword('x', 'not-a-hash')).toBe(false);
    expect(verifyPagePassword('x', 'md5$aa$bb')).toBe(false);
  });
});

describe('toPublicResume', () => {
  it('reduces a locked page to a stub with no title, content or thumbnail', () => {
    const [locked] = toPublicResume(
      resumeWith([page({ passwordHash: hashPagePassword('pw12') })]),
    )!.pages!;
    expect(locked).toEqual({
      id: 'p1',
      type: 'page',
      slug: 'case-study',
      createdAt: '2026-01-01T00:00:00.000Z',
      hidden: false,
      isBlurred: false,
      passwordProtected: true,
    });
    expect(JSON.stringify(locked)).not.toMatch(/NDA|Secret|thumb|scrypt/);
    expect(isRedactedPage(locked)).toBe(true);
  });

  it('leaves open pages intact', () => {
    const [open] = toPublicResume(resumeWith([page()]))!.pages!;
    expect(open.title).toBe('Secret project');
    expect(open.content).toBe('<p>Under NDA</p>');
    expect(open.passwordProtected).toBe(false);
    expect(isRedactedPage(open)).toBe(false);
  });
});

describe('toOwnerResume', () => {
  it('keeps content but swaps the hash for a flag', () => {
    const [owned] = toOwnerResume(
      resumeWith([page({ passwordHash: hashPagePassword('pw12') })]),
    )!.pages!;
    expect(owned.content).toBe('<p>Under NDA</p>');
    expect(owned.passwordProtected).toBe(true);
    expect(owned).not.toHaveProperty('passwordHash');
    expect(isRedactedPage(owned)).toBe(false);
  });
});

describe('withStoredPagePasswords', () => {
  const stored = resumeWith([page({ passwordHash: 'scrypt$aa$bb' })]);

  it('keeps the stored hash when the client sends none', () => {
    const [saved] = withStoredPagePasswords(
      resumeWith([page({ passwordProtected: true })]),
      stored,
    )!.pages!;
    expect(saved.passwordHash).toBe('scrypt$aa$bb');
    expect(saved).not.toHaveProperty('passwordProtected');
  });

  it('ignores a hash forged by the client', () => {
    const [saved] = withStoredPagePasswords(
      resumeWith([page({ id: 'p2', passwordHash: 'scrypt$forged$x' })]),
      stored,
    )!.pages!;
    expect(saved).not.toHaveProperty('passwordHash');
  });

  it('drops the hash of a deleted page', () => {
    expect(withStoredPagePasswords(resumeWith([]), stored)!.pages).toEqual([]);
  });
});
