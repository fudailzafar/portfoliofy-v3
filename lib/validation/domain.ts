// Domains are stored and interpolated into Vercel API URLs, so only a bare
// hostname is accepted.

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
