// Page-view figures for the Insights screens.

export type PageViewRange = 'week' | 'month' | 'year' | 'all';

export const RANGE_LABELS: Record<PageViewRange, string> = {
  week: 'Last week',
  month: 'Last month',
  year: 'Last year',
  all: 'All time',
};

export interface DayViews {
  /** "YYYY-MM-DD" */
  date: string;
  views: number;
}

export interface Insights {
  total: number;
  series: DayViews[];
  hasCustomDomain: boolean;
  customDomain: string | null;
}

export interface Bar {
  /** First day the bar covers, "YYYY-MM-DD". */
  start: string;
  /** Last day the bar covers. */
  end: string;
  views: number;
}

/**
 * Groups days into at most `maxBars` bars, summing their views, so a year of
 * data still draws as a readable chart. Short series stay one bar per day.
 */
export function bucketSeries(series: DayViews[], maxBars: number): Bar[] {
  if (series.length === 0 || maxBars < 1) return [];
  const size = Math.ceil(series.length / maxBars);
  const bars: Bar[] = [];
  for (let i = 0; i < series.length; i += size) {
    const days = series.slice(i, i + size);
    bars.push({
      start: days[0].date,
      end: days[days.length - 1].date,
      views: days.reduce((sum, day) => sum + day.views, 0),
    });
  }
  return bars;
}

/** The bar with the most views, if any views were recorded at all. */
export function peakBar(bars: Bar[]): Bar | null {
  let peak: Bar | null = null;
  for (const bar of bars) {
    if (bar.views > 0 && (!peak || bar.views > peak.views)) peak = bar;
  }
  return peak;
}

/** "Mon 3" for a "YYYY-MM-DD" date, built by hand: new Date() can shift the day. */
export function formatDay(value: string, locale = 'en-US'): string {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
  });
}

/** "3 Nov 2026" style, for ranges that span more than a week. */
export function formatDate(value: string, locale = 'en-US'): string {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Indices for about `count` evenly spaced labels along an axis of `length` bars. */
export function axisTicks(length: number, count: number): number[] {
  if (length <= 0) return [];
  if (length === 1 || count <= 1) return [0];
  const ticks = new Set<number>();
  for (let i = 0; i < count; i++) {
    ticks.add(Math.round((i * (length - 1)) / (count - 1)));
  }
  return [...ticks];
}
