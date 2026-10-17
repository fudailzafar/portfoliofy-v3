// Format only; availability and reserved names are checked server-side.

const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
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
