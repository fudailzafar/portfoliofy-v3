'use client';

import { cn } from '@/lib/utils';
import { REPLY_SECTION_NOUN, type ReplyContext } from '@/lib/replies';
import { PersonAvatar } from './PersonAvatar';
import { displayName, fullTime, shortTime } from './format';
import type { ThreadData, ThreadEntry } from './api';

function ContextCard({ context }: { context: ReplyContext }) {
  if (context.kind === 'status') {
    return (
      <blockquote className="border-l-2 border-border-strong pl-4 text-[15px] leading-relaxed text-content-secondary">
        <span className="mr-1.5" aria-hidden>
          {context.emoji}
        </span>
        {context.text}
      </blockquote>
    );
  }
  return (
    <blockquote className="space-y-0.5 border-l-2 border-border-strong pl-4 text-[15px] leading-relaxed">
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

/**
 * Messages without bubbles. A small avatar in the left gutter marks who is
 * speaking at the start of each block; the text lines up in one column.
 * Times are out of the way: on hover, and for screen readers.
 */
export function MessageThread({
  messages,
  you,
  other,
}: {
  messages: ThreadEntry[];
  you: ThreadData['you'];
  other: ThreadData['other'];
}) {
  const otherName = displayName(other);

  return (
    <ol className="flex flex-col" aria-label={`Conversation with ${otherName}`}>
      {messages.map((message, index) => {
        const newGroup = startsGroup(messages[index - 1], message);
        const author = message.mine ? you : other;
        return (
          <li
            key={message.id}
            className={cn('flex gap-4', newGroup ? 'mt-8' : 'mt-2')}
          >
            <div className="w-8 shrink-0">
              {newGroup && (
                <PersonAvatar person={author} className="size-8 text-xs" />
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-3">
              {newGroup && message.context && (
                <p className="flex min-h-8 items-center text-[15px] text-content-muted">
                  {contextLabel(message.context, message.mine, otherName)}
                </p>
              )}
              {message.context && <ContextCard context={message.context} />}
              <p
                title={fullTime(message.createdAt)}
                className={cn(
                  'whitespace-pre-wrap break-words text-content-primary',
                  message.emojiOnly
                    ? 'text-5xl leading-tight'
                    : 'text-[17px] leading-relaxed',
                  // Lines up the first line with the avatar beside it.
                  newGroup &&
                    !message.context &&
                    !message.emojiOnly &&
                    'pt-0.5',
                )}
              >
                {message.body}
                <time dateTime={message.createdAt} className="sr-only">
                  {' '}
                  {message.mine ? 'You' : otherName},{' '}
                  {shortTime(message.createdAt)}
                </time>
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
