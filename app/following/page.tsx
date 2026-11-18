import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { FollowingPage } from './FollowingPage';

export const metadata: Metadata = {
  title: 'Following',
  description: 'Updates from people you follow',
  robots: { index: false },
};

// Private: your followers are only visible to you.
export default async function Page() {
  const session = await auth();
  if (!session?.user?.id) redirect('/');
  return <FollowingPage />;
}
