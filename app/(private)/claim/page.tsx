import ClaimPageClient from './client';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUsernameById } from '@/lib/server/redisActions';

export default async function ClaimPage() {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const existingUsername = await getUsernameById(userId);
  if (existingUsername) {
    redirect(`/${existingUsername}`);
  }

  return <ClaimPageClient userId={userId} />;
}
