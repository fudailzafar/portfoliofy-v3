import { NextResponse } from 'next/server';
import { getApiSession } from '@/lib/server/requestAuth';
import { setUserStatus } from '@/lib/server/dbActions';

export async function PUT(req: Request) {
  try {
    const session = await getApiSession();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { status_emoji, status_text } = body;

    // Both fields can be empty/null to clear the status, or provided to update
    await setUserStatus(userId, status_emoji, status_text);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 },
    );
  }
}
