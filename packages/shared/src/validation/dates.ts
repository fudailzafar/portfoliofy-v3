// Whether a year range runs backwards. An empty or "Now" end is ongoing and
// always valid; a "Now" start is invalid.
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
