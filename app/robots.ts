import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { SITE_URL, classifyHost } from '@/lib/site';

// A sitemap reference is only meaningful when it's on the same host as the
// robots.txt serving it, so this points each domain back at its own
// /sitemap.xml (which app/sitemap.ts scopes per-host) instead of always
// pointing at portfoliofy.me's.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = classifyHost((await headers()).get('host'));

  const sitemapUrl =
    host.kind === 'main'
      ? `${SITE_URL}/sitemap.xml`
      : `https://${host.hostname}/sitemap.xml`;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: sitemapUrl,
  };
}
