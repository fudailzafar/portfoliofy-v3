'use client';

import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type PageViewRange = 'week' | 'month' | 'year' | 'all';

const RANGE_LABELS: Record<PageViewRange, string> = {
  week: 'Last week',
  month: 'Last month',
  year: 'Last year',
  all: 'All time',
};

interface InsightsData {
  total: number;
  series: { date: string; views: number }[];
  hasCustomDomain: boolean;
  customDomain: string | null;
}

// Matches the reference chart's fixed background grid: 3 equal-width
// columns followed by one half-width column (3.5 units total), independent
// of how many data points/date ticks are actually plotted. Expressed as the
// fraction of the plot width where each column *starts* — column 1 starts
// at the plot's own left edge (0), so only fractions 2/3/4 correspond to an
// actual drawn gridline.
const GRID_COLUMN_START_FRACTIONS = [0, 2 / 7, 4 / 7, 6 / 7];

const verticalGridGenerator = ({
  offset,
}: {
  offset: { left: number; width: number };
}) => {
  const { left, width } = offset;
  return GRID_COLUMN_START_FRACTIONS.slice(1).map((f) => left + f * width);
};

// The X-axis tick under each gridline (including the plot's left edge) —
// not the true last data point, which falls inside the final half-column
// rather than at a column boundary.
const gridColumnTickIndices = (length: number) => {
  if (length <= 1) return [0];
  return Array.from(
    new Set(
      GRID_COLUMN_START_FRACTIONS.map((f) => Math.round(f * (length - 1))),
    ),
  );
};

const formatAxisDate = (value: string) => {
  // `value` is a plain "YYYY-MM-DD" string from the API — parse the parts
  // directly rather than via `new Date(value)` so the displayed day never
  // shifts by one due to UTC/local timezone parsing ambiguity.
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
  });
};

export function InsightsTab() {
  const [range, setRange] = useState<PageViewRange>('week');
  const [domain, setDomain] = useState<'portfoliofy' | 'custom'>('portfoliofy');
  const [data, setData] = useState<InsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    fetch(`/api/insights?range=${range}&domain=${domain}`)
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [range, domain]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col">
      <div className="mb-8 flex items-center justify-between border-b border-border-subtle pb-4">
        <h2 className="text-xl font-bold text-content-primary sm:text-2xl">
          Insights
        </h2>
      </div>

      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-[20px] font-medium text-content-primary">
            {isLoading ? '—' : (data?.total ?? 0)} page views
          </h3>

          <div className="flex items-center gap-2">
            <Select
              value={domain}
              onValueChange={(value) =>
                setDomain(value as 'portfoliofy' | 'custom')
              }
              disabled={!data?.hasCustomDomain}
            >
              <SelectTrigger className="h-9 w-[160px] bg-transparent text-content-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="portfoliofy">Portfoliofy profile</SelectItem>
                {data?.hasCustomDomain && (
                  <SelectItem value="custom">{data.customDomain}</SelectItem>
                )}
              </SelectContent>
            </Select>

            <Select
              value={range}
              onValueChange={(value) => setRange(value as PageViewRange)}
            >
              <SelectTrigger className="h-9 w-[130px] bg-transparent text-content-primary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(RANGE_LABELS) as PageViewRange[]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {RANGE_LABELS[key]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="h-[300px] w-full overflow-hidden rounded-2xl border border-border-subtle bg-surface-card p-4">
          {data?.series?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.series}
                margin={{ top: 10, right: 12, left: 0, bottom: 8 }}
              >
                <defs>
                  <linearGradient
                    id="pageViewsFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#0A78EB" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#0A78EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="currentColor"
                  className="text-border-subtle"
                  verticalCoordinatesGenerator={verticalGridGenerator}
                />
                <XAxis
                  dataKey="date"
                  ticks={gridColumnTickIndices(data.series.length).map(
                    (i) => data.series[i].date,
                  )}
                  tickFormatter={formatAxisDate}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  padding={{ left: 16, right: 16 }}
                  className="fill-content-muted text-[12px]"
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                  className="fill-content-muted text-[12px]"
                />
                <Tooltip
                  formatter={(value) => [String(value ?? 0), 'Views']}
                  labelFormatter={(label) =>
                    typeof label === 'string' ? formatAxisDate(label) : label
                  }
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--surface-1)',
                    color: 'var(--content-primary)',
                    fontSize: 13,
                  }}
                />
                <Area
                  type="linear"
                  dataKey="views"
                  stroke="#0A78EB"
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  fill="url(#pageViewsFill)"
                  isAnimationActive
                  animationDuration={900}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-[13px] text-content-muted">
              {isLoading ? 'Loading…' : 'No views yet'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
