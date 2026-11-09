import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { RepliesPage } from './RepliesPage';

export const metadata: Metadata = {
  title: 'Replies',
  robots: { index: false },
};

// Private: replies belong to the signed-in user.
export default async function Page({
  params,
}: {
  params: Promise<{ id?: string[] }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/');

  const { id } = await params;
  // /replies and /replies/<conversation>; anything deeper isn't a page.
  return <RepliesPage conversationId={id?.length === 1 ? id[0] : null} />;
}
