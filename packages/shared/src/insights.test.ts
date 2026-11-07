import { describe, expect, it } from 'vitest';
import {
  axisTicks,
  bucketSeries,
  formatDate,
  formatDay,
  peakBar,
} from './insights';

const days = (n: number, views = 1) =>
  Array.from({ length: n }, (_, i) => ({
    date: `2026-01-${String(i + 1).padStart(2, '0')}`,
    views: views + i,
  }));

describe('bucketSeries', () => {
  it('keeps one bar per day when the series is short', () => {
    const bars = bucketSeries(days(7), 30);
    expect(bars).toHaveLength(7);
    expect(bars[0]).toEqual({
      start: '2026-01-01',
      end: '2026-01-01',
      views: 1,
    });
  });

  it('sums days into at most the number of bars asked for', () => {
    const series = days(28);
    const bars = bucketSeries(series, 7);
    expect(bars.length).toBeLessThanOrEqual(7);
    expect(bars.reduce((sum, bar) => sum + bar.views, 0)).toBe(
      series.reduce((sum, day) => sum + day.views, 0),
    );
    expect(bars[0].start).toBe('2026-01-01');
    expect(bars.at(-1)!.end).toBe('2026-01-28');
  });

  it('does not lose the leftover days at the end', () => {
    const bars = bucketSeries(days(10), 3); // groups of 4: 4, 4, 2
    expect(bars.map((b) => b.end)).toEqual([
      '2026-01-04',
      '2026-01-08',
      '2026-01-10',
    ]);
  });

  it('handles nothing to draw', () => {
    expect(bucketSeries([], 10)).toEqual([]);
    expect(bucketSeries(days(3), 0)).toEqual([]);
  });
});

describe('peakBar', () => {
  it('finds the busiest bar, and none when there were no views', () => {
    expect(peakBar(bucketSeries(days(5), 5))!.start).toBe('2026-01-05');
    expect(
      peakBar(
        bucketSeries(
          days(5, 0).map((d) => ({ ...d, views: 0 })),
          5,
        ),
      ),
    ).toBeNull();
    expect(peakBar([])).toBeNull();
  });
});

describe('dates', () => {
  it('formats a day without shifting it across time zones', () => {
    expect(formatDay('2026-03-01')).toMatch(/Sun/);
    expect(formatDay('2026-03-01')).toMatch(/1/);
    expect(formatDate('2026-03-01')).toMatch(/Mar/);
    expect(formatDate('2026-03-01')).toMatch(/2026/);
  });
});

describe('axisTicks', () => {
  it('spreads labels evenly, including the first and last', () => {
    expect(axisTicks(7, 4)).toEqual([0, 2, 4, 6]);
    expect(axisTicks(10, 4)).toEqual([0, 3, 6, 9]);
  });

  it('never repeats a label on a short axis', () => {
    expect(axisTicks(2, 4)).toEqual([0, 1]);
    expect(axisTicks(1, 4)).toEqual([0]);
    expect(axisTicks(0, 4)).toEqual([]);
  });
});
