import { describe, expect, it } from 'vitest';
import { niceCountTicks } from './chartTicks';

describe('niceCountTicks', () => {
  it('shows 0 and 1 for an empty or single-view chart', () => {
    expect(niceCountTicks(0)).toEqual({ top: 1, ticks: [0, 1] });
    expect(niceCountTicks(1)).toEqual({ top: 1, ticks: [0, 1] });
  });

  it('uses whole-number steps for small counts', () => {
    expect(niceCountTicks(3)).toEqual({ top: 3, ticks: [0, 1, 2, 3] });
    expect(niceCountTicks(7)).toEqual({ top: 8, ticks: [0, 2, 4, 6, 8] });
  });

  it('rounds up to a round top for larger counts', () => {
    expect(niceCountTicks(46)).toEqual({ top: 60, ticks: [0, 20, 40, 60] });
    expect(niceCountTicks(179)).toEqual({
      top: 200,
      ticks: [0, 50, 100, 150, 200],
    });
  });

  it('always covers the maximum', () => {
    for (const max of [2, 9, 13, 99, 101, 1234, 9647]) {
      const { top, ticks } = niceCountTicks(max);
      expect(top).toBeGreaterThanOrEqual(max);
      expect(ticks[ticks.length - 1]).toBe(top);
      expect(ticks.length).toBeLessThanOrEqual(7);
    }
  });

  it('ignores a non-finite maximum', () => {
    expect(niceCountTicks(Number.NaN)).toEqual({ top: 1, ticks: [0, 1] });
  });
});
