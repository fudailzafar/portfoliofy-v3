import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { getRepliesFrom, setRepliesFrom } from '@/lib/server/replies';
import { REPLIES_FROM } from '@/lib/replies';
import {
  LIMITS,
  jsonError,
  rateLimitResponse,
  readJson,
  requireUser,
} from '@/lib/server/replyRoutes';

const BodySchema = z.object({ repliesFrom: z.enum(REPLIES_FROM) });

/** Who can reply to the signed-in user: everyone, people they follow, or nobody. */
export async function GET() {
  try {
    const user = await requireUser();
    if ('response' in user) return user.response;

    return NextResponse.json({
      repliesFrom: await getRepliesFrom(user.userId),
    });
  } catch (error) {
    console.error('Failed to read replies setting:', error);
    return jsonError('Something went wrong. Try again.', 500);
  }
}

/** Changes who can reply. You can always reply to others yourself. */
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

    await setRepliesFrom(user.userId, parsed.data.repliesFrom);
    // The public profile reads this from a cached copy of the user.
    revalidateTag(`user-${user.userId}`, { expire: 0 });
    return NextResponse.json({ repliesFrom: parsed.data.repliesFrom });
  } catch (error) {
    console.error('Failed to update replies setting:', error);
    return jsonError('Something went wrong. Try again.', 500);
  }
}
