import { getResume, getUserIdByUsername } from '@/lib/server/redisActions';
import { getCachedUserProfile, UserProfile } from '@/lib/server/cachedFunctions';
import { unstable_cache } from 'next/cache';

export async function getUserData(username: string) {
  const user_id = await getUserIdByUsername(username);
  if (!user_id)
    return { user_id: undefined, resume: undefined, userProfile: undefined };

  const resume = await getResume(user_id);
  if (!resume?.resumeData || resume.status !== 'live') {
    return { user_id, resume: undefined, userProfile: undefined };
  }

  const getUserProfileCached = unstable_cache(
    async () => getCachedUserProfile(user_id),
    [user_id],
    {
      tags: ['users'],
      revalidate: 60, // 1 minute
    },
  );
  const userProfile: UserProfile | null = await getUserProfileCached();

  return { user_id, resume, userProfile };
}
