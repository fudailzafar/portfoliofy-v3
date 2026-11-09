import { NextResponse } from 'next/server';
import { SendReplySchema } from '@/lib/replies';
import { sendReply } from '@/lib/server/replies';
import {
  LIMITS,
  failureResponse,
  jsonError,
  rateLimitResponse,
  readJson,
  requireUser,
} from '@/lib/server/replyRoutes';

/**
 * Reply to someone's profile, an item on it, or their status. Creates the
 * conversation on first contact.
 */
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    if ('response' in user) return user.response;

    const limited = await rateLimitResponse(user.userId, LIMITS.send);
    if (limited) return limited;

    const json = await readJson(request);
    if ('response' in json) return json.response;

    const parsed = SendReplySchema.safeParse(json.body);
    if (!parsed.success) {
      return jsonError(
        parsed.error.issues[0]?.message ?? 'That reply was not valid.',
        400,
        'invalid',
      );
    }

    const result = await sendReply({
      senderId: user.userId,
      recipientUsername: parsed.data.username,
      body: parsed.data.body,
      target: parsed.data.target,
    });
    if (!result.ok) return failureResponse(result.reason);

    return NextResponse.json(
      { conversationId: result.conversationId, messageId: result.messageId },
      { status: 201 },
    );
  } catch (error) {
    console.error('Failed to send reply:', error);
    return jsonError('Could not send your reply. Try again.', 500);
  }
}
