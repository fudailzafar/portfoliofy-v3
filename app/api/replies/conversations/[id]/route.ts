import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ThreadMessageBodySchema } from '@/lib/replies';
import { getThread, sendInConversation } from '@/lib/server/replies';
import {
  LIMITS,
  failureResponse,
  jsonError,
  rateLimitResponse,
  readJson,
  requireUser,
} from '@/lib/server/replyRoutes';

const IdSchema = z.string().uuid();
const BeforeSchema = z.coerce.number().int().positive();

type Params = { params: Promise<{ id: string }> };

/** One conversation. `?before=<messageId>` loads the page of older messages. */
export async function GET(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    if ('response' in user) return user.response;

    const id = IdSchema.safeParse((await params).id);
    if (!id.success) return jsonError('That conversation was not found.', 404);

    const limited = await rateLimitResponse(user.userId, LIMITS.read);
    if (limited) return limited;

    const beforeParam = new URL(request.url).searchParams.get('before');
    const before = beforeParam ? BeforeSchema.safeParse(beforeParam) : null;
    if (before && !before.success) {
      return jsonError('That request was not valid.', 400);
    }

    const thread = await getThread(
      user.userId,
      id.data,
      before?.success ? before.data : undefined,
    );
    if (!thread) return jsonError('That conversation was not found.', 404);

    return NextResponse.json(thread);
  } catch (error) {
    console.error('Failed to load conversation:', error);
    return jsonError('Could not load this conversation. Try again.', 500);
  }
}

/** A message inside a conversation the user is already part of. */
export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireUser();
    if ('response' in user) return user.response;

    const id = IdSchema.safeParse((await params).id);
    if (!id.success) return jsonError('That conversation was not found.', 404);

    const limited = await rateLimitResponse(user.userId, LIMITS.send);
    if (limited) return limited;

    const json = await readJson(request);
    if ('response' in json) return json.response;

    const parsed = ThreadMessageBodySchema.safeParse(json.body);
    if (!parsed.success) {
      return jsonError(
        parsed.error.issues[0]?.message ?? 'That message was not valid.',
        400,
        'invalid',
      );
    }

    const result = await sendInConversation({
      senderId: user.userId,
      conversationId: id.data,
      body: parsed.data.body,
    });
    if (!result.ok) return failureResponse(result.reason);

    return NextResponse.json(
      { conversationId: result.conversationId, messageId: result.messageId },
      { status: 201 },
    );
  } catch (error) {
    console.error('Failed to send message:', error);
    return jsonError('Could not send your message. Try again.', 500);
  }
}
