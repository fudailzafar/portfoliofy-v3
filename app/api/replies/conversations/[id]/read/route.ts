import { NextResponse } from 'next/server';
import { z } from 'zod';
import { markConversationRead } from '@/lib/server/replies';
import {
  LIMITS,
  jsonError,
  rateLimitResponse,
  requireUser,
} from '@/lib/server/replyRoutes';

/** Marks the conversation as read for the signed-in user. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    if ('response' in user) return user.response;

    const id = z
      .string()
      .uuid()
      .safeParse((await params).id);
    if (!id.success) return jsonError('That conversation was not found.', 404);

    const limited = await rateLimitResponse(user.userId, LIMITS.read);
    if (limited) return limited;

    if (!(await markConversationRead(user.userId, id.data))) {
      return jsonError('That conversation was not found.', 404);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to mark conversation read:', error);
    return jsonError('Something went wrong. Try again.', 500);
  }
}
