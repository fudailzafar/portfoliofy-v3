import { getResume, Resume, storeResume } from '@/lib/server/redisActions';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';

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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<NextResponse<PostResumeResponse>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    await storeResume(session.user.id, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.errors },
        { status: 400 },
      );
    }
    console.error('Error storing resume:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
