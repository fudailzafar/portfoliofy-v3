import type { MetadataRoute } from 'next';
import { getResume, getUserIdByUsername } from '@/lib/server/redisActions';
import { upstashRedis } from '@/lib/server/redis';

const SITE_URL = 'https://portfoliofy.me';
const USERNAME_KEY_PREFIX = 'user:name:';
const USERNAME_KEY_PATTERN = `${USERNAME_KEY_PREFIX}*`;

export const dynamic = 'force-dynamic';

async function getLiveProfileEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const usernameKeys = await upstashRedis.keys(USERNAME_KEY_PATTERN);

    if (!usernameKeys?.length) {
      return [];
    }

    const usernames = usernameKeys
      .map((key) => key.replace(USERNAME_KEY_PREFIX, ''))
      .filter(Boolean);

    const userIds = await Promise.all(
      usernames.map((username) => getUserIdByUsername(username)),
    );

    const profileEntries = await Promise.all(
      usernames.map(async (username, index) => {
        const userId = userIds[index];
        if (!userId) return null;

        const resume = await getResume(userId);
        if (!resume?.resumeData || resume.status !== 'live') {
          return null;
        }

        return {
          url: `${SITE_URL}/${username}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        };
      }),
    );

    const entries: MetadataRoute.Sitemap = [];

    for (const entry of profileEntries) {
      if (entry) {
        entries.push(entry);
      }
    }

    return entries;
  } catch (error) {
    console.error('Failed to generate dynamic sitemap entries:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const liveProfileEntries = await getLiveProfileEntries();

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...liveProfileEntries,
  ];
}
