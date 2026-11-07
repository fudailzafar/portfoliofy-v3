import { describe, it, expect, afterEach } from 'vitest';
import { isReviewerCode, isReviewerEmail } from './reviewerLogin';

const CODE = 'a-long-random-reviewer-code';

function configure(email: string | undefined, code: string | undefined) {
  if (email === undefined) delete process.env.REVIEWER_EMAIL;
  else process.env.REVIEWER_EMAIL = email;
  if (code === undefined) delete process.env.REVIEWER_CODE;
  else process.env.REVIEWER_CODE = code;
}

describe('reviewer login', () => {
  afterEach(() => configure(undefined, undefined));

  it('is off when nothing is configured', () => {
    expect(isReviewerEmail('reviewer@example.com')).toBe(false);
    expect(isReviewerCode('reviewer@example.com', CODE)).toBe(false);
  });

  it('is off when only one value is set', () => {
    configure('reviewer@example.com', undefined);
    expect(isReviewerEmail('reviewer@example.com')).toBe(false);
    configure(undefined, CODE);
    expect(isReviewerEmail('reviewer@example.com')).toBe(false);
  });

  it('is off when the code is too short to resist guessing', () => {
    configure('reviewer@example.com', '123456');
    expect(isReviewerEmail('reviewer@example.com')).toBe(false);
    expect(isReviewerCode('reviewer@example.com', '123456')).toBe(false);
  });

  it('recognises only the configured address', () => {
    configure('Reviewer@Example.com', CODE);
    expect(isReviewerEmail('reviewer@example.com')).toBe(true);
    expect(isReviewerEmail('someone@example.com')).toBe(false);
  });

  it('accepts the right code and rejects everything else', () => {
    configure('reviewer@example.com', CODE);
    expect(isReviewerCode('reviewer@example.com', CODE)).toBe(true);
    expect(isReviewerCode('reviewer@example.com', `${CODE}x`)).toBe(false);
    expect(isReviewerCode('reviewer@example.com', '')).toBe(false);
  });

  it('never accepts the code for a different address', () => {
    configure('reviewer@example.com', CODE);
    expect(isReviewerCode('someone@example.com', CODE)).toBe(false);
  });
});
