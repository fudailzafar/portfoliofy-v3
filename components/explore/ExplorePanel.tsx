'use client';

// The Explore panel that slides out beside the page, like the original's sidebar:
// search on top, then Activity / New / A–Z. It stays mounted while you move
// from one profile to the next, so the list and its scroll position are
// untouched and only the page beside it changes.

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from '@phosphor-icons/react/ssr';
import { Spinner } from '@/components/ui/spinner';
import { ExploreSort, useExplore } from '@/hooks/useExplore';
import { searchWords } from '@/lib/exploreSearch';
import { Member, Post, TABS } from './parts';
import { cn } from '@/lib/utils';

// the original's tab underline: a very stiff spring, so it snaps with no overshoot.
const UNDERLINE_SPRING = {
  type: 'spring',
  stiffness: 700,
  damping: 50,
} as const;
const FADE = { duration: 0.3 } as const;

export function ExplorePanel({ onClose }: { onClose: () => void }) {
  const [sort, setSort] = useState<ExploreSort>('activity');
  const [query, setQuery] = useState('');
  const words = searchWords(query);
  const searching = words.length > 0;
  const inputRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
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

  // Load more when the end of the list scrolls into view.
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '300px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, users.length]);

  const listKey = searching ? 'search' : sort;

  return (
    <div
      className="theme-default typography-sans flex h-full min-h-0 flex-col bg-theme-bg text-[length:var(--type-size)] leading-[var(--line-height)]"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <div className="z-10 shrink-0 bg-theme-bg px-5 pt-6">
        <div className="flex h-9 items-center gap-3">
          <label className="relative flex h-[38px] min-w-0 flex-1 items-center">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, location, title…"
              aria-label="Search by name, location or title"
              autoComplete="off"
              className={cn(
                'h-[38px] w-full rounded-full bg-[var(--theme-wash,#f2f2f2)] pl-4 text-[14px] text-theme-primary placeholder:text-theme-muted focus:outline-none',
                query ? 'pr-9' : 'pr-4',
              )}
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="absolute right-3 text-theme-muted hover:text-theme-primary"
              >
                <XIcon className="size-4" />
              </button>
            )}
          </label>
          <button
            type="button"
            onClick={onClose}
            className="text-theme-primary hover:underline hover:underline-offset-4"
          >
            Done
          </button>
        </div>

        {!searching && (
          <ul
            role="tablist"
            aria-label="Explore"
            className="mt-3 flex border-b border-theme-border-secondary px-1"
          >
            {TABS.map((tab) => {
              const active = sort === tab.id;
              return (
                <li key={tab.id} className="relative mr-6 last:mr-0">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSort(tab.id)}
                    className={cn(
                      'select-none py-2.5 font-medium transition-colors',
                      active
                        ? 'text-theme-primary'
                        : 'text-theme-muted hover:text-theme-secondary',
                    )}
                  >
                    {tab.label}
                  </button>
                  {active && (
                    <motion.span
                      layoutId="explore-tab-underline"
                      transition={UNDERLINE_SPRING}
                      className="absolute inset-x-0 -bottom-px h-px bg-theme-primary"
                    />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-16">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={listKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={FADE}
          >
            {isLoading ? (
              <div className="flex justify-center py-14">
                <Spinner size={18} className="text-theme-muted" />
              </div>
            ) : isError ? (
              <div className="mt-6 text-theme-muted">
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
              <div className="mt-6 flex h-[100px] flex-col justify-center rounded-3xl px-8 text-center text-theme-muted shadow-[0_0_0_1px_var(--theme-border-secondary)]">
                <span className="truncate">
                  {searching
                    ? `No results for ‘${query.trim()}’`
                    : 'No one here yet'}
                </span>
              </div>
            ) : searching || sort !== 'activity' ? (
              <div className="mt-3">
                {users.map((user) => (
                  <Member
                    key={user.username}
                    user={user}
                    tab={sort}
                    words={words}
                    compact
                  />
                ))}
              </div>
            ) : (
              <div className="mt-1">
                {users.map((user) => (
                  <Post key={user.username} user={user} />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        <div ref={sentinelRef} className="h-px" />
        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <Spinner size={16} className="text-theme-muted" />
          </div>
        )}
      </div>
    </div>
  );
}
