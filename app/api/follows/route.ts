import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getFollowOverview, setFollowing } from '@/lib/server/follows';
import {
  LIMITS,
  jsonError,
  rateLimitResponse,
  readJson,
  requireUser,
} from '@/lib/server/replyRoutes';

const BodySchema = z.object({
  username: z.string().min(1).max(100),
  following: z.boolean(),
});

const FAILURES = {
  not_found: { status: 404, message: "We couldn't find that person." },
  self: { status: 400, message: "You can't follow yourself." },
  // Also covers blocks, so a block stays private.
  unavailable: { status: 403, message: "You can't follow this person." },
} as const;

/** Your followers and the people you follow. Only you can see these. */
export async function GET() {
  try {
    const user = await requireUser();
    if ('response' in user) return user.response;

    const limited = await rateLimitResponse(user.userId, LIMITS.read);
    if (limited) return limited;

    return NextResponse.json(await getFollowOverview(user.userId));
  } catch (error) {
    console.error('Failed to load follows:', error);
    return jsonError('Could not load who you follow. Try again.', 500);
  }
}

/** Follows or unfollows someone. */
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

    const result = await setFollowing(
      user.userId,
      parsed.data.username,
      parsed.data.following,
    );
    if (!result.ok) {
      const failure = FAILURES[result.reason];
      return jsonError(failure.message, failure.status, result.reason);
    }
    return NextResponse.json({ following: result.following });
  } catch (error) {
    console.error('Failed to update follow:', error);
    return jsonError('Something went wrong. Try again.', 500);
  }
}
