// Set NEXT_PUBLIC_SITE_URL per deployment; moving to a new domain is then
// a config change, not a code change.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://portfoliofy.me';

export const SITE_HOST = new URL(SITE_URL).hostname;

// Wildcard subdomains need a domain we own; *.vercel.app can't have them.
export const SUBDOMAINS_ENABLED =
  SITE_HOST !== 'localhost' && !SITE_HOST.endsWith('.vercel.app');

export type HostKind =
  | { kind: 'main'; hostname: string }
  | { kind: 'subdomain'; hostname: string; username: string }
  | { kind: 'custom'; hostname: string };

/**
 * Classifies a Host header as the main site, a user's subdomain
 * (`username.<site host>` or `username.localhost`), or a custom domain.
 */
export function classifyHost(host: string | null | undefined): HostKind {
  const hostname = (host || '').split(':')[0].toLowerCase();

  if (
    !hostname ||
    hostname === SITE_HOST ||
    hostname === `www.${SITE_HOST}` ||
    hostname === 'localhost' ||
    hostname.endsWith('.vercel.app')
  ) {
    return { kind: 'main', hostname };
  }

  for (const parent of [SITE_HOST, 'localhost']) {
    if (hostname.endsWith(`.${parent}`)) {
      return {
        kind: 'subdomain',
        hostname,
        username: hostname.slice(0, -(parent.length + 1)),
      };
    }
  }

  return { kind: 'custom', hostname };
}
