import ClaimPageClient from './client';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getUsernameById } from '@/lib/server/redisActions';

export default async function ClaimPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect('/');

  const existingUsername = await getUsernameById(userId);
  if (existingUsername) {
    redirect(`/${existingUsername}`);
  }

  return <ClaimPageClient userId={userId} />;
}
