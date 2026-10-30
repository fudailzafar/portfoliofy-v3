import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import sql from '@/lib/server/db';
import { deleteUserUploads } from '@/lib/server/userUploads';
import { releaseUserDomainFromVercel } from '@/lib/server/vercelDomains';

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Erase their uploads first: older files are only found through the URLs
    // in their profile, and if this fails the account stays intact to retry.
    await deleteUserUploads(userId);

    // Release the custom domain from Vercel while we still know which one it is.
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
