// Shared by the sign-in dialog, the contact field and the server route, so
// they all agree on what a valid address is.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/;
const MAX_EMAIL_LENGTH = 254;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(input: string): boolean {
  const email = input.trim();
  return email.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(email);
}
