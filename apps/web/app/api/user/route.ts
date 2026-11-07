import { getApiSession } from '@/lib/server/requestAuth';
import { NextResponse } from 'next/server';
import sql from '@/lib/server/db';
import { deleteUserUploads } from '@/lib/server/userUploads';
import { releaseUserDomainFromVercel } from '@/lib/server/vercelDomains';

// The signed-in user's account details, for apps that don't render the
// profile page (the page is where the website gets these).
export async function GET() {
  try {
    const session = await getApiSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [user] = await sql`
      SELECT username, name, image, custom_image, created_at
      FROM users
      WHERE id = ${session.user.id}
    `;
    if (!user) {
      // Signed in, but no profile has been created yet.
      return NextResponse.json({ account: null });
    }

    return NextResponse.json({
      account: {
        username: user.username,
        name: user.name,
        // A picture they uploaded wins over the one from their Google account.
        image: user.customImage ?? user.image ?? null,
        hasCustomImage: !!user.customImage,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Failed to load account:', error);
    return NextResponse.json(
      { error: 'Failed to load account' },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const session = await getApiSession();
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
