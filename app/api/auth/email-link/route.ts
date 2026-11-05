import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/server/rateLimit';
import {
  buildLoginLink,
  createLoginToken,
  isValidEmail,
  normalizeEmail,
  sendLoginEmail,
} from '@/lib/server/emailAuth';

const IP_MAX_REQUESTS = 10;
const EMAIL_MAX_REQUESTS = 3;
const WINDOW_MS = 10 * 60 * 1000;

// Lives under /api/auth so proxy.ts lets signed-out visitors reach it.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = normalizeEmail(String(body?.email ?? ''));
  const mode = body?.mode === 'login' ? 'login' : 'signup';

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: 'Enter a valid email.' },
      { status: 400 },
    );
  }

  const [byIp, byEmail] = await Promise.all([
    checkRateLimit(
      `email-link-ip:${getClientIp(request)}`,
      IP_MAX_REQUESTS,
      WINDOW_MS,
    ),
    checkRateLimit(`email-link:${email}`, EMAIL_MAX_REQUESTS, WINDOW_MS),
  ]);
  if (!byIp.allowed || !byEmail.allowed) {
    return NextResponse.json(
      { error: 'Too many attempts, try again in a few minutes.' },
      { status: 429 },
    );
  }

  const origin = new URL(request.url).origin;

  try {
    const token = await createLoginToken(email);
    const link = buildLoginLink(origin, token);
    await sendLoginEmail(email, link, mode);

    // Same response whether or not the email has an account. In development
    // the link comes back too, so the dialog can offer it without an inbox.
    return NextResponse.json({
      ok: true,
      ...(process.env.NODE_ENV === 'development' && { devLink: link }),
    });
  } catch (error) {
    console.error('Failed to send login link:', error);
    return NextResponse.json(
      { error: "We couldn't send the link. Try again shortly." },
      { status: 500 },
    );
  }
}
