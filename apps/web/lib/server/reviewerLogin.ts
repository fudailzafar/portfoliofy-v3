import { createHash, timingSafeEqual } from 'node:crypto';

// Google Play's reviewers can't read an inbox, so one fixed address can sign
// in with a fixed code instead. Both come from the environment; if either is
// missing, or the code is too short to resist guessing, the feature is off.
const MIN_CODE_LENGTH = 16;

function config(): { email: string; code: string } | null {
  const email = process.env.REVIEWER_EMAIL?.trim().toLowerCase();
  const code = process.env.REVIEWER_CODE;
  if (!email || !code || code.length < MIN_CODE_LENGTH) return null;
  return { email, code };
}

export function isReviewerEmail(email: string): boolean {
  const reviewer = config();
  return !!reviewer && reviewer.email === email;
}

function digest(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

/** Compares digests so neither the length nor the content leaks through timing. */
export function isReviewerCode(email: string, code: string): boolean {
  const reviewer = config();
  if (!reviewer || reviewer.email !== email) return false;
  return timingSafeEqual(digest(reviewer.code), digest(code));
}
