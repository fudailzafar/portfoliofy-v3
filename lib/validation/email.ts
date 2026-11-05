const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/;

export function isValidEmail(input: string): boolean {
  return EMAIL_PATTERN.test(input.trim());
}
