/**
 * Shared date-range validation used by both the UI and server-side schema.
 *
 * A range is "reversed" (invalid) when:
 *  - `from` and `to` are both numeric years, AND `from > to`
 *
 * "Now" (or blank) for `to` always means ongoing, which is always valid.
 * "Now" for `from` is treated as invalid (can't start in the future).
 */
export function isReversedRange(
  from?: string | null,
  to?: string | null,
): boolean {
  if (!from || !to) return false;
  if (to === 'Now' || to === 'Ongoing') return false; // ongoing end is always fine
  if (from === 'Now' || from === 'Ongoing') return true; // can't start "Now" and end earlier
  const f = Number(from);
  const t = Number(to);
  if (Number.isNaN(f) || Number.isNaN(t)) return false; // non-numeric → don't block
  return f > t;
}
