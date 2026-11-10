'use client';

// read.cv's conversation, at its measured sizes: no bubbles, a 24px avatar in
// the gutter at the start of each block, text in one column 36px in. Replies
// to a profile item open with a 12px grey line ("John S replied to your
// project") and the quoted item at 12px behind a rule; messages are 14px.
// Times stay out of sight: on hover, and for screen readers.

import { cn } from '@/lib/utils';
import { REPLY_SECTION_NOUN, type ReplyContext } from '@/lib/replies';
import { PersonAvatar } from './PersonAvatar';
import { displayName, fullTime, shortTime } from './format';
import type { ThreadData, ThreadEntry } from './api';

function ContextCard({ context }: { context: ReplyContext }) {
  return (
    <blockquote className="border-l-2 border-[color-mix(in_srgb,var(--theme-primary)_20%,var(--theme-bg))] pl-4 text-[length:var(--secondary-type-size)] leading-[var(--line-height)]">
      {context.kind === 'status' ? (
        <p className="text-theme-secondary">
          {context.emoji && <span className="mr-1.5">{context.emoji}</span>}
          {context.text}
        </p>
      ) : (
        <>
          {context.year && (
            <p className="tabular-nums text-theme-muted">{context.year}</p>
          )}
          <p className="text-theme-primary">
            {context.title}
            {context.subtitle && <> at {context.subtitle}</>}
          </p>
          {context.excerpt && (
            <p className="text-theme-secondary">{context.excerpt}</p>
          )}
        </>
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
            className={cn('flex gap-3', newGroup ? 'mt-9 first:mt-6' : 'mt-3')}
          >
            <div className="w-6 shrink-0">
              {newGroup && (
                <PersonAvatar person={author} className="size-6 text-[10px]" />
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-3">
              {newGroup && message.context && (
                <p className="flex min-h-6 items-center text-[length:var(--secondary-type-size)] text-theme-muted">
                  {contextLabel(message.context, message.mine, otherName)}
                </p>
              )}
              {message.context && <ContextCard context={message.context} />}
              <p
                title={fullTime(message.createdAt)}
                className={cn(
                  'whitespace-pre-wrap break-words text-theme-primary',
                  message.emojiOnly
                    ? 'text-[40px] leading-[48px]'
                    : 'leading-[var(--line-height)]',
                  // Centre a first line on the 24px avatar beside it.
                  newGroup && !message.context && !message.emojiOnly && 'pt-px',
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
