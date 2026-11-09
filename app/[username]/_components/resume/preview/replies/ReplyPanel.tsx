'use client';

import { useEffect, useRef, useState } from 'react';
import EmojiPicker, { EmojiStyle, Theme } from 'emoji-picker-react';
import { useTheme } from 'next-themes';
import { PaperPlaneTiltIcon, SmileyIcon } from '@phosphor-icons/react/ssr';
import { Spinner } from '@/components/ui/spinner';
import { REPLY_MAX_LENGTH } from '@/lib/replies';
import { cn } from '@/lib/utils';

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
}: {
  /** Names what is being replied to, for screen readers. */
  label: string;
  isSending: boolean;
  onSend: (body: string) => void;
  onClose: () => void;
  className?: string;
}) {
  const { resolvedTheme } = useTheme();
  const [value, setValue] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const trimmed = value.trim();
  const canSend = trimmed.length > 0 && !isSending;

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  // Close on a click elsewhere or Escape (the picker closes first).
  useEffect(() => {
    const onPointer = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      // The arrow toggles the panel itself.
      if ((target as Element).closest?.('[data-reply-arrow]')) return;
      onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (pickerOpen) setPickerOpen(false);
      else onClose();
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose, pickerOpen]);

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
        'relative z-30 flex items-center gap-1 rounded-2xl bg-theme-bg p-2 shadow-[0_0_0_1px_#0000000d,0_8px_30px_#0000001f] dark:bg-theme-border dark:shadow-[0_8px_30px_#00000066]',
        className,
      )}
    >
      {pickerOpen && (
        <div className="absolute bottom-full right-0 z-40 mb-2">
          <EmojiPicker
            onEmojiClick={(emoji) => insertEmoji(emoji.emoji)}
            // The app's own light/dark choice, not the operating system's.
            theme={resolvedTheme === 'dark' ? Theme.DARK : Theme.LIGHT}
            emojiStyle={EmojiStyle.NATIVE}
            width={300}
            height={340}
            lazyLoadEmojis
            searchPlaceholder="Search emoji"
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      <div className="flex min-w-0 flex-1 items-center rounded-xl bg-black/[0.04] pr-1 dark:bg-white/[0.06]">
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
              onSend(trimmed);
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
          onClick={() => canSend && onSend(trimmed)}
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
            onClick={() => onSend(emoji)}
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
