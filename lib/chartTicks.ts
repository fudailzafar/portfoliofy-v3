/**
 * Round, evenly spaced whole-number ticks for a count axis that starts at 0.
 * The top tick is the first step multiple at or above `max`, so the highest
 * point always sits inside the chart. Aims for about 4 intervals.
 */
export function niceCountTicks(max: number): { top: number; ticks: number[] } {
  const target = Math.max(Math.ceil(Number.isFinite(max) ? max : 0), 1);
  const rough = target / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const step = Math.max(
    1,
    [1, 2, 5, 10].map((m) => m * magnitude).find((s) => s >= rough) ?? 1,
  );
  const top = Math.ceil(target / step) * step;
  const ticks: number[] = [];
  for (let value = 0; value <= top; value += step) ticks.push(value);
  return { top, ticks };
}
