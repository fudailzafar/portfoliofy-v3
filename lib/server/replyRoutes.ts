// Shared plumbing for the /api/replies routes: the signed-in user, rate
// limits, and plain-language errors.

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { checkRateLimit } from './rateLimit';
import type { ReplyFailure } from './replies';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

// Named limits so every route reads the same way.
export const LIMITS = {
  send: [
    { name: 'reply-send-minute', max: 20, windowMs: MINUTE },
    { name: 'reply-send-hour', max: 200, windowMs: HOUR },
  ],
  read: [{ name: 'reply-read', max: 120, windowMs: MINUTE }],
  manage: [{ name: 'reply-manage', max: 30, windowMs: MINUTE }],
  report: [{ name: 'reply-report', max: 10, windowMs: HOUR }],
} as const;

export function jsonError(error: string, status: number, code?: string) {
  return NextResponse.json({ error, code: code ?? null }, { status });
}

/** The signed-in user's id, or a 401 response. */
export async function requireUser(): Promise<
  { userId: string } | { response: NextResponse }
> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { response: jsonError('Sign in to continue.', 401) };
  return { userId };
}

/** A 429 response when any of the limits is used up, otherwise null. */
export async function rateLimitResponse(
  userId: string,
  limits: readonly { name: string; max: number; windowMs: number }[],
): Promise<NextResponse | null> {
  for (const limit of limits) {
    const { allowed, retryAfterMs } = await checkRateLimit(
      `${limit.name}:${userId}`,
      limit.max,
      limit.windowMs,
    );
    if (!allowed) {
      const response = jsonError(
        'You are doing that too quickly. Try again in a moment.',
        429,
        'rate_limited',
      );
      response.headers.set(
        'Retry-After',
        String(Math.max(1, Math.ceil(retryAfterMs / 1000))),
      );
      return response;
    }
  }
  return null;
}

const FAILURES: Record<ReplyFailure, { status: number; message: string }> = {
  not_found: { status: 404, message: "We couldn't find that person." },
  self: { status: 400, message: "You can't reply to yourself." },
  // Covers "replies are off" and "you were blocked" so a block stays private.
  not_accepting: {
    status: 403,
    message: "This person isn't accepting replies right now.",
  },
  blocked_by_you: {
    status: 403,
    message: 'You blocked this person. Unblock them to reply.',
  },
  target_unavailable: {
    status: 409,
    message: "That item isn't available to reply to anymore.",
  },
};

export function failureResponse(reason: ReplyFailure) {
  const { status, message } = FAILURES[reason];
  return jsonError(message, status, reason);
}

/** Parses a JSON body, or returns a 400 response. */
export async function readJson(
  request: Request,
): Promise<{ body: unknown } | { response: NextResponse }> {
  try {
    return { body: await request.json() };
  } catch {
    return { response: jsonError('That request was not valid.', 400) };
  }
}
