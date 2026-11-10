'use client';

// read.cv's inbox rows, at its measured sizes: 64px rows 12px in from the
// column edges with 8px corners, a 40px avatar, the name and a one-line
// preview at 14px, and the time at 12px. Unread rows are brighter, not dotted.

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { useInbox } from './useReplies';
import { PersonAvatar } from './PersonAvatar';
import { displayName, fullTime, shortTime } from './format';
import type { InboxEntry } from './api';

// read.cv's input grey: #f2f2f2 on white, #333 on #222.
const ROW_FILL =
  'bg-[color-mix(in_srgb,var(--theme-primary)_5.5%,var(--theme-bg))] dark:bg-theme-border';

function Preview({ entry }: { entry: InboxEntry }) {
  const last = entry.lastMessage;
  if (!last) return <>No messages yet</>;
  return (
    <>
      {last.mine && 'You: '}
      {last.body}
    </>
  );
}

export function ConversationList({
  selectedId,
  hrefFor,
}: {
  /** The conversation open beside the list, if any. */
  selectedId: string | null;
  /** Each conversation is a link, so it has its own URL. */
  hrefFor: (conversationId: string) => string;
}) {
  const { data, isLoading, isError, refetch } = useInbox();

  if (isLoading) {
    return (
      <div className="flex justify-center px-6 py-6">
        <Spinner size={14} className="text-theme-muted" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-6 text-theme-muted">
        <p>We couldn’t load your replies.</p>
        <button
          onClick={() => refetch()}
          className="mt-1 font-medium text-theme-primary"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <p className="mx-6 rounded-xl border border-theme-border px-4 py-[14px] text-theme-muted">
        Replies you send or receive will appear here.{' '}
        <Link href="/faq" className="font-medium text-theme-primary">
          Learn more
        </Link>
        .
      </p>
    );
  }

  return (
    <ul aria-label="Conversations">
      {data.map((entry) => {
        const isActive = entry.conversationId === selectedId;
        const unread = entry.unread > 0;
        return (
          <li key={entry.conversationId}>
            <Link
              href={hrefFor(entry.conversationId)}
              aria-current={isActive ? 'true' : undefined}
              className={cn(
                'mx-3 flex h-16 items-center gap-3 rounded-lg px-4',
                isActive
                  ? ROW_FILL
                  : 'hover:bg-black/[.03] dark:hover:bg-white/[.03]',
              )}
            >
              <PersonAvatar person={entry.other} className="size-10" />
              <span className="min-w-0 flex-1 leading-[18px]">
                <span className="flex items-baseline justify-between gap-3">
                  <span
                    className={cn(
                      'truncate text-theme-primary',
                      unread && 'font-medium',
                    )}
                  >
                    {displayName(entry.other)}
                  </span>
                  {entry.lastMessageAt && (
                    <time
                      dateTime={entry.lastMessageAt}
                      title={fullTime(entry.lastMessageAt)}
                      className="shrink-0 text-[length:var(--secondary-type-size)] tabular-nums text-theme-muted"
                    >
                      {shortTime(entry.lastMessageAt)}
                    </time>
                  )}
                </span>
                <span
                  className={cn(
                    'mt-1.5 block truncate',
                    unread
                      ? 'font-medium text-theme-primary'
                      : 'text-theme-muted',
                  )}
                >
                  <Preview entry={entry} />
                  {unread && (
                    <span className="sr-only"> ({entry.unread} unread)</span>
                  )}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
