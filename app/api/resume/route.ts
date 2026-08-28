import { getResume, Resume, storeResume } from '@/lib/server/dbActions';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { checkRateLimit } from '@/lib/server/rateLimit';

const RESUME_SAVE_MAX_REQUESTS = 30;
const RESUME_SAVE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export type GetResumeResponse = { resume?: Resume } | { error: string };
export type PostResumeResponse =
  | { success: true }
  | { error: string; details?: z.ZodError['errors'] };

export async function GET(): Promise<NextResponse<GetResumeResponse>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const resume = await getResume(session.user.id);
    return NextResponse.json({ resume });
  } catch (error) {
    console.error('Error retrieving resume:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
): Promise<NextResponse<PostResumeResponse>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { allowed, retryAfterMs } = await checkRateLimit(
      `resume-save:${session.user.id}`,
      RESUME_SAVE_MAX_REQUESTS,
      RESUME_SAVE_WINDOW_MS,
    );
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many saves — please try again shortly.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) },
        },
      );
    }

    // Guard: parse body first — a missing or malformed body would otherwise
    // throw an unhandled error and bubble up as HTTP 500.
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid or missing JSON body' },
        { status: 400 },
      );
    }

    await storeResume(session.user.id, body as Resume);
    // @ts-expect-error Next.js 16 Canary types require second profile argument
    revalidateTag(`resume-v2-${session.user.id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.errors },
        { status: 400 },
      );
    }
    console.error('Error in POST /api/resume:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
