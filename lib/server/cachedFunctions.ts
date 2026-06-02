import { getResume, getUserIdByUsername } from '@/lib/server/redisActions';
import { upstashRedis } from '@/lib/server/redis';
import { unstable_cache } from 'next/cache';

export interface UserProfile {
  name: string | null;
  email: string | null;
  image: string | null; // Google OAuth photo (fallback)
  customImage?: string | null; // User-uploaded S3 photo (takes priority)
  avatarUrl?: string | null;
}

export const getCachedUserProfile = async (
  userId: string,
): Promise<UserProfile | null> => {
  return unstable_cache(
    async () => {
      const profile = await upstashRedis.get<UserProfile>(
        `user:profile:${userId}`,
      );
      if (profile) {
        profile.avatarUrl = profile.customImage ?? profile.image ?? undefined;
      }
      return profile;
    },
    [userId],
    {
      tags: ['users'],
      revalidate: 86400, // 1 day
    },
  )();
};

export const getCachedResume = async (userId: string) => {
  return unstable_cache(
    async () => {
      return await getResume(userId);
    },
    [userId],
    {
      tags: ['resumes'],
      revalidate: 86400, // 1 day
    },
  )();
};

export const getCachedUserIdByUsername = async (
  username: string,
): Promise<string | null> => {
  return unstable_cache(
    async () => {
      return await getUserIdByUsername(username);
    },
    [username],
    {
      tags: ['usernames'],
      revalidate: 86400, // 1 day
    },
  )();
};
