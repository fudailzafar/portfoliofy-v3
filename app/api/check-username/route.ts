import { checkUsernameAvailability } from '@/lib/server/dbActions';
import { NextResponse } from 'next/server';
import { checkRateLimit, getClientIp } from '@/lib/server/rateLimit';
import { auth } from '@/auth';

// API Response Types
export type PostResponse = { available: boolean } | { error: string };

const CHECK_USERNAME_MAX_REQUESTS = 30;
const CHECK_USERNAME_WINDOW_MS = 60 * 1000; // 1 minute

// POST endpoint to check username availability
export async function POST(
  request: Request,
): Promise<NextResponse<PostResponse>> {
  try {
    const session = await auth();
    const rateLimitKey = session?.user?.id
      ? `check-username:${session.user.id}`
      : `check-username:${getClientIp(request)}`;

    const { allowed, retryAfterMs } = await checkRateLimit(
      rateLimitKey,
      CHECK_USERNAME_MAX_REQUESTS,
      CHECK_USERNAME_WINDOW_MS,
    );
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests — please slow down.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) },
        },
      );
    }

    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username parameter is required' },
        { status: 400 },
      );
    }

    const { available } = await checkUsernameAvailability(username);

    return NextResponse.json({ available });
  } catch (error) {
    console.error('Error checking username availability:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
