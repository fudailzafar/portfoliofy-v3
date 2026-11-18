import { NextResponse } from 'next/server';
import { markFollowersSeen } from '@/lib/server/follows';
import {
  LIMITS,
  jsonError,
  rateLimitResponse,
  requireUser,
} from '@/lib/server/replyRoutes';

/** Marks new followers as seen, which clears the dot on the nav. */
export async function POST() {
  try {
    const user = await requireUser();
    if ('response' in user) return user.response;

    const limited = await rateLimitResponse(user.userId, LIMITS.manage);
    if (limited) return limited;

    await markFollowersSeen(user.userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to mark followers seen:', error);
    return jsonError('Something went wrong. Try again.', 500);
  }
}
