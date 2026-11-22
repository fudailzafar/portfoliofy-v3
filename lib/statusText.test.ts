import { describe, expect, it } from 'vitest';
import { linkify, parseStatusText } from './statusText';

describe('linkify', () => {
  it('links http and www addresses and leaves trailing punctuation', () => {
    expect(linkify('see https://a.com/x, and www.b.org.')).toEqual([
      { type: 'text', text: 'see ' },
      { type: 'link', text: 'https://a.com/x', href: 'https://a.com/x' },
      { type: 'text', text: ', and ' },
      { type: 'link', text: 'www.b.org', href: 'https://www.b.org' },
      { type: 'text', text: '.' },
    ]);
  });

  it('leaves plain text alone', () => {
    expect(linkify('no links here')).toEqual([
      { type: 'text', text: 'no links here' },
    ]);
  });
});

describe('parseStatusText', () => {
  it('groups bullets and numbers and keeps paragraphs', () => {
    const blocks = parseStatusText(
      'Shipping:\n* one\n- two\n\n1. first\n2. second\nDone',
    );
    expect(blocks.map((b) => b.type)).toEqual([
      'paragraph',
      'bullets',
      'numbers',
      'paragraph',
    ]);
    expect(blocks[1].type === 'bullets' && blocks[1].items.length).toBe(2);
    expect(blocks[2].type === 'numbers' && blocks[2].start).toBe(1);
  });

  it('treats a single line as one paragraph', () => {
    expect(parseStatusText('just vibing')).toEqual([
      { type: 'paragraph', lines: [[{ type: 'text', text: 'just vibing' }]] },
    ]);
  });
});
