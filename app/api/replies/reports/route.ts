import { NextResponse } from 'next/server';
import { ReportSchema } from '@/lib/replies';
import { reportConversation } from '@/lib/server/replies';
import {
  LIMITS,
  jsonError,
  rateLimitResponse,
  readJson,
  requireUser,
} from '@/lib/server/replyRoutes';

/** Reports the other person in a conversation, optionally with one message. */
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    if ('response' in user) return user.response;

    const limited = await rateLimitResponse(user.userId, LIMITS.report);
    if (limited) return limited;

    const json = await readJson(request);
    if ('response' in json) return json.response;

    const parsed = ReportSchema.safeParse(json.body);
    if (!parsed.success) {
      return jsonError('Pick a reason for your report.', 400, 'invalid');
    }

    const result = await reportConversation({
      reporterId: user.userId,
      ...parsed.data,
    });
    if (!result.ok) {
      return result.reason === 'not_found'
        ? jsonError('That conversation was not found.', 404)
        : jsonError('That message can not be reported.', 400, result.reason);
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Failed to report conversation:', error);
    return jsonError('Could not send your report. Try again.', 500);
  }
}
