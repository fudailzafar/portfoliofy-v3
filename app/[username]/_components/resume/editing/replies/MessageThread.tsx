'use client';

import { cn } from '@/lib/utils';
import { REPLY_SECTION_NOUN, type ReplyContext } from '@/lib/replies';
import { displayName, fullTime, shortTime } from './format';
import type { ThreadData, ThreadEntry } from './api';

function ContextCard({ context }: { context: ReplyContext }) {
  if (context.kind === 'status') {
    return (
      <blockquote className="border-l-2 border-border-strong pl-3 text-sm text-content-secondary">
        <span className="mr-1.5" aria-hidden>
          {context.emoji}
        </span>
        {context.text}
      </blockquote>
    );
  }
  return (
    <blockquote className="space-y-0.5 border-l-2 border-border-strong pl-3 text-sm">
      {context.year && (
        <p className="tabular-nums text-content-muted">{context.year}</p>
      )}
      <p className="text-content-primary">
        {context.title}
        {context.subtitle && (
          <span className="text-content-muted"> at {context.subtitle}</span>
        )}
      </p>
      {context.excerpt && (
        <p className="line-clamp-4 text-content-secondary">{context.excerpt}</p>
      )}
    </blockquote>
  );
}

function contextLabel(
  context: ReplyContext,
  mine: boolean,
  otherName: string,
): string {
  const noun =
    context.kind === 'status' ? 'status' : REPLY_SECTION_NOUN[context.section];
  return mine
    ? `You replied to ${otherName}’s ${noun}`
    : `${otherName} replied to your ${noun}`;
}

// Messages from the same person close together read as one block.
const GROUP_GAP_MS = 5 * 60 * 1000;

function startsGroup(previous: ThreadEntry | undefined, message: ThreadEntry) {
  if (!previous || previous.mine !== message.mine || message.context) {
    return true;
  }
  return (
    new Date(message.createdAt).getTime() -
      new Date(previous.createdAt).getTime() >
    GROUP_GAP_MS
  );
}

export function MessageThread({
  messages,
  other,
}: {
  messages: ThreadEntry[];
  other: ThreadData['other'];
}) {
  const otherName = displayName(other);

  return (
    <ol className="flex flex-col" aria-label={`Conversation with ${otherName}`}>
      {messages.map((message, index) => {
        const newGroup = startsGroup(messages[index - 1], message);
        return (
          <li
            key={message.id}
            className={cn('flex flex-col gap-2', newGroup ? 'mt-6' : 'mt-1.5')}
          >
            {newGroup && (
              <div className="flex items-baseline gap-2 text-xs text-content-muted">
                <span>
                  {message.context
                    ? contextLabel(message.context, message.mine, otherName)
                    : message.mine
                      ? 'You'
                      : otherName}
                </span>
                <time
                  dateTime={message.createdAt}
                  title={fullTime(message.createdAt)}
                  className="tabular-nums"
                >
                  {shortTime(message.createdAt)}
                </time>
              </div>
            )}
            {message.context && <ContextCard context={message.context} />}
            <p
              className={cn(
                'whitespace-pre-wrap break-words text-content-primary',
                message.emojiOnly
                  ? 'text-5xl leading-tight'
                  : 'text-[15px] leading-relaxed',
              )}
            >
              {message.body}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
