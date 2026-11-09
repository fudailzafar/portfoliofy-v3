import { NextResponse } from 'next/server';
import { listInbox } from '@/lib/server/replies';
import {
  LIMITS,
  jsonError,
  rateLimitResponse,
  requireUser,
} from '@/lib/server/replyRoutes';

/** The signed-in user's inbox, newest conversation first. */
export async function GET() {
  try {
    const user = await requireUser();
    if ('response' in user) return user.response;

    const limited = await rateLimitResponse(user.userId, LIMITS.read);
    if (limited) return limited;

    const conversations = await listInbox(user.userId);
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Failed to list conversations:', error);
    return jsonError('Could not load your replies. Try again.', 500);
  }
}
