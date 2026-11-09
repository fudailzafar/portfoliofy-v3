import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRepliesEnabled, setRepliesEnabled } from '@/lib/server/replies';
import {
  LIMITS,
  jsonError,
  rateLimitResponse,
  readJson,
  requireUser,
} from '@/lib/server/replyRoutes';

const BodySchema = z.object({ repliesEnabled: z.boolean() });

/** Whether other people can reply to the signed-in user. */
export async function GET() {
  try {
    const user = await requireUser();
    if ('response' in user) return user.response;

    return NextResponse.json({
      repliesEnabled: await getRepliesEnabled(user.userId),
    });
  } catch (error) {
    console.error('Failed to read replies setting:', error);
    return jsonError('Something went wrong. Try again.', 500);
  }
}

/** Turns replies from other people on or off. You can still reply to them. */
export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    if ('response' in user) return user.response;

    const limited = await rateLimitResponse(user.userId, LIMITS.manage);
    if (limited) return limited;

    const json = await readJson(request);
    if ('response' in json) return json.response;

    const parsed = BodySchema.safeParse(json.body);
    if (!parsed.success) return jsonError('That request was not valid.', 400);

    await setRepliesEnabled(user.userId, parsed.data.repliesEnabled);
    return NextResponse.json({ repliesEnabled: parsed.data.repliesEnabled });
  } catch (error) {
    console.error('Failed to update replies setting:', error);
    return jsonError('Something went wrong. Try again.', 500);
  }
}
