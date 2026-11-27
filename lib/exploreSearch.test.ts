import { describe, expect, it } from 'vitest';
import { highlightParts, matchedLine, searchWords } from './exploreSearch';

describe('searchWords', () => {
  it('splits on whitespace and drops empty and repeated words', () => {
    expect(searchWords('  designer   Chennai designer ')).toEqual([
      'designer',
      'Chennai',
    ]);
  });
  it('caps the number and length of words', () => {
    expect(searchWords('a b c d e f g')).toHaveLength(5);
    expect(searchWords('x'.repeat(80))[0]).toHaveLength(50);
  });
  it('is empty for a blank search', () => {
    expect(searchWords('   ')).toEqual([]);
  });
});

describe('matchedLine', () => {
  const user = { shortAbout: 'Product Designer', location: 'Chennai, India' };
  it('shows the title when it matched', () => {
    expect(matchedLine(user, ['design'])).toBe('Product Designer');
  });
  it('shows the location when only it matched', () => {
    expect(matchedLine(user, ['chen'])).toBe('Chennai, India');
  });
  it('shows both when both matched', () => {
    expect(matchedLine(user, ['designer', 'chennai'])).toBe(
      'Product Designer · Chennai, India',
    );
  });
  it('matches the start of a word, not the middle', () => {
    expect(
      matchedLine({ shortAbout: 'AI Engineer', location: 'Chennai' }, ['ai']),
    ).toBe('AI Engineer');
    expect(
      matchedLine({ shortAbout: 'Designer', location: 'Chennai' }, ['ai']),
    ).toBeNull();
    expect(matchedLine({ shortAbout: 'ML | AI', location: null }, ['ai'])).toBe(
      'ML | AI',
    );
  });
  it('is null when only the name or username matched', () => {
    expect(matchedLine(user, ['rohan'])).toBeNull();
    expect(matchedLine({ shortAbout: null, location: null }, ['a'])).toBeNull();
  });
});

describe('highlightParts', () => {
  it('marks the matching pieces, ignoring case', () => {
    expect(highlightParts('Sydney, Australia', ['austr'])).toEqual([
      { text: 'Sydney, ', match: false },
      { text: 'Austr', match: true },
      { text: 'alia', match: false },
    ]);
  });
  it('treats special characters literally', () => {
    expect(highlightParts('C++ (dev)', ['c++', '(dev'])).toEqual([
      { text: 'C++', match: true },
      { text: ' ', match: false },
      { text: '(dev', match: true },
      { text: ')', match: false },
    ]);
  });
  it('marks a match at the very start of the text', () => {
    expect(highlightParts('Designer', ['des'])).toEqual([
      { text: 'Des', match: true },
      { text: 'igner', match: false },
    ]);
  });
  it('returns the text whole when nothing is searched', () => {
    expect(highlightParts('hello', [])).toEqual([
      { text: 'hello', match: false },
    ]);
  });
});
