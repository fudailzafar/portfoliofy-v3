import { NextResponse } from 'next/server';
import { z } from 'zod';
import { hideConversation } from '@/lib/server/replies';
import {
  LIMITS,
  jsonError,
  rateLimitResponse,
  requireUser,
} from '@/lib/server/replyRoutes';

/**
 * Removes the conversation from the signed-in user's inbox. The other person
 * keeps it, and it comes back if either of you writes again.
 */
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

    const limited = await rateLimitResponse(user.userId, LIMITS.manage);
    if (limited) return limited;

    if (!(await hideConversation(user.userId, id.data))) {
      return jsonError('That conversation was not found.', 404);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to hide conversation:', error);
    return jsonError('Something went wrong. Try again.', 500);
  }
}
