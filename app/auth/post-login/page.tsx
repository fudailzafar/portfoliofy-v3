import { auth } from '@/auth';
import { getUsernameById } from '@/lib/server/dbActions';
import { redirect } from 'next/navigation';

// After sign-in: returning users go to their profile, new users to the claim dialog.
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
