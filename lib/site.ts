// Canonical site identity, driven by one env var so switching domains later
// (e.g. after the current apex domain lapses and a replacement is bought)
// is a single deployment-config change instead of a re-hunt through the
// codebase for hardcoded 'portfoliofy.me' strings.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://portfoliofy.me';

// Host-only form (no scheme) for UI copy that displays or builds a
// "username.<host>" style string rather than a full URL.
export const SITE_HOST = new URL(SITE_URL).hostname;
