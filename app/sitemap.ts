import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import sql from '@/lib/server/db';
import { getAllPageAttachments } from '@/lib/resume';
import type { ResumeDataSchemaType } from '@/lib/resume';
import { getUserData } from './[username]/utils';

const SITE_URL = 'https://portfoliofy.me';

function pageEntries(
  baseUrl: string,
  resumeData: ResumeDataSchemaType,
): MetadataRoute.Sitemap {
  return getAllPageAttachments(resumeData).map((page) => ({
    url: `${baseUrl}/${page.slug}`,
    lastModified: page.createdAt ? new Date(page.createdAt) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));
}

// portfoliofy.me itself: marketing pages, every live user's profile at
// portfoliofy.me/{username}, and every one of their blog posts.
async function getMainDomainSitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
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
  ];

  try {
    const rows = await sql`
      SELECT u.username, r.resume_data as "resumeData"
      FROM users u
      JOIN resumes r ON u.id = r.user_id
      WHERE r.status = 'live'
    `;

    const profileEntries: MetadataRoute.Sitemap = [];
    for (const row of rows ?? []) {
      const baseUrl = `${SITE_URL}/${row.username}`;
      profileEntries.push({
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });

      const resumeData =
        typeof row.resumeData === 'string'
          ? JSON.parse(row.resumeData)
          : row.resumeData;
      profileEntries.push(...pageEntries(baseUrl, resumeData));
    }

    return [...staticEntries, ...profileEntries];
  } catch (error) {
    console.error('Failed to generate dynamic sitemap entries:', error);
    return staticEntries;
  }
}

// A subdomain (username.portfoliofy.me) or a connected custom domain
// (abaan.lol): the sitemap is scoped to just that one user, using their own
// host as the base URL — proxy.ts already rewrites `/` and `/{slug}` on
// these hosts to that user's profile and pages internally.
async function getSingleUserSitemap(
  identifier: string,
  baseUrl: string,
): Promise<MetadataRoute.Sitemap> {
  try {
    const { resume } = await getUserData(identifier);
    if (!resume?.resumeData) return [];

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1,
      },
      ...pageEntries(baseUrl, resume.resumeData),
    ];
  } catch (error) {
    console.error('Failed to generate single-user sitemap entries:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers();
  const hostHeader = headersList.get('host') || '';
  const hostname = hostHeader.split(':')[0];

  const isMainDomain =
    hostname === 'portfoliofy.me' ||
    hostname === 'www.portfoliofy.me' ||
    hostname === 'localhost' ||
    hostname.endsWith('.vercel.app');

  if (isMainDomain || !hostname) {
    return getMainDomainSitemap();
  }

  const isSubdomain =
    (hostname.endsWith('.portfoliofy.me') &&
      hostname !== 'www.portfoliofy.me') ||
    (hostname.endsWith('.localhost') && hostname !== 'localhost');

  const identifier = isSubdomain
    ? hostname.replace('.portfoliofy.me', '').replace('.localhost', '')
    : hostname;

  return getSingleUserSitemap(identifier, `https://${hostname}`);
}
