import { describe, expect, it } from 'vitest';
import { shortenLinkText, shortenLinksInText, shortenUrl } from './displayUrl';

describe('shortenUrl', () => {
  it('drops the scheme, www and trailing slash', () => {
    expect(shortenUrl('https://www.example.com/')).toBe('example.com');
    expect(shortenUrl('http://example.com/a')).toBe('example.com/a');
  });
  it('cuts long addresses to 25 characters and an ellipsis', () => {
    expect(shortenUrl('https://nts.live/shows/the-do-your-thing')).toBe(
      'nts.live/shows/the-do-you…',
    );
  });
  it('leaves an address of exactly 25 characters alone', () => {
    expect(shortenUrl('abcdefghij.com/1234567890')).toBe(
      'abcdefghij.com/1234567890',
    );
  });
});

describe('shortenLinkText', () => {
  it('drops https and www even from short addresses, keeping the full text for print', () => {
    expect(
      shortenLinkText('<a href="https://a.co">https://www.a.co/</a>'),
    ).toBe(
      '<a href="https://a.co"><span class="print:hidden">a.co</span><span class="hidden print:inline">https://www.a.co/</span></a>',
    );
  });
  it('shortens links whose text is an address', () => {
    const html =
      '<p><a href="https://nts.live/shows/the-do-your-thing" target="_blank">https://nts.live/shows/the-do-your-thing</a></p>';
    expect(shortenLinkText(html)).toBe(
      '<p><a href="https://nts.live/shows/the-do-your-thing" target="_blank"><span class="print:hidden">nts.live/shows/the-do-you…</span><span class="hidden print:inline">https://nts.live/shows/the-do-your-thing</span></a></p>',
    );
  });
  it('leaves links with words as their text', () => {
    const html = '<a href="https://example.com/long/path">my portfolio</a>';
    expect(shortenLinkText(html)).toBe(html);
  });
  it('keeps ampersands escaped', () => {
    expect(
      shortenLinkText(
        '<a href="x">https://e.com/?a=1&amp;b=2&amp;c=3&amp;d=4&amp;e=5&amp;f=6</a>',
      ),
    ).toBe(
      '<a href="x"><span class="print:hidden">e.com/?a=1&amp;b=2&amp;c=3&amp;d=4&amp;e=…</span><span class="hidden print:inline">https://e.com/?a=1&amp;b=2&amp;c=3&amp;d=4&amp;e=5&amp;f=6</span></a>',
    );
  });
  it('returns html without links unchanged', () => {
    expect(shortenLinkText('<p>hello</p>')).toBe('<p>hello</p>');
  });
});

describe('shortenLinksInText', () => {
  it('shortens addresses inside plain text', () => {
    expect(
      shortenLinksInText(
        'Happy Monday — https://www.nts.live/shows/the-do-your-thing',
      ),
    ).toBe('Happy Monday — nts.live/shows/the-do-you…');
  });
  it('leaves text without addresses alone', () => {
    expect(shortenLinksInText('just words')).toBe('just words');
  });
});
