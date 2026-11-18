'use client';

// Explore, laid out like read.cv's 2020 page: one 540px column with the tabs
// (Activity, New, A–Z) on the left and a "Find people" search on the right.
// Activity is a feed of statuses; New and A–Z are lists of people. Typing in
// the search swaps the list for matching people.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Twemoji from 'react-twemoji';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/ssr';
import { Spinner } from '@/components/ui/spinner';
import { ExploreSort, ExploreUser, useExplore } from '@/hooks/useExplore';
import { getOptimizedImageUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';

const TABS: { id: ExploreSort; label: string }[] = [
  { id: 'activity', label: 'Activity' },
  { id: 'new', label: 'New' },
  { id: 'a-z', label: 'A–Z' },
];

function relativeTime(dateString: string) {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000,
  );
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (minutes < 1) return 'just now';
  if (minutes < 60)
    return minutes === 1 ? 'a minute ago' : `${minutes} minutes ago`;
  if (hours < 24) return hours === 1 ? 'an hour ago' : `${hours} hours ago`;
  if (days < 30) return days === 1 ? 'a day ago' : `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return months <= 1 ? 'a month ago' : `${months} months ago`;
  const years = Math.floor(days / 365);
  return years <= 1 ? 'a year ago' : `${years} years ago`;
}

/** 48px photo with the status emoji on its corner, as read.cv showed it. */
function Photo({
  user,
  showStatus,
}: {
  user: ExploreUser;
  showStatus: boolean;
}) {
  const src = user.customImage || user.userImage;
  const name = user.name || user.username;
  return (
    <div className="relative size-12 shrink-0">
      <div className="relative size-full overflow-hidden rounded-full bg-[var(--theme-wash,#f2f2f2)]">
        {src ? (
          <Image
            src={getOptimizedImageUrl(src) || ''}
            alt=""
            fill
            sizes="48px"
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-[16px] text-theme-secondary">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      {showStatus && user.statusEmoji && (
        <div className="absolute -bottom-0.5 -right-1.5 flex h-5 w-[26px] items-center justify-center rounded-full bg-theme-bg shadow-[0_0_0_1px_var(--theme-border)]">
          <Twemoji
            tag="span"
            className="flex items-center justify-center text-[10px] leading-none"
            options={{ className: 'h-[1.2em] w-[1.2em]' }}
          >
            {user.statusEmoji}
          </Twemoji>
        </div>
      )}
    </div>
  );
}

/** A person row (New, A–Z and search results). */
function Member({ user, detail }: { user: ExploreUser; detail?: string }) {
  return (
    <Link
      href={`/${user.username}`}
      className="flex min-h-[68px] items-center py-2.5"
    >
      <Photo user={user} showStatus />
      <div className="ml-4 flex min-w-0 flex-col justify-center">
        <h3 className="truncate font-normal leading-[1.3] text-theme-primary">
          {user.name || user.username}
        </h3>
        <span className="truncate leading-[1.3] text-theme-muted">
          @{user.username}
          {detail && <> · {detail}</>}
        </span>
      </div>
    </Link>
  );
}

/** A status in the Activity feed. */
function Post({ user }: { user: ExploreUser }) {
  const when = user.statusUpdatedAt || user.updatedAt;
  return (
    <div className="flex border-b border-[var(--theme-wash,#f2f2f2)] py-6 last:border-b-0">
      <Link href={`/${user.username}`} className="h-fit shrink-0">
        <Photo user={user} showStatus />
      </Link>
      <div className="ml-4 min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <Link
            href={`/${user.username}`}
            className="text-theme-primary hover:underline hover:underline-offset-4"
          >
            {user.name || user.username}
          </Link>
          <span className="text-[length:var(--secondary-type-size)] text-theme-muted">
            {relativeTime(when)}
          </span>
        </div>
        {user.statusText ? (
          <p className="mt-1 whitespace-pre-wrap break-words text-theme-secondary">
            {user.statusText}
          </p>
        ) : (
          user.shortAbout && (
            <p className="mt-1 text-theme-secondary">{user.shortAbout}</p>
          )
        )}
      </div>
    </div>
  );
}

export function ExplorePage() {
  const [sort, setSort] = useState<ExploreSort>('activity');
  const [query, setQuery] = useState('');
  const searching = query.trim().length > 0;
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useExplore(query.trim(), searching ? 'a-z' : sort);
  const users = data?.pages.flatMap((page) => page.users) ?? [];

  // Load more as the page nears the bottom.
  useEffect(() => {
    const onScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 600;
      if (nearBottom && hasNextPage && !isFetchingNextPage) fetchNextPage();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="theme-default typography-sans flex min-h-dvh w-full justify-center bg-theme-bg font-sans text-[length:var(--type-size)] leading-[var(--line-height)]">
      <main className="w-full max-w-[540px] px-6 pb-24 pt-6 min-[481px]:px-12 min-[481px]:pt-12 min-[637px]:px-0 min-[685px]:pt-[72px]">
        <h1 className="sr-only">Explore</h1>
        <div className="flex items-center gap-4">
          <ul role="tablist" aria-label="Explore" className="flex flex-1 gap-6">
            {TABS.map((tab) => {
              const active = !searching && sort === tab.id;
              return (
                <li key={tab.id}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      setSort(tab.id);
                      setQuery('');
                    }}
                    className={cn(
                      'select-none font-medium transition-colors',
                      active
                        ? 'text-theme-primary'
                        : 'text-theme-muted hover:text-theme-secondary',
                    )}
                  >
                    {tab.label}
                  </button>
                </li>
              );
            })}
          </ul>
          <label className="relative flex h-9 w-full max-w-[200px] shrink items-center">
            <MagnifyingGlassIcon
              aria-hidden
              className="pointer-events-none absolute left-3 size-4 text-theme-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find people"
              aria-label="Find people"
              className="h-9 w-full rounded-full bg-[var(--theme-wash,#f2f2f2)] pl-9 pr-3 text-[14px] text-theme-primary placeholder:text-theme-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size={20} className="text-theme-muted" />
          </div>
        ) : isError ? (
          <div className="mt-9 text-theme-muted">
            <p>We couldn’t load people.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-1 text-theme-primary underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="mt-9 flex h-[100px] flex-col justify-center rounded-3xl px-12 text-center text-theme-muted shadow-[0_0_0_1px_var(--theme-border)]">
            <span className="truncate">
              {searching
                ? `No results for ‘${query.trim()}’`
                : 'No one here yet'}
            </span>
          </div>
        ) : searching || sort !== 'activity' ? (
          <div className="mt-[26px]">
            {users.map((user) => (
              <Member
                key={user.username}
                user={user}
                detail={
                  !searching && sort === 'new'
                    ? `joined ${relativeTime(user.createdAt)}`
                    : undefined
                }
              />
            ))}
          </div>
        ) : (
          <div className="mt-3">
            {users.map((user) => (
              <Post key={user.username} user={user} />
            ))}
          </div>
        )}

        {isFetchingNextPage && (
          <div className="flex justify-center py-6">
            <Spinner size={16} className="text-theme-muted" />
          </div>
        )}
      </main>
    </div>
  );
}
