import { useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  bucketSeries,
  formatDate,
  formatDay,
  type PageViewRange,
  peakBar,
  RANGE_LABELS,
} from '@portfoliofy/shared/insights';
import { BarChart } from '@/components/BarChart';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { SelectField } from '@/components/SelectField';
import { api } from '@/lib/api';
import { useTheme } from '@/lib/theme';

const RANGE_OPTIONS = (Object.keys(RANGE_LABELS) as PageViewRange[]).map(
  (value) => ({ label: RANGE_LABELS[value], value }),
);

export default function Insights() {
  const theme = useTheme();
  const [range, setRange] = useState<PageViewRange>('week');
  const [source, setSource] = useState<'portfoliofy' | 'custom'>('portfoliofy');

  const insights = useQuery({
    queryKey: ['insights', range, source],
    queryFn: () => api.getInsights(range, source),
  });

  const data = insights.data;
  // About one bar per week or day is readable on a phone; more is summed.
  const bars = data ? bucketSeries(data.series, range === 'week' ? 7 : 30) : [];
  const peak = peakBar(bars);
  const spansDays = bars.some((bar) => bar.start !== bar.end);
  const formatLabel =
    spansDays || range === 'year' || range === 'all' ? formatDate : formatDay;

  const sourceOptions = [
    { label: 'Portfoliofy profile', value: 'portfoliofy' },
    ...(data?.hasCustomDomain && data.customDomain
      ? [{ label: data.customDomain, value: 'custom' }]
      : []),
  ];

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Insights',
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.text,
          headerShadowVisible: false,
        }}
      />

      <View style={styles.filters}>
        <SelectField
          label="Range"
          value={range}
          options={RANGE_OPTIONS}
          onChange={(value) => setRange(value as PageViewRange)}
        />
        <SelectField
          label="Source"
          value={source}
          options={sourceOptions}
          onChange={(value) => setSource(value as 'portfoliofy' | 'custom')}
        />
      </View>

      {insights.isPending ? (
        <Text style={{ color: theme.textMuted, fontSize: 14 }}>Loading…</Text>
      ) : insights.isError ? (
        <View style={styles.error}>
          <Text style={{ color: theme.danger, fontSize: 14 }}>
            We could not load your insights.
          </Text>
          <Button title="Try again" onPress={() => insights.refetch()} />
        </View>
      ) : (
        <>
          <Text style={[styles.total, { color: theme.text }]}>
            {data!.total.toLocaleString()} page{' '}
            {data!.total === 1 ? 'view' : 'views'}
          </Text>
          {bars.length === 0 || data!.total === 0 ? (
            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 14,
                lineHeight: 22,
              }}
            >
              No views in this period yet. Share your profile to get some.
            </Text>
          ) : (
            <>
              <BarChart
                bars={bars}
                label="Page views over time"
                formatLabel={formatLabel}
                summary={`${data!.total} views in total${
                  peak
                    ? `, most on ${formatDate(peak.start)}${peak.start === peak.end ? '' : ` to ${formatDate(peak.end)}`} with ${peak.views}`
                    : ''
                }.`}
              />
              {peak ? (
                <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
                  Busiest: {formatDate(peak.start)}
                  {peak.start === peak.end ? '' : ` to ${formatDate(peak.end)}`}
                  {' — '}
                  {peak.views.toLocaleString()}{' '}
                  {peak.views === 1 ? 'view' : 'views'}
                </Text>
              ) : null}
            </>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', gap: 12 },
  total: { fontSize: 20, fontWeight: '500', fontVariant: ['tabular-nums'] },
  error: { gap: 12 },
});
