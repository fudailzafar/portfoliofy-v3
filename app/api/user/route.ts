import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import sql from '@/lib/server/db';
import { releaseUserDomainFromVercel } from '@/lib/server/vercelDomains';

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Release any connected custom domain from Vercel before the row (and
    // its custom_domain value) disappears — otherwise the domain stays
    // attached to the project with nothing left to say who it belonged to.
    await releaseUserDomainFromVercel(userId);

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
