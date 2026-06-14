import type { MetadataRoute } from 'next';
import sql from '@/lib/server/db';

const SITE_URL = 'https://portfoliofy.me';

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // 24 hours

async function getLiveProfileEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const rows = await sql`
      SELECT u.username 
      FROM users u
      JOIN resumes r ON u.id = r.user_id
      WHERE r.status = 'live'
    `;

    if (!rows?.length) {
      return [];
    }

    return rows.map((row) => ({
      url: `${SITE_URL}/${row.username}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
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
    {
      url: `${SITE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    ...liveProfileEntries,
  ];
}
