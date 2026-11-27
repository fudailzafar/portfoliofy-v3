export const MAX_SEARCH_WORDS = 5;
export const MAX_WORD_LENGTH = 50;

/** The words of a search, deduplicated and capped. */
export function searchWords(query: string): string[] {
  const seen = new Set<string>();
  const words: string[] = [];
  for (const raw of query.split(/\s+/)) {
    const word = raw.slice(0, MAX_WORD_LENGTH);
    const key = word.toLowerCase();
    if (!word || seen.has(key)) continue;
    seen.add(key);
    words.push(word);
    if (words.length === MAX_SEARCH_WORDS) break;
  }
  return words;
}

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** A word counts when it starts at the beginning of the text or after a non-letter. */
const startOfWord = (words: string[]) =>
  new RegExp(`(?<![\\p{L}\\p{N}])(${words.map(escapeRegex).join('|')})`, 'giu');

const has = (text: string | null | undefined, words: string[]) =>
  !!text && words.length > 0 && startOfWord(words).test(text);

/**
 * What to show under a name while searching: their title if it matched, their
 * location if that matched, both when both did. Null when only the name or
 * username matched, so the row falls back to its usual second line.
 */
export function matchedLine(
  user: { shortAbout: string | null; location: string | null },
  words: string[],
): string | null {
  const title = user.shortAbout?.trim() || '';
  const place = user.location?.trim() || '';
  const parts = [has(title, words) && title, has(place, words) && place].filter(
    (part): part is string => !!part,
  );
  return parts.length ? parts.join(' · ') : null;
}

/** Splits text into pieces, marking the ones that match a searched word. */
export function highlightParts(
  text: string,
  words: string[],
): { text: string; match: boolean }[] {
  const real = words.filter(Boolean);
  if (!real.length) return [{ text, match: false }];
  return (
    text
      .split(startOfWord(real))
      // split() alternates text and matches, so mark them before dropping empties.
      .map((piece, i) => ({ text: piece, match: i % 2 === 1 }))
      .filter((part) => part.text !== '')
  );
}
