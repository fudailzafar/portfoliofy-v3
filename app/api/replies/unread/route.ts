import { NextResponse } from 'next/server';
import { countUnreadConversations } from '@/lib/server/replies';
import {
  LIMITS,
  jsonError,
  rateLimitResponse,
  requireUser,
} from '@/lib/server/replyRoutes';

/** How many conversations have something unread, for the dot on the nav. */
export async function GET() {
  try {
    const user = await requireUser();
    if ('response' in user) return user.response;

    const limited = await rateLimitResponse(user.userId, LIMITS.read);
    if (limited) return limited;

    return NextResponse.json({
      unread: await countUnreadConversations(user.userId),
    });
  } catch (error) {
    console.error('Failed to count unread replies:', error);
    return jsonError('Something went wrong. Try again.', 500);
  }
}
