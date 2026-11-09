import { describe, expect, it } from 'vitest';
import {
  buildItemContext,
  buildStatusContext,
  isEmojiOnly,
  ReportSchema,
  SendReplySchema,
  toExcerpt,
} from './replies';
import type { ResumeData } from '@/lib/server/dbActions';

const resume = {
  workExperience: [
    {
      id: 'w1',
      title: 'Cofounder',
      company: 'Read.cv',
      start: '2021',
      end: 'Now',
      description: '<p>Built <strong>profiles</strong> &amp; pages.</p>',
      hidden: false,
    },
    {
      id: 'w2',
      title: 'Secret job',
      company: 'X',
      start: '2020',
      hidden: true,
    },
  ],
  projects: [
    {
      id: 'p1',
      title: 'ChamCham UX Writing',
      company: 'ChamCham',
      year: '2022',
    },
    { id: 'p2', title: '   ', year: '2020' },
  ],
  volunteering: [
    {
      id: 'v1',
      role: 'Mentor',
      organization: 'Code Club',
      startYear: '2019',
      endYear: '2019',
    },
  ],
} as unknown as ResumeData;

describe('isEmojiOnly', () => {
  it('detects single and multiple emoji', () => {
    expect(isEmojiOnly('🔥')).toBe(true);
    expect(isEmojiOnly('🔥 👍')).toBe(true);
    expect(isEmojiOnly('  🤩  ')).toBe(true);
  });

  it('detects emoji built from joiners, skin tones and flags', () => {
    expect(isEmojiOnly('👨‍👩‍👧')).toBe(true);
    expect(isEmojiOnly('👍🏽')).toBe(true);
    expect(isEmojiOnly('🇮🇳')).toBe(true);
    expect(isEmojiOnly('❤️')).toBe(true);
  });

  it('treats text, digits and mixed messages as text', () => {
    expect(isEmojiOnly('')).toBe(false);
    expect(isEmojiOnly('   ')).toBe(false);
    expect(isEmojiOnly('hello')).toBe(false);
    expect(isEmojiOnly('123')).toBe(false);
    expect(isEmojiOnly('great work 🔥')).toBe(false);
    expect(isEmojiOnly('‍')).toBe(false); // a lone joiner is not an emoji
  });
});

describe('toExcerpt', () => {
  it('strips tags and decodes entities', () => {
    expect(
      toExcerpt('<p>Built <strong>profiles</strong> &amp; pages.</p>'),
    ).toBe('Built profiles & pages.');
  });

  it('keeps paragraph breaks as spaces', () => {
    expect(toExcerpt('<p>One</p><p>Two</p>')).toBe('One Two');
  });

  it('truncates long text with an ellipsis', () => {
    const out = toExcerpt('a'.repeat(500), 50)!;
    expect(out.length).toBe(50);
    expect(out.endsWith('…')).toBe(true);
  });

  it('returns null for empty input', () => {
    expect(toExcerpt(null)).toBeNull();
    expect(toExcerpt('<p> </p>')).toBeNull();
  });
});

describe('buildItemContext', () => {
  it('quotes a work item with title, company and year range', () => {
    expect(buildItemContext(resume, 'workExperience', 'w1')).toEqual({
      kind: 'item',
      section: 'workExperience',
      itemId: 'w1',
      title: 'Cofounder',
      subtitle: 'Read.cv',
      year: '2021 — Now',
      excerpt: 'Built profiles & pages.',
    });
  });

  it('quotes a project by year', () => {
    expect(buildItemContext(resume, 'projects', 'p1')).toMatchObject({
      title: 'ChamCham UX Writing',
      subtitle: 'ChamCham',
      year: '2022',
      excerpt: null,
    });
  });

  it('uses the role and organization for volunteering, with one year if equal', () => {
    expect(buildItemContext(resume, 'volunteering', 'v1')).toMatchObject({
      title: 'Mentor',
      subtitle: 'Code Club',
      year: '2019',
    });
  });

  it('refuses hidden, missing and untitled items', () => {
    expect(buildItemContext(resume, 'workExperience', 'w2')).toBeNull();
    expect(buildItemContext(resume, 'workExperience', 'nope')).toBeNull();
    expect(buildItemContext(resume, 'projects', 'p2')).toBeNull();
    expect(buildItemContext(resume, 'education', 'w1')).toBeNull();
    expect(buildItemContext(null, 'projects', 'p1')).toBeNull();
  });
});

describe('buildStatusContext', () => {
  it('keeps what is set and drops blanks', () => {
    expect(buildStatusContext('🏃', 'always running')).toEqual({
      kind: 'status',
      emoji: '🏃',
      text: 'always running',
    });
    expect(buildStatusContext(null, 'text only')).toEqual({
      kind: 'status',
      emoji: null,
      text: 'text only',
    });
  });

  it('returns null when there is no status', () => {
    expect(buildStatusContext('', '  ')).toBeNull();
    expect(buildStatusContext(undefined, null)).toBeNull();
  });
});

describe('SendReplySchema', () => {
  it('trims the body and accepts an item target', () => {
    const parsed = SendReplySchema.parse({
      username: 'andy',
      body: '  Great work  ',
      target: { kind: 'item', section: 'projects', itemId: 'p1' },
    });
    expect(parsed.body).toBe('Great work');
  });

  it('accepts a status target and no target', () => {
    expect(
      SendReplySchema.safeParse({
        username: 'a',
        body: '🔥',
        target: { kind: 'status' },
      }).success,
    ).toBe(true);
    expect(
      SendReplySchema.safeParse({ username: 'a', body: '🔥' }).success,
    ).toBe(true);
  });

  it('rejects empty, whitespace-only and oversized messages', () => {
    expect(SendReplySchema.safeParse({ username: 'a', body: '' }).success).toBe(
      false,
    );
    expect(
      SendReplySchema.safeParse({ username: 'a', body: '   ' }).success,
    ).toBe(false);
    expect(
      SendReplySchema.safeParse({ username: 'a', body: 'x'.repeat(2001) })
        .success,
    ).toBe(false);
    expect(
      SendReplySchema.safeParse({ username: 'a', body: 'x'.repeat(2000) })
        .success,
    ).toBe(true);
  });

  it('rejects a section that cannot be replied to', () => {
    expect(
      SendReplySchema.safeParse({
        username: 'a',
        body: 'hi',
        target: { kind: 'item', section: 'contacts', itemId: '1' },
      }).success,
    ).toBe(false);
  });
});

describe('ReportSchema', () => {
  const conversationId = '3f2b8c1e-5d4a-4e6b-9c7d-1a2b3c4d5e6f';

  it('accepts a known reason', () => {
    expect(
      ReportSchema.safeParse({ conversationId, reason: 'spam' }).success,
    ).toBe(true);
  });

  it('rejects an unknown reason, a bad id and long details', () => {
    expect(
      ReportSchema.safeParse({ conversationId, reason: 'rude' }).success,
    ).toBe(false);
    expect(
      ReportSchema.safeParse({ conversationId: 'x', reason: 'spam' }).success,
    ).toBe(false);
    expect(
      ReportSchema.safeParse({
        conversationId,
        reason: 'spam',
        details: 'x'.repeat(1001),
      }).success,
    ).toBe(false);
  });
});
