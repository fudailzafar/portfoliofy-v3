'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';
import { useInbox } from './useReplies';
import { PersonAvatar } from './PersonAvatar';
import { displayName, fullTime, shortTime } from './format';
import type { InboxEntry } from './api';

function Preview({ entry }: { entry: InboxEntry }) {
  const last = entry.lastMessage;
  if (!last) return <span>No messages yet</span>;
  return (
    <>
      {last.mine && <span>You: </span>}
      {last.body}
    </>
  );
}

/** The inbox, shown in the sidebar panel while the Replies group is open. */
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
        <Spinner size={14} className="text-content-muted" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-6 text-sm text-content-muted">
        <p>We couldn’t load your replies.</p>
        <button
          onClick={() => refetch()}
          className="mt-2 text-content-primary underline-offset-4 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <p className="mx-4 rounded-xl border border-border-subtle px-4 py-3 text-sm leading-relaxed text-content-muted">
        Replies you send or receive will appear here.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-1 px-3" aria-label="Conversations">
      {data.map((entry) => {
        const isActive = entry.conversationId === selectedId;
        const unread = entry.unread > 0;
        return (
          <li key={entry.conversationId}>
            <Link
              href={hrefFor(entry.conversationId)}
              aria-current={isActive ? 'true' : undefined}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors',
                isActive
                  ? 'bg-surface-2 dark:bg-surface-card'
                  : 'hover:bg-surface-2 dark:hover:bg-surface-card',
              )}
            >
              <PersonAvatar person={entry.other} className="size-12" />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span
                    className={cn(
                      'truncate text-base text-content-primary',
                      unread && 'font-semibold',
                    )}
                  >
                    {displayName(entry.other)}
                  </span>
                  {entry.lastMessageAt && (
                    <time
                      dateTime={entry.lastMessageAt}
                      title={fullTime(entry.lastMessageAt)}
                      className="shrink-0 text-xs tabular-nums text-content-muted"
                    >
                      {shortTime(entry.lastMessageAt)}
                    </time>
                  )}
                </span>
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      'block min-w-0 flex-1 truncate text-sm',
                      unread
                        ? 'font-medium text-content-primary'
                        : 'text-content-muted',
                    )}
                  >
                    <Preview entry={entry} />
                  </span>
                  {unread && (
                    <span className="sr-only">
                      {entry.unread} unread{' '}
                      {entry.unread === 1 ? 'message' : 'messages'}
                    </span>
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
