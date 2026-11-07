import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/server/rateLimit';
import { createLoginToken, normalizeEmail } from '@/lib/server/emailAuth';
import { isReviewerCode } from '@/lib/server/reviewerLogin';

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;

// Trades the reviewer's fixed code for a one-time login token, which the
// client then passes to the same "email-link" sign-in as an emailed link.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = normalizeEmail(String(body?.email ?? ''));
  const code = String(body?.code ?? '');

  const attempts = await checkRateLimit(
    `reviewer-code:${getClientIp(request)}`,
    MAX_ATTEMPTS,
    WINDOW_MS,
  );
  if (!attempts.allowed) {
    return NextResponse.json(
      { error: 'Too many attempts, try again in a few minutes.' },
      { status: 429 },
    );
  }

  if (!isReviewerCode(email, code)) {
    return NextResponse.json(
      { error: 'That code is incorrect.' },
      { status: 401 },
    );
  }

  return NextResponse.json({ token: await createLoginToken(email) });
}
