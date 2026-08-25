import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { getUserData } from '../utils';
import { findPageBySlug } from '@/lib/resume';
import { getOptimizedImageUrl } from '@/lib/utils';
import { PageContent } from './PageContent';
import { ShareButton } from './ShareButton';

async function resolvePage(username: string, slug: string) {
  const { resume, userProfile } = await getUserData(username);
  if (!resume?.resumeData) return null;

  const found = findPageBySlug(resume.resumeData, slug);
  if (!found) return null;

  return { page: found.page, resumeData: resume.resumeData, userProfile };
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

  return {
    title: `${resolved.page.title} · ${resolved.resumeData.header.name}`,
    description: stripHtml(resolved.page.content).slice(0, 200),
    openGraph: {
      title: resolved.page.title,
      description: stripHtml(resolved.page.content).slice(0, 200),
      images: resolved.page.url ? [{ url: resolved.page.url }] : undefined,
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

  const { page, resumeData, userProfile } = resolved;
  const design = resumeData.design;
  const avatarUrl = getOptimizedImageUrl(
    userProfile?.avatarUrl || userProfile?.image || undefined,
  );

  // On a personal domain/subdomain, proxy.ts already rewrites `/` to
  // `/{username}` internally — a link built as `/{username}` here would
  // self-nest into a broken path there, so the profile link needs to be
  // domain-relative instead. Same isPersonalDomainView check as
  // app/[username]/page.tsx.
  const headersList = await import('next/headers').then((m) => m.headers());
  const hostHeader = headersList.get('host') || '';
  const hostname = hostHeader.split(':')[0];
  const isSubdomainView =
    (hostname.endsWith('.portfoliofy.me') &&
      hostname !== 'www.portfoliofy.me') ||
    (hostname.endsWith('.localhost') && hostname !== 'localhost');
  const isPersonalDomainView = username.includes('.') || isSubdomainView;
  const profileHref = isPersonalDomainView ? '/' : `/${username}`;

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
      <div className="mx-auto w-full max-w-[540px] flex-1 px-6 py-16 sm:px-0 sm:py-[72px]">
        {/* Avatar sits above the name, not beside it — matches read.cv's
            own layout (confirmed by inspecting several archived pages:
            avatar and name share the same left edge, stacked vertically). */}
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

        {page.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={page.url}
            alt={page.title}
            className="mb-8 w-full object-cover"
          />
        ) : null}

        <PageContent html={page.content || ''} />

        <div className="mt-16 flex items-center justify-center gap-8 pt-6">
          <Link
            href={`/${username}`}
            className="text-sm font-medium text-theme-muted hover:underline hover:underline-offset-4"
          >
            Back to profile
          </Link>
          <ShareButton />
        </div>
      </div>
    </div>
  );
}
