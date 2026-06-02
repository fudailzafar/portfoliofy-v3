import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import sql from '@/lib/server/db';

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Delete user from DB. Cascading will handle resumes automatically.
    await sql`DELETE FROM users WHERE id = ${userId}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 },
    );
  }
}
