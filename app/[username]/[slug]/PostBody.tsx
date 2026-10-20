import Link from 'next/link';
import { Lock } from 'lucide-react';
import { PageContent } from '@/components/composite/PageContent';
import { ShareButton } from './ShareButton';
import { PostStatusBadge } from './PostStatusBadge';

type NextPage =
  | { href: string; locked: true }
  | {
      href: string;
      locked: false;
      title: string;
      thumbnailUrl?: string;
      readMinutes: number;
    };

export interface PostBodyProps {
  title: string;
  content: string;
  ownerName: string;
  avatarUrl?: string;
  statusEmoji?: string | null;
  profileHref: string;
  nextPage: NextPage | null;
}

// The post itself. Rendered by the page and, once unlocked, by unlockPage.
export function PostBody({
  title,
  content,
  ownerName,
  avatarUrl,
  statusEmoji,
  profileHref,
  nextPage,
}: PostBodyProps) {
  return (
    // Vertical insets: 24px top on phones, 48px up to 636px, then growing to
    // 72px; 96px at the bottom until 685px, then 72px.
    <div className="mx-auto w-full max-w-[540px] flex-1 px-6 pb-24 pt-6 min-[481px]:pt-12 min-[637px]:pt-[calc(50vw-270px)] sm:px-0 min-[685px]:pb-[72px] min-[685px]:pt-[72px]">
      <Link
        href={profileHref}
        className="flex w-fit flex-col items-start gap-4"
      >
        {avatarUrl ? (
          <span className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt={ownerName}
              className="h-12 w-12 rounded-full object-cover"
            />
            {statusEmoji && <PostStatusBadge emoji={statusEmoji} />}
          </span>
        ) : null}
        <span className="text-sm text-theme-muted hover:underline hover:underline-offset-4">
          {ownerName}
        </span>
      </Link>

      <h1 className="mb-6 text-xl font-normal leading-6 text-theme-primary">
        {title}
      </h1>

      <PageContent html={content} />

      {nextPage && (
        <div className="mt-16">
          <p className="text-xs font-normal text-theme-muted">
            More from {ownerName}
          </p>
          <Link
            href={nextPage.href}
            className="mt-4 flex h-[90px] w-full overflow-hidden rounded-lg border border-theme-border bg-theme-border"
          >
            <div className="flex h-full w-[108px] shrink-0 items-center justify-center overflow-hidden bg-[color-mix(in_srgb,var(--theme-border)_40%,transparent)] sm:w-[152px]">
              {nextPage.locked ? (
                <Lock aria-hidden="true" className="h-4 w-4 text-theme-muted" />
              ) : (
                nextPage.thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={nextPage.thumbnailUrl}
                    alt={nextPage.title}
                    className="h-full w-full object-cover"
                  />
                )
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-4">
              <h4 className="line-clamp-1 text-[length:var(--type-size)] leading-[var(--line-height)] text-theme-primary">
                {nextPage.locked ? 'This page is private' : nextPage.title}
              </h4>
              <p className="text-[length:var(--type-size)] leading-[var(--line-height)] text-theme-muted">
                {nextPage.locked
                  ? 'Enter password to view'
                  : `${nextPage.readMinutes} min read`}
              </p>
            </div>
          </Link>
        </div>
      )}

      <div className="mt-12 flex items-center justify-center gap-6">
        <Link
          href={profileHref}
          className="font-regular text-sm text-theme-muted hover:underline hover:underline-offset-4"
        >
          Back to profile
        </Link>
        <ShareButton />
      </div>
    </div>
  );
}
