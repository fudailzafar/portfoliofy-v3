import { NextResponse } from 'next/server';
import { countNewFollowers } from '@/lib/server/follows';
import {
  LIMITS,
  jsonError,
  rateLimitResponse,
  requireUser,
} from '@/lib/server/replyRoutes';

/** New followers since you last opened Following, for the dot on the nav. */
export async function GET() {
  try {
    const user = await requireUser();
    if ('response' in user) return user.response;

    const limited = await rateLimitResponse(user.userId, LIMITS.read);
    if (limited) return limited;

    return NextResponse.json({ unread: await countNewFollowers(user.userId) });
  } catch (error) {
    console.error('Failed to count new followers:', error);
    return jsonError('Something went wrong. Try again.', 500);
  }
}
