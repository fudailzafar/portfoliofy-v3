'use server';

import { auth } from '@/auth';
import { claimUsernameAndInitProfile as claim } from '@/lib/server/claim';

export async function claimUsernameAndInitProfile(
  username: string,
  displayName: string,
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error('Unauthorized');
  }

  return claim({
    userId,
    email: session?.user?.email,
    image: session?.user?.image,
    username,
    displayName,
  });
}
