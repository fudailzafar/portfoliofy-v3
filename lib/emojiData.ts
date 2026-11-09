// Emoji for the picker, loaded on first use so it costs nothing until then.
// Same source and rules as read.cv's picker: emojibase data, emoji before
// Unicode 13 only, searchable by name or tag, five skin tones.

export interface PickerEmoji {
  emoji: string;
  label: string;
  tags: string[];
  /** The five toned versions, lightest first, when the emoji has them. */
  skins: string[] | null;
}

type RawEmoji = {
  emoji: string;
  label: string;
  tags?: string[];
  order?: number;
  version: number;
  skins?: { emoji: string }[];
};

let cache: Promise<PickerEmoji[]> | null = null;

export function loadPickerEmoji(): Promise<PickerEmoji[]> {
  cache ??= import('emojibase-data/en/data.json').then((module) => {
    const raw = (module.default ?? module) as unknown as RawEmoji[];
    return raw
      .filter((item) => item.order !== undefined && item.version < 13)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((item) => ({
        emoji: item.emoji,
        label: item.label,
        tags: item.tags ?? [],
        skins: item.skins?.map((skin) => skin.emoji) ?? null,
      }));
  });
  // A failed load can be tried again next time the picker opens.
  cache.catch(() => {
    cache = null;
  });
  return cache;
}

/** Matches read.cv: a name or tag containing the search, lower case. */
export function searchEmoji(list: PickerEmoji[], query: string): PickerEmoji[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter(
    (item) =>
      item.label.includes(q) || item.tags.some((tag) => tag.includes(q)),
  );
}

// The skin-tone button cycles through these, as on read.cv: default, then
// darkest to lightest.
export const SKIN_TONE_PREVIEWS = ['✌️', '✌🏿', '✌🏾', '✌🏽', '✌🏼', '✌🏻'];

/** The emoji to insert for a skin-tone choice (0 = default yellow). */
export function withSkinTone(item: PickerEmoji, tone: number): string {
  if (tone === 0 || !item.skins) return item.emoji;
  // Choice 1 is the darkest tone, the last of the five.
  return item.skins[5 - tone] ?? item.emoji;
}
