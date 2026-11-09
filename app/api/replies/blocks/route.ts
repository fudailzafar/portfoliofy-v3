import { NextResponse } from 'next/server';
import { z } from 'zod';
import { setBlocked } from '@/lib/server/replies';
import {
  LIMITS,
  failureResponse,
  jsonError,
  rateLimitResponse,
  readJson,
  requireUser,
} from '@/lib/server/replyRoutes';

const BodySchema = z.object({
  username: z.string().min(1).max(100),
  blocked: z.boolean(),
});

/** Blocks or unblocks a person. Blocking is silent: they aren't told. */
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

    const result = await setBlocked(
      user.userId,
      parsed.data.username,
      parsed.data.blocked,
    );
    if (!result.ok) return failureResponse(result.reason);

    return NextResponse.json({ success: true, blocked: parsed.data.blocked });
  } catch (error) {
    console.error('Failed to update block:', error);
    return jsonError('Something went wrong. Try again.', 500);
  }
}
