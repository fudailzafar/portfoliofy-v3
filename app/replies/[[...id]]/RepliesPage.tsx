'use client';

// The whole Replies screen, laid out like read.cv's: the inbox in one column
// and the open conversation beside it, each with a hairline between them.
// On a phone it shows one at a time. Each conversation has its own URL.

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CaretLeftIcon } from '@phosphor-icons/react/ssr';
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
    <div className="flex h-screen min-h-0 w-full bg-surface-1">
      {/* The inbox: 440px wide on a computer, the whole screen on a phone. */}
      <section
        aria-label="Replies"
        className={cn(
          'scrollbar-hide h-full w-full shrink-0 overflow-y-auto border-r border-border-subtle md:w-[440px]',
          showingThread ? 'hidden md:block' : 'block',
        )}
      >
        <h1 className="px-6 pb-4 pt-6 text-[18px] font-normal text-content-primary">
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
          'h-full min-w-0 flex-1 flex-col',
          showingThread ? 'flex' : 'hidden md:flex',
        )}
      >
        {showingThread && (
          <Link
            href="/replies"
            className="flex shrink-0 items-center gap-1 px-4 pt-4 text-sm text-content-primary md:hidden"
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
