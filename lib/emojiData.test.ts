import { describe, expect, it } from 'vitest';
import {
  loadPickerEmoji,
  searchEmoji,
  withSkinTone,
  type PickerEmoji,
} from './emojiData';

describe('loadPickerEmoji', () => {
  it('keeps emoji before Unicode 13, in order, with skin tones', async () => {
    const list = await loadPickerEmoji();
    expect(list.length).toBeGreaterThan(1500);
    expect(list[0].emoji).toBe('😀');
    // 🥲 (smiling face with tear) arrived in Unicode 13, so it's left out.
    expect(list.some((item) => item.emoji === '🥲')).toBe(false);
    const wave = list.find((item) => item.label === 'waving hand');
    expect(wave?.skins).toHaveLength(5);
  });

  it('returns the same list on a second call', async () => {
    expect(await loadPickerEmoji()).toBe(await loadPickerEmoji());
  });
});

describe('searchEmoji', () => {
  const list: PickerEmoji[] = [
    { emoji: '🔥', label: 'fire', tags: ['flame', 'hot'], skins: null },
    { emoji: '👋', label: 'waving hand', tags: ['hello', 'wave'], skins: null },
  ];

  it('matches names and tags, ignoring case and spaces', () => {
    expect(searchEmoji(list, 'FIRE').map((e) => e.emoji)).toEqual(['🔥']);
    expect(searchEmoji(list, ' hot ').map((e) => e.emoji)).toEqual(['🔥']);
    expect(searchEmoji(list, 'hello').map((e) => e.emoji)).toEqual(['👋']);
  });

  it('returns everything for an empty search and nothing for no match', () => {
    expect(searchEmoji(list, '')).toHaveLength(2);
    expect(searchEmoji(list, 'zebra')).toHaveLength(0);
  });
});

describe('withSkinTone', () => {
  const wave: PickerEmoji = {
    emoji: '👋',
    label: 'waving hand',
    tags: [],
    skins: ['👋🏻', '👋🏼', '👋🏽', '👋🏾', '👋🏿'],
  };

  it('maps the cycle (default, darkest … lightest) to the right emoji', () => {
    expect(withSkinTone(wave, 0)).toBe('👋');
    expect(withSkinTone(wave, 1)).toBe('👋🏿');
    expect(withSkinTone(wave, 5)).toBe('👋🏻');
  });

  it('leaves emoji without tones alone', () => {
    const fire = { ...wave, emoji: '🔥', skins: null };
    expect(withSkinTone(fire, 3)).toBe('🔥');
  });
});
