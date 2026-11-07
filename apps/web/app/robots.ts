import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { SITE_URL, classifyHost } from '@/lib/site';

// Each host points at its own sitemap; a sitemap must be on the same host.
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
