import { NextResponse } from 'next/server';
import { getApiSession } from '@/lib/server/requestAuth';
import { claimUsernameAndInitProfile } from '@/lib/server/claim';

export type PostClaimResponse = { success: true } | { error: string };

// For apps that can't call the claim server action: picks a username for a
// signed-in user who doesn't have a profile yet.
export async function POST(
  request: Request,
): Promise<NextResponse<PostClaimResponse>> {
  const session = await getApiSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const username = typeof body?.username === 'string' ? body.username : '';
  const displayName =
    typeof body?.displayName === 'string' ? body.displayName.trim() : '';
  if (!username || !displayName || displayName.length > 100) {
    return NextResponse.json(
      { error: 'A username and display name are required' },
      { status: 400 },
    );
  }

  try {
    const result = await claimUsernameAndInitProfile({
      userId: session.user.id,
      username,
      displayName,
    });
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error.startsWith('Too many') ? 429 : 400 },
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/claim:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
