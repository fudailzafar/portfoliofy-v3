'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Spinner } from '@/components/ui/spinner';
import { useRepliesStore } from '@/store/useRepliesStore';
import { Composer } from './Composer';
import { MessageThread } from './MessageThread';
import { PersonAvatar } from './PersonAvatar';
import { ThreadMenu } from './ThreadMenu';
import { displayName } from './format';
import { repliesApi, type ThreadEntry } from './api';
import {
  useBlockPerson,
  useMarkRead,
  useSendMessage,
  useThread,
} from './useReplies';

const NEAR_BOTTOM_PX = 160;

/** The open conversation, beside the inbox. */
export function RepliesTab() {
  const selectedId = useRepliesStore((state) => state.selectedId);
  const select = useRepliesStore((state) => state.select);

  if (!selectedId) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-content-muted">
        Pick a conversation to read and answer replies.
      </div>
    );
  }

  // Keyed so switching conversations resets scroll, drafts and older pages.
  return (
    <Conversation
      key={selectedId}
      conversationId={selectedId}
      onClose={() => select(null)}
    />
  );
}

function Conversation({
  conversationId,
  onClose,
}: {
  conversationId: string;
  onClose: () => void;
}) {
  const { data: thread, isLoading, isError } = useThread(conversationId);
  const send = useSendMessage(conversationId);
  const unblock = useBlockPerson(conversationId);
  const markRead = useMarkRead();

  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const [older, setOlder] = useState<ThreadEntry[]>([]);
  const [olderHasMore, setOlderHasMore] = useState<boolean | null>(null);
  const [loadingOlder, setLoadingOlder] = useState(false);

  const messages = useMemo(() => {
    if (!thread) return [];
    const seen = new Set(thread.messages.map((m) => m.id));
    return [...older.filter((m) => !seen.has(m.id)), ...thread.messages];
  }, [older, thread]);

  const lastId = messages[messages.length - 1]?.id;
  const hasMore = olderHasMore ?? thread?.hasMore ?? false;

  // Open at the newest message, and follow new ones unless the reader has
  // scrolled up to read.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [lastId]);

  // Opening a conversation, or a new message arriving while it is open, counts
  // as reading it.
  const markedUpTo = useRef<number | null>(null);
  useEffect(() => {
    if (!lastId || markedUpTo.current === lastId) return;
    if (document.visibilityState !== 'visible') return;
    markedUpTo.current = lastId;
    markRead.mutate(conversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastId, conversationId]);

  const loadOlder = useCallback(async () => {
    const first = messages[0];
    if (!first || loadingOlder) return;
    setLoadingOlder(true);
    const el = scrollRef.current;
    const previousHeight = el?.scrollHeight ?? 0;
    try {
      const page = await repliesApi.thread(conversationId, first.id);
      stickToBottom.current = false;
      setOlder((current) => [...page.messages, ...current]);
      setOlderHasMore(page.hasMore);
      // Keep the reader where they were instead of jumping to the top.
      requestAnimationFrame(() => {
        if (el) el.scrollTop = el.scrollHeight - previousHeight;
      });
    } finally {
      setLoadingOlder(false);
    }
  }, [conversationId, loadingOlder, messages]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner size={16} className="text-content-muted" />
      </div>
    );
  }

  if (isError || !thread) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-sm text-content-muted">
        <p>This conversation isn’t available.</p>
        <button
          onClick={onClose}
          className="text-content-primary underline-offset-4 hover:underline"
        >
          Back to replies
        </button>
      </div>
    );
  }

  const name = displayName(thread.other);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center gap-4 border-b border-border-subtle px-4 py-4 sm:px-8">
        <PersonAvatar person={thread.other} className="size-12" />
        <Link
          href={`/${thread.other.username}`}
          target="_blank"
          className="min-w-0 flex-1 truncate text-2xl text-content-primary hover:underline hover:underline-offset-4"
        >
          {name}
        </Link>
        <ThreadMenu
          conversationId={conversationId}
          thread={thread}
          onHidden={onClose}
        />
      </header>

      <div
        ref={scrollRef}
        onScroll={(event) => {
          const el = event.currentTarget;
          stickToBottom.current =
            el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
        }}
        className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-8"
        role="log"
        aria-live="polite"
      >
        <div className="mx-auto max-w-[37rem]">
          {hasMore && (
            <div className="flex justify-center pb-2">
              <button
                onClick={() => void loadOlder()}
                disabled={loadingOlder}
                className="text-sm text-content-muted transition-colors hover:text-content-primary disabled:opacity-50"
              >
                {loadingOlder ? 'Loading…' : 'Show earlier messages'}
              </button>
            </div>
          )}
          <MessageThread
            messages={messages}
            you={thread.you}
            other={thread.other}
          />
        </div>
      </div>

      <footer className="shrink-0 px-4 pb-4 pt-3 sm:px-8">
        <div className="mx-auto max-w-[37rem]">
          {thread.canReply ? (
            <Composer
              onSend={(body) => {
                stickToBottom.current = true;
                return send.mutateAsync(body);
              }}
              isSending={send.isPending}
            />
          ) : thread.blockedByYou ? (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-2 px-4 py-3 text-sm text-content-secondary dark:bg-surface-card">
              <p>You blocked {name}.</p>
              <button
                onClick={() =>
                  unblock.mutate({
                    username: thread.other.username,
                    blocked: false,
                  })
                }
                disabled={unblock.isPending}
                className="font-medium text-content-primary underline-offset-4 hover:underline disabled:opacity-50"
              >
                Unblock
              </button>
            </div>
          ) : (
            <p className="rounded-xl bg-surface-2 px-4 py-3 text-sm text-content-muted dark:bg-surface-card">
              You can’t reply to this conversation right now.
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
