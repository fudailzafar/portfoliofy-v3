/**
 * Shared username validation and normalization.
 *
 * - `normalizeUsername`: trims and lowercases, so "Bob" and "bob" are always
 *   the same value before they ever reach a uniqueness check or the DB.
 * - `isValidUsernameFormat`: lowercase letters, numbers, and hyphens only,
 *   2-30 characters. Doesn't check availability or reserved words — see
 *   lib/server/dbActions.ts for those.
 */

const USERNAME_PATTERN = /^[a-z0-9-]+$/;
const MIN_LENGTH = 2;
const MAX_LENGTH = 30;

export function normalizeUsername(input: string): string {
  return input.trim().toLowerCase();
}

export function isValidUsernameFormat(input: string): boolean {
  const v = normalizeUsername(input);
  return (
    v.length >= MIN_LENGTH && v.length <= MAX_LENGTH && USERNAME_PATTERN.test(v)
  );
}
