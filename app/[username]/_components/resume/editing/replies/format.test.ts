import { describe, expect, it } from 'vitest';
import { displayName, shortTime } from './format';

const NOW = new Date('2026-11-09T12:00:00Z').getTime();
const ago = (seconds: number) => new Date(NOW - seconds * 1000).toISOString();

describe('shortTime', () => {
  it('says "Just now" for under a minute, including a clock that runs slightly ahead', () => {
    expect(shortTime(ago(5), NOW)).toBe('Just now');
    expect(shortTime(ago(-30), NOW)).toBe('Just now');
  });

  it('counts minutes, hours and days', () => {
    expect(shortTime(ago(60), NOW)).toBe('1m');
    expect(shortTime(ago(59 * 60), NOW)).toBe('59m');
    expect(shortTime(ago(3 * 3600), NOW)).toBe('3h');
    expect(shortTime(ago(26 * 3600), NOW)).toBe('1d');
    expect(shortTime(ago(6 * 86400), NOW)).toBe('6d');
  });

  it('switches to a date after a week', () => {
    expect(shortTime(ago(8 * 86400), NOW)).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
  });
});

describe('displayName', () => {
  it('prefers the name and falls back to the username', () => {
    expect(displayName({ name: 'John S', username: 'johns' })).toBe('John S');
    expect(displayName({ name: '  ', username: 'johns' })).toBe('johns');
    expect(displayName({ name: null, username: 'johns' })).toBe('johns');
  });
});
