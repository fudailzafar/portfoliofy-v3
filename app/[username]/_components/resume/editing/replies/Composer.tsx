'use client';

// read.cv's message box: a 36px field (8px corners, #f2f2f2 / #333) that grows
// with the text, the smiley inside on the right, and beside it a 🔥 that
// sends at once, which turns into the send arrow while you type. Enter sends,
// Shift+Enter adds a line.

import { useEffect, useRef, useState } from 'react';
import { EmojiPickerPopover } from '@/components/composite/EmojiPicker';
import { Spinner } from '@/components/ui/spinner';
import { REPLY_MAX_LENGTH } from '@/lib/replies';
import {
  SendIcon,
  SmileyIcon,
} from '@/app/[username]/_components/resume/preview/replies/icons';

const QUICK_EMOJI = '🔥';

export function Composer({
  onSend,
  isSending,
}: {
  onSend: (body: string) => Promise<unknown>;
  isSending: boolean;
}) {
  const [value, setValue] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const smileyRef = useRef<HTMLButtonElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);

  const trimmed = value.trim();
  const typing = value.length > 0;

  // Grow with the text, up to a few lines.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const send = async (body: string) => {
    if (!body || isSending) return;
    try {
      await onSend(body);
      setValue('');
      setPickerOpen(false);
    } catch {
      // The mutation shows its own error; keep what was typed.
    }
  };

  // read.cv closes the picker once an emoji is picked.
  const insertEmoji = (emoji: string) => {
    setPickerOpen(false);
    const el = textareaRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    setValue(value.slice(0, start) + emoji + value.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  };

  return (
    <div className="flex items-end gap-[10px]">
      <div
        ref={fieldRef}
        className="relative min-w-0 flex-1 rounded-lg bg-[color-mix(in_srgb,var(--theme-primary)_5.5%,var(--theme-bg))] dark:bg-theme-border"
      >
        <textarea
          ref={textareaRef}
          value={value}
          rows={1}
          maxLength={REPLY_MAX_LENGTH}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              void send(trimmed);
            }
          }}
          placeholder="Send a message"
          aria-label="Message"
          // 16px on phones so iOS doesn't zoom; read.cv's 14px from sm up.
          className="block max-h-40 min-h-9 w-full resize-none bg-transparent py-[7px] pl-3 pr-10 text-base leading-[22px] text-theme-primary outline-none placeholder:text-theme-muted sm:text-[length:var(--type-size)]"
        />
        <div className="absolute bottom-0.5 right-0">
          <div className="relative">
            <button
              ref={smileyRef}
              type="button"
              onClick={() => setPickerOpen((open) => !open)}
              aria-label="Add an emoji"
              aria-expanded={pickerOpen}
              className="flex h-8 items-center px-2 text-theme-muted outline-none focus-visible:text-theme-primary active:opacity-70"
            >
              <SmileyIcon />
            </button>
            <EmojiPickerPopover
              open={pickerOpen}
              onClose={() => setPickerOpen(false)}
              onSelect={insertEmoji}
              anchorRef={smileyRef}
              measureRef={fieldRef}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => void send(typing ? trimmed : QUICK_EMOJI)}
        disabled={isSending}
        aria-label={typing ? 'Send message' : `Send ${QUICK_EMOJI}`}
        className="flex size-9 shrink-0 items-center justify-center text-theme-muted outline-none focus-visible:text-theme-primary active:opacity-70 disabled:opacity-50"
      >
        {isSending ? (
          <Spinner size={16} />
        ) : typing ? (
          <SendIcon />
        ) : (
          <span
            aria-hidden
            className="block text-[36px] leading-none [transform:scale(.5)]"
          >
            {QUICK_EMOJI}
          </span>
        )}
      </button>
    </div>
  );
}
