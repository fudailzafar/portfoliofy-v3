'use client';

// The Following screen, laid out like the original's: a "Following" heading, a
// summary row of recent followers with "See all", then one row per follower
// with a Follow back button. One 540px column, like a profile.

import { Fragment, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { UsersIcon } from '@phosphor-icons/react/ssr';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { PersonAvatar } from '@/app/[username]/_components/resume/editing/replies/PersonAvatar';
import {
  displayName,
  fullTime,
  shortTime,
} from '@/app/[username]/_components/resume/editing/replies/format';
import { FollowListDialog } from '@/components/follow/FollowListDialog';
import { FollowToggle } from '@/components/follow/FollowToggle';
import { recentFollowersSentence } from '@/components/follow/recentFollowers';
import {
  useFollowOverview,
  useMarkFollowersSeen,
} from '@/components/follow/useFollows';

const EVENT_LIMIT = 50;
const FACEPILE = 8;

export function FollowingPage() {
  const { data, isLoading, isError, refetch } = useFollowOverview();
  const markSeen = useMarkFollowersSeen();
  const marked = useRef(false);
  const [listOpen, setListOpen] = useState(false);

  // Opening the page clears the dot in the sidebar.
  useEffect(() => {
    if (data && !marked.current) {
      marked.current = true;
      markSeen.mutate();
    }
  }, [data, markSeen]);

  return (
    <div className="theme-default typography-sans flex min-h-dvh w-full justify-center bg-theme-bg font-sans text-[length:var(--type-size)] leading-[var(--line-height)]">
      <main className="w-full max-w-[540px] px-6 pb-24 pt-6 min-[481px]:px-12 min-[481px]:pt-12 min-[637px]:px-0 min-[685px]:pt-[72px]">
        <h1 className="text-[18px] font-normal leading-[26px] text-theme-primary">
          Following
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size={20} className="text-theme-muted" />
          </div>
        ) : isError || !data ? (
          <div className="py-16 text-center text-theme-secondary">
            <p>We couldn’t load your followers.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-2 text-theme-primary underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="mt-9 flex flex-col gap-8">
            <SummaryRow data={data} onSeeAll={() => setListOpen(true)} />

            {data.followers.slice(0, EVENT_LIMIT).map((person) => (
              <div key={person.id} className="flex items-center gap-4">
                <Link href={`/${person.username}`} className="shrink-0">
                  <PersonAvatar person={person} />
                </Link>
                <p className="min-w-0 flex-1 text-theme-secondary">
                  <Link
                    href={`/${person.username}`}
                    className="text-theme-primary hover:underline hover:underline-offset-4"
                  >
                    {displayName(person)}
                  </Link>{' '}
                  followed you.{' '}
                  <time
                    dateTime={person.followedAt}
                    title={fullTime(person.followedAt)}
                    className="ml-1 text-[length:var(--secondary-type-size)] text-theme-muted"
                  >
                    {shortTime(person.followedAt)}
                  </time>
                </p>
                <FollowToggle
                  username={person.username}
                  youFollow={person.youFollow}
                  followsYou
                />
              </div>
            ))}
          </div>
        )}

        {data && (
          <FollowListDialog
            open={listOpen}
            onOpenChange={setListOpen}
            data={data}
          />
        )}
      </main>
    </div>
  );
}

function SummaryRow({
  data,
  onSeeAll,
}: {
  data: NonNullable<ReturnType<typeof useFollowOverview>['data']>;
  onSeeAll: () => void;
}) {
  const people = data.followers.map((p) => ({
    name: displayName(p),
    username: p.username,
  }));
  const parts = recentFollowersSentence(people);
  const hasAnyone = data.followers.length > 0 || data.following.length > 0;

  return (
    <div className="flex items-start gap-4">
      <div className="grid size-10 shrink-0 place-items-center rounded-full bg-theme-border text-theme-primary">
        <UsersIcon weight="fill" className="size-5" aria-hidden />
      </div>
      <div className="min-w-0 flex-1 pt-2">
        <p className="text-theme-secondary">
          {parts.map((part, i) =>
            typeof part === 'string' ? (
              <Fragment key={i}>{part}</Fragment>
            ) : (
              <Link
                key={i}
                href={`/${part.username}`}
                className="text-theme-primary hover:underline hover:underline-offset-4"
              >
                {part.name}
              </Link>
            ),
          )}
        </p>
        {data.followers.length > 0 && (
          <div className="mt-2 flex -space-x-1" aria-hidden>
            {data.followers.slice(0, FACEPILE).map((person) => (
              <PersonAvatar
                key={person.id}
                person={person}
                className="size-[18px] ring-2 ring-theme-bg [&_*]:text-[8px]"
              />
            ))}
          </div>
        )}
      </div>
      {hasAnyone && (
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={onSeeAll}
        >
          See all
        </Button>
      )}
    </div>
  );
}
