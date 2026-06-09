import { auth } from '@/auth';
import { getUsernameById } from '@/lib/server/dbActions';
import { redirect } from 'next/navigation';

/**
 * Post-login redirect handler.
 * After Google OAuth, NextAuth redirects here.
 * We check db to decide: new user → /claim, returning user → /username
 */
export default async function PostLoginPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/');
  }

  const username = await getUsernameById(session.user.id);

  if (username) {
    redirect(`/${username}`);
  } else {
    redirect('/');
  }
}
