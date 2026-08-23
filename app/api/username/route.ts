import { getUsernameById, updateUsername } from '@/lib/server/dbActions';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { normalizeUsername } from '@/lib/validation/username';

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

    const oldUsername = await getUsernameById(session.user.id);
    const result = await updateUsername(session.user.id, username);

    if (!result.success) {
      const messages: Record<typeof result.reason, string> = {
        invalid:
          'Username must be 2-30 characters: lowercase letters, numbers, and hyphens only',
        reserved: 'This username is reserved',
        taken: 'Username already taken',
        error: 'Failed to update username',
      };
      return NextResponse.json(
        { error: messages[result.reason] },
        { status: 400 },
      );
    }

    if (oldUsername) {
      // @ts-expect-error Next.js 16 Canary types
      revalidateTag(`username-${normalizeUsername(oldUsername)}`);
    }
    // @ts-expect-error Next.js 16 Canary types
    revalidateTag(`username-${normalizeUsername(username)}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating username:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
