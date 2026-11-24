'use client';

import { useEffect, useState } from 'react';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/ssr';
import { Spinner } from '@/components/ui/spinner';
import { ExploreSort, useExplore } from '@/hooks/useExplore';
import { searchWords } from '@/lib/exploreSearch';
import { Member, Post, TABS } from '@/components/explore/parts';
import { cn } from '@/lib/utils';

export function ExplorePage() {
  const [sort, setSort] = useState<ExploreSort>('activity');
  const [query, setQuery] = useState('');
  const words = searchWords(query);
  const searching = words.length > 0;
  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useExplore(query.trim(), sort);
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
              placeholder="Name, location, title…"
              aria-label="Search by name, location or title"
              className="h-9 w-full rounded-full bg-[var(--theme-wash,#f2f2f2)] pl-9 pr-3 text-[14px] text-theme-primary placeholder:text-theme-muted focus:outline-none"
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
          <div className="mt-9 flex h-[100px] flex-col justify-center rounded-3xl px-12 text-center text-theme-muted shadow-[0_0_0_1px_var(--theme-border-secondary)]">
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
                tab={sort}
                words={words}
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
