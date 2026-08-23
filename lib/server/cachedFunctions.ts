import {
  getResume,
  getUserIdByUsername,
  getUserIdByCustomDomain,
} from '@/lib/server/dbActions';
import sql from '@/lib/server/db';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { normalizeUsername } from '@/lib/validation/username';

export interface UserProfile {
  name: string | null;
  email: string | null;
  image: string | null; // Google OAuth photo (fallback)
  customImage?: string | null; // User-uploaded S3 photo (takes priority)
  avatarUrl?: string | null;
  statusEmoji?: string | null;
  statusText?: string | null;
  statusUpdatedAt?: Date | null;
}

export const getCachedUserProfile = cache(
  async (userId: string): Promise<UserProfile | null> => {
    return unstable_cache(
      async () => {
        try {
          const [row] =
            await sql`SELECT name, email, image, custom_image, status_emoji, status_text, status_updated_at FROM users WHERE id = ${userId}`;
          if (!row) return null;

          const profile: UserProfile = {
            name: row.name,
            email: row.email,
            image: row.image,
            customImage: row.customImage,
            statusEmoji: row.statusEmoji,
            statusText: row.statusText,
            statusUpdatedAt: row.statusUpdatedAt,
          };

          profile.avatarUrl = profile.customImage ?? profile.image ?? undefined;
          return profile;
        } catch (error) {
          console.error('Failed to get cached profile:', error);
          return null;
        }
      },
      [userId],
      {
        tags: ['users', `user-${userId}`],
        revalidate: 86400, // 1 day
      },
    )();
  },
);

export const getCachedResume = cache(async (userId: string) => {
  return unstable_cache(
    async () => {
      return await getResume(userId);
    },
    ['resume-v2', userId],
    {
      tags: ['resumes-v2', `resume-v2-${userId}`],
      revalidate: 86400, // 1 day
    },
  )();
});

export const getCachedUserIdByUsername = cache(
  async (username: string): Promise<string | null> => {
    // Normalize before it's used as the cache key/tag — getUserIdByUsername
    // normalizes internally too, so two calls that differ only in casing must
    // resolve to the same cache entry, or a revalidation keyed on one casing
    // would leave a stale entry under the other.
    const normalized = normalizeUsername(username);
    return unstable_cache(
      async () => {
        return await getUserIdByUsername(normalized);
      },
      [normalized],
      {
        tags: ['usernames', `username-${normalized}`],
        revalidate: 86400, // 1 day
      },
    )();
  },
);

export const getCachedUserIdByCustomDomain = cache(
  async (domain: string): Promise<string | null> => {
    return unstable_cache(
      async () => {
        return await getUserIdByCustomDomain(domain);
      },
      [domain],
      {
        tags: ['domains', `domain-${domain}`],
        revalidate: 86400, // 1 day
      },
    )();
  },
);
