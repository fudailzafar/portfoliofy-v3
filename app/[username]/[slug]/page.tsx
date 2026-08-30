import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { getUserData } from '../utils';
import { findPageBySlug, estimateReadMinutes } from '@/lib/resume';
import {
  getOptimizedImageUrl,
  isOwnS3ImageUrl,
  getCanonicalUrl,
} from '@/lib/utils';
import { getCachedCustomDomainByUserId } from '@/lib/server/cachedFunctions';
import { PageContent } from '@/components/composite/PageContent';
import { ShareButton } from './ShareButton';

const parsePageDate = (dateStr?: string) => {
  if (!dateStr) return null;
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
};

async function resolvePage(username: string, slug: string) {
  const { user_id, resume, userProfile } = await getUserData(username);
  if (!user_id || !resume?.resumeData) return null;

  const page = findPageBySlug(resume.resumeData, slug);
  if (!page || page.hidden) return null;

  return { user_id, page, resumeData: resume.resumeData, userProfile };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}): Promise<Metadata> {
  const { username, slug } = await params;
  const resolved = await resolvePage(username, slug);

  // See app/[username]/page.tsx for why notFound() belongs here too, not
  // just in the page body — otherwise Next commits to a 200 before the
  // page's own notFound() gets a chance to override it.
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

  return {
    title: `${resolved.page.title}`,
    description: stripHtml(resolved.page.content).slice(0, 200),
    icons: customFavicon ? { icon: customFavicon } : undefined,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: resolved.page.title,
      description: stripHtml(resolved.page.content).slice(0, 200),
      images: [
        {
          url: `https://portfoliofy.me/${username}/${slug}/og`,
          width: 1200,
          height: 630,
          alt: `${resolved.page.title}`,
        },
      ],
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

  const { user_id, page, resumeData, userProfile } = resolved;
  const design = resumeData.design;
  const avatarUrl = getOptimizedImageUrl(
    userProfile?.avatarUrl || userProfile?.image || undefined,
  );

  const headersList = await import('next/headers').then((m) => m.headers());
  const hostHeader = headersList.get('host') || '';
  const hostname = hostHeader.split(':')[0];
  const isSubdomainView =
    (hostname.endsWith('.portfoliofy.me') &&
      hostname !== 'www.portfoliofy.me') ||
    (hostname.endsWith('.localhost') && hostname !== 'localhost');
  const isPersonalDomainView = username.includes('.') || isSubdomainView;
  const profileHref = isPersonalDomainView ? '/' : `/${username}`;

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
    image: page.url || `https://portfoliofy.me/${username}/${slug}/og`,
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

  const publishedPages = (resumeData.pages || [])
    .filter((p) => !p.hidden)
    .map((p) => ({ ...p, parsedDate: parsePageDate(p.createdAt) }))
    .sort(
      (a, b) => (b.parsedDate?.getTime() || 0) - (a.parsedDate?.getTime() || 0),
    );
  const currentIndex = publishedPages.findIndex((p) => p.id === page.id);

  const nextPage =
    currentIndex !== -1 && publishedPages.length > 1
      ? currentIndex === 0
        ? publishedPages[publishedPages.length - 1]
        : publishedPages[currentIndex - 1]
      : null;
  const nextPageHref = nextPage
    ? isPersonalDomainView
      ? `/${nextPage.slug || nextPage.id}`
      : `/${username}/${nextPage.slug || nextPage.id}`
    : null;

  return (
    <div
      className={`flex min-h-screen flex-col bg-theme-bg ${
        design?.typography === 'serif'
          ? 'font-serif'
          : design?.typography === 'mono'
            ? 'font-mono'
            : 'font-sans'
      } typography-${design?.typography || 'sans'} theme-${design?.theme || 'default'}`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto w-full max-w-[540px] flex-1 px-6 py-16 sm:px-0 sm:py-[72px]">
        <Link
          href={profileHref}
          className="flex w-fit flex-col items-start gap-3"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={resumeData.header.name}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : null}
          <span className="text-sm text-theme-muted hover:underline hover:underline-offset-4">
            {resumeData.header.name}
          </span>
        </Link>

        <h1 className="mb-6 text-xl font-normal leading-6 text-theme-primary">
          {page.title}
        </h1>

        <PageContent html={page.content || ''} />

        {nextPage && nextPageHref && (
          <div className="mt-16">
            <p className="text-xs font-normal text-theme-muted">
              More from {resumeData.header.name}
            </p>
            <Link
              href={nextPageHref}
              className="mt-4 flex h-[90px] w-full overflow-hidden rounded-lg border border-theme-border bg-theme-border"
            >
              <div className="h-full w-[108px] shrink-0 overflow-hidden bg-[color-mix(in_srgb,var(--theme-border)_40%,transparent)] sm:w-[152px]">
                {nextPage.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={nextPage.url}
                    alt={nextPage.title || 'Thumbnail'}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-4">
                <h4 className="line-clamp-1 text-[length:var(--type-size)] leading-[var(--line-height)] text-theme-primary">
                  {nextPage.title || 'Untitled'}
                </h4>
                <p className="text-[length:var(--type-size)] leading-[var(--line-height)] text-theme-muted">
                  {estimateReadMinutes(nextPage.content || '')} min read
                </p>
              </div>
            </Link>
          </div>
        )}

        <div className="mt-12 flex items-center justify-center gap-8">
          <Link
            href={profileHref}
            className="font-regular text-sm text-theme-muted hover:underline hover:underline-offset-4"
          >
            Back to profile
          </Link>
          <ShareButton />
        </div>
      </div>
    </div>
  );
}
