/**
 * Shared custom-domain validation and normalization.
 *
 * - `normalizeDomain`: trims and lowercases.
 * - `isValidDomainFormat`: a real hostname — dot-separated labels of
 *   alphanumerics/hyphens (no leading/trailing hyphen per label), at least
 *   one dot (an apex or subdomain needs a TLD), no path/query/whitespace
 *   characters. This is what gets persisted to `users.custom_domain` and
 *   later interpolated into Vercel API URLs, so rejecting anything that
 *   isn't a bare hostname matters beyond just "looks like a domain."
 */

const LABEL = '[a-z0-9](?:[a-z0-9-]*[a-z0-9])?';
const DOMAIN_PATTERN = new RegExp(`^${LABEL}(?:\\.${LABEL})+$`);
const MAX_LENGTH = 253;

export function normalizeDomain(input: string): string {
  return input.trim().toLowerCase();
}

export function isValidDomainFormat(input: string): boolean {
  const v = normalizeDomain(input);
  return v.length > 0 && v.length <= MAX_LENGTH && DOMAIN_PATTERN.test(v);
}
