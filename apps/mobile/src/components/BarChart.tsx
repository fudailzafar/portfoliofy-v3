import { StyleSheet, Text, View } from 'react-native';
import { axisTicks, type Bar } from '@portfoliofy/shared/insights';
import { useTheme } from '@/lib/theme';

const CHART_HEIGHT = 160;

/** Views over time as plain bars: one colour, labelled, and described for screen readers. */
export function BarChart({
  bars,
  label,
  formatLabel,
  summary,
}: {
  bars: Bar[];
  /** The first bar's label formatter gets each bar's start date. */
  label: string;
  formatLabel: (start: string) => string;
  /** A sentence that says what the chart shows, for screen readers. */
  summary: string;
}) {
  const theme = useTheme();
  const max = Math.max(1, ...bars.map((bar) => bar.views));
  const ticks = axisTicks(bars.length, 4);

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${label}. ${summary}`}
      style={styles.chart}
    >
      <View
        style={[
          styles.plot,
          { height: CHART_HEIGHT, borderColor: theme.border },
        ]}
      >
        {bars.map((bar) => (
          <View key={bar.start} style={styles.slot}>
            <View
              style={[
                styles.bar,
                {
                  height: Math.max(
                    bar.views > 0 ? 2 : 0,
                    (bar.views / max) * CHART_HEIGHT,
                  ),
                  backgroundColor: theme.text,
                },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={styles.axis}>
        {ticks.map((index) => (
          <Text
            key={index}
            style={{ color: theme.textMuted, fontSize: 12 }}
            numberOfLines={1}
          >
            {formatLabel(bars[index].start)}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: { gap: 8 },
  plot: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  slot: { flex: 1, justifyContent: 'flex-end' },
  bar: { width: '100%', borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  axis: { flexDirection: 'row', justifyContent: 'space-between' },
});
