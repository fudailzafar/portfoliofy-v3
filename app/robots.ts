import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

const SITE_URL = 'https://portfoliofy.me';

// A sitemap reference is only meaningful when it's on the same host as the
// robots.txt serving it, so this points each domain back at its own
// /sitemap.xml (which app/sitemap.ts scopes per-host) instead of always
// pointing at portfoliofy.me's.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers();
  const hostHeader = headersList.get('host') || '';
  const hostname = hostHeader.split(':')[0];

  const isMainDomain =
    hostname === 'portfoliofy.me' ||
    hostname === 'www.portfoliofy.me' ||
    hostname === 'localhost' ||
    hostname.endsWith('.vercel.app');

  const sitemapUrl =
    isMainDomain || !hostname
      ? `${SITE_URL}/sitemap.xml`
      : `https://${hostname}/sitemap.xml`;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: sitemapUrl,
  };
}
