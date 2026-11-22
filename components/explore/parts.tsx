'use client';

// Pieces of the Explore lists shared by the /explore page and the Explore panel.

import { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Twemoji from 'react-twemoji';
import { StatusText } from '@/components/composite/StatusText';
import { ExploreSort, ExploreUser } from '@/hooks/useExplore';
import { cn, getOptimizedImageUrl } from '@/lib/utils';
import { shortenLinksInText } from '@/lib/displayUrl';
import { highlightParts, matchedLine } from '@/lib/exploreSearch';

export const TABS: { id: ExploreSort; label: string }[] = [
  { id: 'activity', label: 'Activity' },
  { id: 'new', label: 'New' },
  { id: 'a-z', label: 'A–Z' },
];

export function relativeTime(dateString: string) {
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

/**
 * A photo with the status emoji on its corner, as the original showed it: 48px on
 * the Explore page, 34px (`compact`) in the side panel, where rows are tighter.
 */
export function Photo({
  user,
  showStatus,
  compact = false,
}: {
  user: ExploreUser;
  showStatus: boolean;
  compact?: boolean;
}) {
  const src = user.customImage || user.userImage;
  const name = user.name || user.username;
  return (
    <div
      className={cn('relative shrink-0', compact ? 'size-[34px]' : 'size-12')}
    >
      <div className="relative size-full overflow-hidden rounded-full bg-[var(--theme-wash,#f2f2f2)]">
        {src ? (
          <Image
            src={getOptimizedImageUrl(src) || ''}
            alt=""
            fill
            sizes={compact ? '34px' : '48px'}
            className="object-cover"
          />
        ) : (
          <div
            className={cn(
              'flex size-full items-center justify-center text-theme-secondary',
              compact ? 'text-[14px]' : 'text-[16px]',
            )}
          >
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      {showStatus && user.statusEmoji && (
        <div
          className={cn(
            'absolute flex items-center justify-center rounded-full bg-theme-bg shadow-[0_0_0_1px_var(--theme-border)]',
            compact
              ? '-bottom-0.5 -right-1.5 h-[18px] w-[22px]'
              : '-bottom-0.5 -right-1.5 h-5 w-[26px]',
          )}
        >
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

/** Their title, or @username when they haven't written one. */
function titleOrHandle(user: ExploreUser) {
  return user.shortAbout?.trim() || `@${user.username}`;
}

/**
 * A person row (New, A–Z and search results). The second line follows the tab:
 * when they joined (New), their status (Activity) or their title, or @username
 * without one (A–Z). While searching, a title or location that matched the
 * words is shown instead, with the matching part in bold, as on the original.
 */
export function Member({
  user,
  tab,
  words = [],
  compact = false,
}: {
  user: ExploreUser;
  tab: ExploreSort;
  words?: string[];
  /** The side panel's tighter row, measured from the original's own. */
  compact?: boolean;
}) {
  const matched = words.length ? matchedLine(user, words) : null;
  let second: React.ReactNode;
  if (matched) {
    second = highlightParts(matched, words).map((part, i) =>
      part.match ? (
        <strong key={i} className="font-medium">
          {part.text}
        </strong>
      ) : (
        <Fragment key={i}>{part.text}</Fragment>
      ),
    );
  } else if (tab === 'new') {
    second = `Joined ${relativeTime(user.createdAt)}`;
  } else if (tab === 'activity' && user.statusText?.trim()) {
    second = shortenLinksInText(user.statusText.trim());
  } else {
    second = titleOrHandle(user);
  }
  return (
    <Link
      href={`/${user.username}`}
      className={cn(
        'flex items-center',
        compact ? 'min-h-[51px] py-[7px]' : 'min-h-[68px] py-2.5',
      )}
    >
      <Photo user={user} showStatus compact={compact} />
      <div
        className={cn(
          'flex min-w-0 flex-col justify-center',
          compact ? 'ml-3' : 'ml-4',
        )}
      >
        <h3 className="truncate font-normal leading-[1.3] text-theme-primary">
          {user.name || user.username}
        </h3>
        <span className="truncate leading-[1.3] text-theme-muted">
          {second}
        </span>
      </div>
    </Link>
  );
}

/** A status in the Activity feed. */
export function Post({ user }: { user: ExploreUser }) {
  const when = user.statusUpdatedAt || user.updatedAt;
  return (
    <div className="flex border-b border-theme-border-secondary py-6 last:border-b-0">
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
          <StatusText
            text={user.statusText}
            className="mt-1 text-theme-secondary"
          />
        ) : (
          user.shortAbout && (
            <p className="mt-1 text-theme-secondary">{user.shortAbout}</p>
          )
        )}
      </div>
    </div>
  );
}
