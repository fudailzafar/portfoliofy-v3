import { getUsernameById, updateUsername } from '@/lib/server/redisActions';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export type GetResponse = { username?: string | null } | { error: string };
export type PostResponse = { success: true } | { error: string };

export async function GET(): Promise<NextResponse<GetResponse>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const username = await getUsernameById(session.user.id);
    return NextResponse.json({ username });
  } catch (error) {
    console.error('Error retrieving username:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
): Promise<NextResponse<PostResponse>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username } = await request.json();

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 },
      );
    }

    const success = await updateUsername(session.user.id, username);

    if (!success) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 },
      );
    }

    revalidateTag('usernames');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating username:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
