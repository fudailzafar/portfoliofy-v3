'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { EmojiStyle, Theme } from 'emoji-picker-react';
import { useTheme } from 'next-themes';
import { PaperPlaneTiltIcon, SmileyIcon } from '@phosphor-icons/react/ssr';
import { Spinner } from '@/components/ui/spinner';
import { REPLY_MAX_LENGTH } from '@/lib/replies';
import { cn } from '@/lib/utils';

// Loaded when the picker is first opened, so a panel that sits on the page
// all the time doesn't pull the picker in with it.
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

// The same four read.cv offers.
const QUICK_EMOJI = ['🔥', '👍', '😯', '📈'] as const;

/**
 * The "Reply directly…" bar. A quick emoji sends at once; typing swaps them
 * for a send button. Enter sends, Escape closes.
 */
export default function ReplyPanel({
  label,
  isSending,
  onSend,
  onClose,
  className,
  variant = 'floating',
}: {
  /** Names what is being replied to, for screen readers. */
  label: string;
  isSending: boolean;
  /** May return a promise; the field clears once it succeeds. */
  onSend: (body: string) => Promise<unknown> | void;
  onClose?: () => void;
  className?: string;
  /** Floating opens over an item; inline sits in the page, as in the status. */
  variant?: 'floating' | 'inline';
}) {
  const inline = variant === 'inline';
  const { resolvedTheme } = useTheme();
  const [value, setValue] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const trimmed = value.trim();
  const canSend = trimmed.length > 0 && !isSending;

  useEffect(() => {
    if (!inline) inputRef.current?.focus({ preventScroll: true });
  }, [inline]);

  const submit = (body: string) => {
    const result = onSend(body);
    if (result && typeof (result as Promise<unknown>).then === 'function') {
      (result as Promise<unknown>).then(
        () => {
          setValue('');
          setPickerOpen(false);
        },
        () => {
          // The caller shows the error; keep what was typed.
        },
      );
    }
  };

  // Close on a click elsewhere or Escape (the picker closes first). An inline
  // panel never closes, so it only reacts to Escape for its picker.
  useEffect(() => {
    const onPointer = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      // The arrow toggles the panel itself.
      if ((target as Element).closest?.('[data-reply-arrow]')) return;
      onClose?.();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (pickerOpen) setPickerOpen(false);
      else if (!inline) onClose?.();
    };
    if (!inline) {
      document.addEventListener('mousedown', onPointer);
      document.addEventListener('touchstart', onPointer);
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose, pickerOpen, inline]);

  const insertEmoji = (emoji: string) => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    setValue(value.slice(0, start) + emoji + value.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  };

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label={label}
      className={cn(
        'relative flex items-center gap-1',
        !inline &&
          'z-30 rounded-2xl bg-theme-bg p-2 shadow-[0_0_0_1px_#0000000d,0_8px_30px_#0000001f] dark:bg-theme-border dark:shadow-[0_8px_30px_#00000066]',
        className,
      )}
    >
      {pickerOpen && (
        <div className="absolute bottom-full right-0 z-40 mb-2">
          <EmojiPicker
            onEmojiClick={(emoji) => insertEmoji(emoji.emoji)}
            // The app's own light/dark choice, not the operating system's.
            theme={(resolvedTheme === 'dark' ? 'dark' : 'light') as Theme}
            emojiStyle={'native' as EmojiStyle}
            width={300}
            height={340}
            lazyLoadEmojis
            searchPlaceholder="Search emoji"
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      <div
        className={cn(
          'flex min-w-0 flex-1 items-center rounded-xl pr-1',
          // In the status the field is darker than the bubble it sits in.
          inline
            ? 'bg-black/[0.04] dark:bg-theme-bg'
            : 'bg-black/[0.04] dark:bg-white/[0.06]',
        )}
      >
        <input
          ref={inputRef}
          value={value}
          maxLength={REPLY_MAX_LENGTH}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' &&
              !event.nativeEvent.isComposing &&
              canSend
            ) {
              event.preventDefault();
              submit(trimmed);
            }
          }}
          placeholder="Reply directly…"
          aria-label="Reply directly"
          autoComplete="off"
          // 16px so iOS doesn't zoom the page when the field is focused.
          className="h-10 min-w-0 flex-1 bg-transparent px-3 text-base text-theme-primary placeholder:text-theme-muted focus:outline-none sm:text-[14px]"
        />
        <button
          type="button"
          onClick={() => setPickerOpen((open) => !open)}
          aria-label="Add an emoji"
          aria-expanded={pickerOpen}
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-theme-muted transition-colors hover:text-theme-primary"
        >
          <SmileyIcon className="size-5" />
        </button>
      </div>

      {trimmed ? (
        <button
          type="button"
          onClick={() => canSend && submit(trimmed)}
          disabled={!canSend}
          aria-label="Send reply"
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-theme-primary transition-opacity disabled:opacity-50"
        >
          {isSending ? (
            <Spinner size={16} />
          ) : (
            <PaperPlaneTiltIcon className="size-6" weight="fill" />
          )}
        </button>
      ) : (
        QUICK_EMOJI.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => submit(emoji)}
            disabled={isSending}
            aria-label={`Send ${emoji}`}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-xl leading-none transition-transform hover:scale-110 active:scale-95 disabled:opacity-50 sm:size-10 sm:text-[22px]"
          >
            {emoji}
          </button>
        ))
      )}
    </div>
  );
}
