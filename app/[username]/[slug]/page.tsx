import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { isOwnS3ImageUrl, getCanonicalUrl } from '@/lib/utils';
import { getCachedCustomDomainByUserId } from '@/lib/server/cachedFunctions';
import { SITE_URL } from '@/lib/site';
import { PageLockScreen } from './PageLockScreen';
import { PostBody } from './PostBody';
import {
  getPostViewProps,
  isPageLocked,
  postRootClassName,
  resolvePage,
} from './postView';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}): Promise<Metadata> {
  const { username, slug } = await params;
  const resolved = await resolvePage(username, slug);

  // notFound() here too, or Next commits to a 200 before the page body runs.
  if (!resolved) notFound();

  const stripHtml = (html?: string) =>
    html ? html.replace(/<[^>]*>?/gm, '').trim() : '';

  const design = resolved.resumeData.design;
  const customFavicon =
    design?.favicon && isOwnS3ImageUrl(design.favicon)
      ? design.favicon
      : undefined;

  const customDomain = await getCachedCustomDomainByUserId(resolved.user_id);
  const canonicalUrl = getCanonicalUrl(username, customDomain, slug);
  // Protected pages are never indexed; while locked they reveal nothing.
  const isProtected = !!resolved.page.passwordHash;

  if (await isPageLocked(resolved.page, resolved.user_id)) {
    return {
      title: 'This page is password protected',
      robots: { index: false, follow: false },
      icons: customFavicon ? { icon: customFavicon } : undefined,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        type: 'website',
        title: 'This page is password protected',
        images: [
          {
            url: `${SITE_URL}/${username}/og`,
            width: 1200,
            height: 630,
          },
        ],
      },
      other: {
        'og:logo': customFavicon || `${SITE_URL}/favicon.ico`,
      },
    };
  }

  return {
    title: `${resolved.page.title}`,
    ...(isProtected && { robots: { index: false, follow: false } }),
    description: stripHtml(resolved.page.content).slice(0, 200),
    icons: customFavicon ? { icon: customFavicon } : undefined,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'website',
      title: `${resolved.page.title}`,
      description: stripHtml(resolved.page.content).slice(0, 200),
      images: [
        {
          url: `${SITE_URL}/${username}/${slug}/og`,
          width: 1200,
          height: 630,
          alt: `${resolved.page.title}`,
        },
      ],
    },
    other: {
      'og:logo': customFavicon || `${SITE_URL}/favicon.ico`,
    },
  };
}

export default async function PageDetail({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const resolved = await resolvePage(username, slug);

  if (!resolved) notFound();

  const { user_id, page, resumeData } = resolved;
  const rootClassName = postRootClassName(resumeData.design);
  const view = await getPostViewProps(username, resolved);

  if (await isPageLocked(page, user_id)) {
    return (
      <div data-post-page className={rootClassName}>
        <PageLockScreen
          username={username}
          slug={slug}
          ownerName={view.ownerName}
          avatarUrl={view.avatarUrl}
          statusEmoji={view.statusEmoji}
          profileHref={view.profileHref}
        />
      </div>
    );
  }

  const stripHtml = (html?: string) =>
    html ? html.replace(/<[^>]*>?/gm, '').trim() : '';
  const customDomain = await getCachedCustomDomainByUserId(user_id);
  const postCanonicalUrl = getCanonicalUrl(username, customDomain, slug);
  const authorCanonicalUrl = getCanonicalUrl(username, customDomain);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: page.title,
    description: stripHtml(page.content).slice(0, 200),
    image: page.url || `${SITE_URL}/${username}/${slug}/og`,
    ...(page.createdAt && {
      datePublished: page.createdAt,
      dateModified: page.createdAt,
    }),
    author: {
      '@type': 'Person',
      name: resumeData.header.name,
      url: authorCanonicalUrl,
    },
    url: postCanonicalUrl,
    mainEntityOfPage: postCanonicalUrl,
  };

  return (
    <div data-post-page className={rootClassName}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PostBody {...view} />
    </div>
  );
}
