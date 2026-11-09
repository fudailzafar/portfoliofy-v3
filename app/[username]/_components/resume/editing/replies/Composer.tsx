'use client';

import { useEffect, useRef, useState } from 'react';
import EmojiPicker, { EmojiStyle, Theme } from 'emoji-picker-react';
import { useTheme } from 'next-themes';
import { PaperPlaneTiltIcon, SmileyIcon } from '@phosphor-icons/react/ssr';
import { Spinner } from '@/components/ui/spinner';
import { REPLY_MAX_LENGTH } from '@/lib/replies';
import { cn } from '@/lib/utils';

const QUICK_EMOJI = '🔥';
const SHOW_COUNT_FROM = REPLY_MAX_LENGTH - 200;

/**
 * Message box. Enter sends, Shift+Enter adds a line. With nothing typed the
 * button sends a quick 🔥, as on read.cv.
 */
export function Composer({
  onSend,
  isSending,
}: {
  onSend: (body: string) => Promise<unknown>;
  isSending: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const [value, setValue] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  const trimmed = value.trim();
  const tooLong = value.length > REPLY_MAX_LENGTH;
  const canSend = trimmed.length > 0 && !tooLong && !isSending;

  // Grow with the text, up to a few lines.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  useEffect(() => {
    if (!pickerOpen) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent) {
        if (event.key === 'Escape') setPickerOpen(false);
        return;
      }
      const target = event.target as Node;
      if (
        !pickerRef.current?.contains(target) &&
        !(target as Element).closest?.('[data-emoji-toggle]')
      ) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [pickerOpen]);

  const send = async (body: string) => {
    try {
      await onSend(body);
      setValue('');
      setPickerOpen(false);
    } catch {
      // The mutation shows its own error; keep what was typed.
    }
  };

  const insertEmoji = (emoji: string) => {
    const el = textareaRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    const next = value.slice(0, start) + emoji + value.slice(end);
    setValue(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  };

  return (
    <div className="relative flex items-end gap-3">
      {pickerOpen && (
        <div
          ref={pickerRef}
          className="absolute bottom-full right-0 z-20 mb-2 sm:right-12"
        >
          <EmojiPicker
            onEmojiClick={(emoji) => insertEmoji(emoji.emoji)}
            // The app's own light/dark choice, not the operating system's.
            theme={resolvedTheme === 'dark' ? Theme.DARK : Theme.LIGHT}
            emojiStyle={EmojiStyle.NATIVE}
            width={320}
            height={360}
            lazyLoadEmojis
            searchPlaceholder="Search emoji"
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      <div className="flex min-w-0 flex-1 items-end rounded-xl bg-surface-2 pr-2 dark:bg-surface-card">
        <textarea
          ref={textareaRef}
          value={value}
          rows={1}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              if (canSend) void send(trimmed);
            }
          }}
          placeholder="Send a message…"
          aria-label="Message"
          className="max-h-40 min-h-11 w-full resize-none bg-transparent px-4 py-3 text-base text-content-primary placeholder:text-content-muted focus:outline-none sm:text-[15px]"
        />
        <button
          type="button"
          data-emoji-toggle
          onClick={() => setPickerOpen((open) => !open)}
          aria-label="Add an emoji"
          aria-expanded={pickerOpen}
          className="mb-1.5 flex size-8 shrink-0 items-center justify-center rounded-full text-content-muted transition-colors hover:text-content-primary"
        >
          <SmileyIcon className="size-5" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => void send(trimmed || QUICK_EMOJI)}
        disabled={isSending || tooLong}
        aria-label={trimmed ? 'Send message' : `Send ${QUICK_EMOJI}`}
        className={cn(
          'mb-0.5 flex size-10 shrink-0 items-center justify-center rounded-full text-content-muted transition-colors hover:text-content-primary disabled:opacity-50',
          trimmed && 'text-content-primary',
        )}
      >
        {isSending ? (
          <Spinner size={16} />
        ) : trimmed ? (
          <PaperPlaneTiltIcon className="size-6" weight="fill" />
        ) : (
          <span className="text-2xl leading-none" aria-hidden>
            {QUICK_EMOJI}
          </span>
        )}
      </button>

      {value.length >= SHOW_COUNT_FROM && (
        <p
          className={cn(
            'absolute -top-6 right-0 text-xs tabular-nums',
            tooLong ? 'text-red-500' : 'text-content-muted',
          )}
          role="status"
        >
          {value.length} / {REPLY_MAX_LENGTH}
        </p>
      )}
    </div>
  );
}
