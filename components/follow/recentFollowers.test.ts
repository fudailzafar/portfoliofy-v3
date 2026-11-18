import { describe, expect, it } from 'vitest';
import { recentFollowersSentence } from './recentFollowers';

const ana = { name: 'Ana', username: 'ana' };
const ben = { name: 'Ben', username: 'ben' };
const cy = { name: 'Cy', username: 'cy' };
const dee = { name: 'Dee', username: 'dee' };

const text = (parts: ReturnType<typeof recentFollowersSentence>) =>
  parts.map((p) => (typeof p === 'string' ? p : p.name)).join('');

describe('recentFollowersSentence', () => {
  it('handles nobody, one and two people', () => {
    expect(text(recentFollowersSentence([]))).toBe(
      'No one has followed you yet.',
    );
    expect(text(recentFollowersSentence([ana]))).toBe(
      'Ana followed you recently.',
    );
    expect(text(recentFollowersSentence([ana, ben]))).toBe(
      'Ana and Ben followed you recently.',
    );
  });

  it('counts the rest as other person or people', () => {
    expect(text(recentFollowersSentence([ana, ben, cy]))).toBe(
      'Ana, Ben, and 1 other person followed you recently.',
    );
    expect(text(recentFollowersSentence([ana, ben, cy, dee]))).toBe(
      'Ana, Ben, and 2 other people followed you recently.',
    );
  });
});
