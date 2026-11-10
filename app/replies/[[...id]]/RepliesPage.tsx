'use client';

// The Replies screen, laid out like read.cv's (measured from its screens and
// stylesheet): a 330px inbox and a 540px conversation, centred together with
// hairlines on both sides and between them. On a phone, one at a time.
// Each conversation has its own URL.

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CaretLeftIcon } from '@/components/icons/readcv';
import { ConversationList } from '@/app/[username]/_components/resume/editing/replies/ConversationList';
import { RepliesTab } from '@/app/[username]/_components/resume/editing/replies/RepliesTab';
import { cn } from '@/lib/utils';

export function RepliesPage({
  conversationId,
}: {
  conversationId: string | null;
}) {
  const router = useRouter();
  const showingThread = conversationId !== null;

  return (
    // theme-default: read.cv's palette (#222 / #eee / #bbb / #888 / #333).
    <div className="theme-default typography-sans flex h-dvh min-h-0 w-full justify-center bg-theme-bg font-sans text-[length:var(--type-size)] leading-[var(--line-height)]">
      <section
        aria-label="Replies"
        className={cn(
          'scrollbar-hide h-full w-full shrink-0 overflow-y-auto md:w-[330px] md:border-x md:border-theme-border',
          showingThread ? 'hidden md:block' : 'block',
        )}
      >
        <h1 className="px-[28px] pb-[18px] pt-6 text-[18px] font-normal leading-[26px] text-theme-primary">
          Replies
        </h1>
        <ConversationList
          selectedId={conversationId}
          hrefFor={(id) => `/replies/${id}`}
        />
      </section>

      <section
        aria-label="Conversation"
        className={cn(
          'h-full w-full min-w-0 flex-col md:w-[540px] md:shrink-0 md:border-r md:border-theme-border',
          showingThread ? 'flex' : 'hidden md:flex',
        )}
      >
        {showingThread && (
          <Link
            href="/replies"
            className="flex shrink-0 items-center gap-1 px-4 pt-4 text-theme-primary md:hidden"
          >
            <CaretLeftIcon className="size-5" />
            Replies
          </Link>
        )}
        <div className="min-h-0 flex-1">
          <RepliesTab
            conversationId={conversationId}
            onClose={() => router.replace('/replies')}
          />
        </div>
      </section>
    </div>
  );
}
