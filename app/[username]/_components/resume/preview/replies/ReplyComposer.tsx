'use client';

// read.cv's reply composer, rebuilt from its stylesheet and script.
// One 36px row: the field and the quick emoji share the same grid cell. The
// field is as wide as the row minus the emoji (36px each, plus 10px); once
// you type it widens to leave 46px, the emoji fade and slide away, and a send
// button springs in 41px past the field's right edge.

import { useCallback, useEffect, useRef, useState } from 'react';
import { MotionConfig, motion } from 'framer-motion';
import { EmojiPickerPopover } from '@/components/composite/EmojiPicker';
import { REPLY_MAX_LENGTH } from '@/lib/replies';
import { cn } from '@/lib/utils';
import { SendIcon, SmileyIcon } from './icons';
import { READCV_SPRING } from './spring';
import { useIsTouchDevice } from './useIsTouchDevice';

// read.cv's four, in its order.
export const QUICK_REACTIONS = ['🔥', '🤙', '😯', '📈'] as const;
// Below this window width read.cv keeps only the first one.
const NARROW_WINDOW = 436;
const REACTION_SIZE = 36;

function useWindowWidth() {
  const [width, setWidth] = useState<number | null>(null);
  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return width;
}

export function ReplyComposer({
  label,
  signedIn,
  onRequireSignIn,
  onSend,
  padded = false,
  clearOnSend = true,
  focusOnMount = false,
}: {
  /** Names what is being replied to, for screen readers. */
  label: string;
  signedIn: boolean;
  /** Called instead of sending when the visitor isn't signed in. */
  onRequireSignIn: () => void;
  /** The quick emoji used, if any, is passed for the "Sent" pill. */
  onSend: (body: string, reaction?: string) => Promise<unknown>;
  /** 12px around the row, as in read.cv's item popover; none in the status. */
  padded?: boolean;
  clearOnSend?: boolean;
  focusOnMount?: boolean;
}) {
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const smileyRef = useRef<HTMLButtonElement>(null);
  const selection = useRef({ start: 0, end: 0 });
  const windowWidth = useWindowWidth();
  const isTouch = useIsTouchDevice();

  const typing = value.length > 0;
  const reactions =
    windowWidth !== null && windowWidth < NARROW_WINDOW
      ? QUICK_REACTIONS.slice(0, 1)
      : QUICK_REACTIONS;

  useEffect(() => {
    if (focusOnMount && signedIn) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [focusOnMount, signedIn]);

  const send = async (body: string, reaction?: string) => {
    if (!signedIn) return onRequireSignIn();
    const trimmed = body.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      await onSend(trimmed, reaction);
      if (clearOnSend && !reaction) setValue('');
    } catch {
      // The caller shows the error; keep what was typed.
    } finally {
      setSending(false);
    }
  };

  // Remember the cursor when the field loses focus to the emoji button, so a
  // picked emoji goes where the cursor was.
  const rememberSelection = () => {
    const el = inputRef.current;
    if (!el) return;
    selection.current = {
      start: el.selectionStart ?? value.length,
      end: el.selectionEnd ?? value.length,
    };
  };

  const insertEmoji = useCallback((emoji: string) => {
    setPickerOpen(false);
    const { start, end } = selection.current;
    setValue((current) => current.slice(0, start) + emoji + current.slice(end));
    const el = inputRef.current;
    el?.focus();
    setTimeout(() => {
      el?.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 10);
  }, []);

  const closePicker = useCallback(() => setPickerOpen(false), []);

  const fieldWidth = typing
    ? 'calc(100% - 46px)'
    : `calc(100% - ${REACTION_SIZE * reactions.length + 10}px)`;

  return (
    <MotionConfig reducedMotion="user">
      <div
        role="group"
        aria-label={label}
        className={cn(
          'grid grid-cols-1 grid-rows-[36px] overflow-hidden',
          padded && 'p-3',
          // The picker opens outside the row.
          pickerOpen && 'overflow-visible',
        )}
      >
        <motion.div
          initial={false}
          animate={{ width: fieldWidth }}
          transition={READCV_SPRING}
          className="relative z-[1] col-start-1 row-start-1"
        >
          <div
            ref={fieldRef}
            className="relative flex h-9 items-center rounded-lg bg-[var(--theme-wash)] px-3 dark:bg-theme-bg"
          >
            <input
              ref={inputRef}
              value={value}
              maxLength={REPLY_MAX_LENGTH}
              readOnly={!signedIn}
              onChange={(event) => setValue(event.target.value)}
              onFocus={() => {
                if (!signedIn) {
                  inputRef.current?.blur();
                  onRequireSignIn();
                }
              }}
              onBlur={rememberSelection}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  void send(value);
                }
              }}
              placeholder="Reply directly…"
              aria-label="Reply directly"
              autoComplete="off"
              // 16px on phones so iOS doesn't zoom; read.cv's 14px from sm up.
              className="mr-7 h-9 w-full border-none bg-transparent text-base leading-9 text-theme-primary outline-none placeholder:text-theme-muted sm:text-[length:var(--type-size)]"
            />
          </div>

          {!isTouch && (
            <div className="absolute right-0 top-0.5">
              <div className="relative">
                <button
                  ref={smileyRef}
                  type="button"
                  onMouseDown={rememberSelection}
                  onClick={() => {
                    if (!signedIn) return onRequireSignIn();
                    setPickerOpen((open) => !open);
                  }}
                  aria-label="Add an emoji"
                  aria-expanded={pickerOpen}
                  className="flex h-8 items-center px-2 text-theme-muted outline-none focus-visible:text-theme-primary active:opacity-70"
                >
                  <SmileyIcon />
                </button>
                <EmojiPickerPopover
                  open={pickerOpen}
                  onClose={closePicker}
                  onSelect={insertEmoji}
                  anchorRef={smileyRef}
                  measureRef={fieldRef}
                />
              </div>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: typing ? 1 : 0, scale: typing ? 1 : 0 }}
            transition={READCV_SPRING}
            style={{ pointerEvents: typing ? 'auto' : 'none' }}
            className="absolute -right-[41px] top-0.5"
          >
            <button
              type="button"
              onClick={() => void send(value)}
              disabled={sending}
              tabIndex={typing ? 0 : -1}
              aria-hidden={!typing}
              aria-label="Send reply"
              className="flex h-8 items-center text-theme-muted outline-none focus-visible:text-theme-primary active:opacity-70 disabled:opacity-50"
            >
              <SendIcon />
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={false}
          animate={{
            opacity: typing ? 0 : 1,
            x: reactions.length > 1 ? (typing ? 20 : 0) : 1,
            scale: reactions.length > 1 ? 1 : typing ? 0 : 1,
          }}
          transition={READCV_SPRING}
          style={{ pointerEvents: typing ? 'none' : 'auto' }}
          className="col-start-1 row-start-1 ml-auto flex w-fit flex-row justify-end"
        >
          {reactions.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => void send(emoji, emoji)}
              disabled={sending}
              tabIndex={typing ? -1 : 0}
              aria-label={`Send ${emoji}`}
              className="focus-visible:ring-theme-primary/30 relative flex size-9 items-center outline-none focus-visible:rounded-lg focus-visible:ring-2 active:opacity-70"
            >
              <span
                aria-hidden
                className="block w-full text-[36px] leading-none [transform:scale(.5)]"
              >
                {emoji}
              </span>
            </button>
          ))}
        </motion.div>
      </div>
    </MotionConfig>
  );
}
