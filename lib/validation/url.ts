export function normalizeWebsite(input: string): string {
  const v = input.trim();
  if (!v) return '';
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

export function isValidWebsite(input: string): boolean {
  const v = normalizeWebsite(input);
  if (!v) return true; // empty is allowed — field is optional
  try {
    const u = new URL(v);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
    // Require a dotted hostname with no spaces (e.g. "example.com")
    return /^[^\s]+\.[^\s]+$/.test(u.hostname);
  } catch {
    return false;
  }
}
