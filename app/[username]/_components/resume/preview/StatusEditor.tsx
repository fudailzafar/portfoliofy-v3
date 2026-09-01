'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';
import Twemoji from 'react-twemoji';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';

export function StatusEditor({
  initialEmoji,
  initialText,
  onClose,
  onSave,
}: {
  initialEmoji?: string | null;
  initialText?: string | null;
  onClose: () => void;
  onSave: (
    emoji: string | null,
    text: string | null,
    date: Date | null,
  ) => void;
}) {
  const [emoji, setEmoji] = useState(initialEmoji || '😐');
  const [text, setText] = useState(initialText || '');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Ignore clicks on the toggle button itself so we don't conflict with its onClick
      if ((e.target as Element).closest('#status-toggle-btn')) {
        return;
      }

      // Close emoji picker if clicked outside of it
      if (
        showEmojiPicker &&
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node)
      ) {
        setShowEmojiPicker(false);
      } else if (
        !showEmojiPicker &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        // Do not close the editor if clicked outside
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker, onClose]);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/user/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_emoji: emoji, status_text: text }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      onSave(emoji, text, new Date());
      onClose();
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleClear = async () => {
    try {
      const res = await fetch('/api/user/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_emoji: null, status_text: null }),
      });
      if (!res.ok) throw new Error('Failed to clear status');
      onSave(null, null, null);
      onClose();
      toast.success('Status cleared');
    } catch (error) {
      toast.error('Failed to clear status');
    }
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0, marginTop: 0 }}
      animate={{ height: 'auto', opacity: 1, marginTop: 20 }}
      exit={{ height: 0, opacity: 0, marginTop: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="overflow-visible"
    >
      <div
        ref={containerRef}
        className="relative flex w-full flex-col gap-1 rounded-3xl bg-theme-bg p-4 shadow-[0_0_0_1px_#0000000d,0_1px_4px_#0000000d] dark:bg-theme-border dark:shadow-none"
      >
        {/* Speech Bubble Tail — centered under the status toggle button */}
        <svg
          width="26"
          height="12"
          viewBox="0 0 26 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute -top-[11px] left-[67px]"
          aria-hidden="true"
        >
          <mask
            id="editor-tail-mask"
            style={{ maskType: 'alpha' }}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="26"
            height="10"
          >
            <rect width="26" height="10" fill="#C4C4C4" />
          </mask>
          <g mask="url(#editor-tail-mask)" className="dark:hidden">
            <g filter="url(#editor-tail-filter)">
              <path
                d="M11.5858 3.41422C12.3668 2.63317 13.6332 2.63317 14.4142 3.41422L19.6569 8.65685C21.1571 10.1571 23.192 11 25.3137 11H26V12H0V11H0.686293C2.80802 11 4.84286 10.1571 6.34315 8.65685L11.5858 3.41422Z"
                fill="#C4C4C4"
              />
              <path
                d="M26.5 11V10.5H26H25.3137C23.3246 10.5 21.4169 9.70982 20.0104 8.3033L14.7678 3.06066C13.7915 2.08435 12.2085 2.08435 11.2322 3.06066L5.98959 8.3033C4.58307 9.70982 2.67542 10.5 0.686293 10.5H0H-0.5V11V12V12.5H0H26H26.5V12V11Z"
                stroke="black"
                strokeOpacity="0.05"
              />
            </g>
          </g>
          <path
            d="M11.5858 3.41422C12.3668 2.63317 13.6332 2.63317 14.4142 3.41422L19.6569 8.65685C21.1571 10.1571 23.192 11 25.3137 11H26V12H0V11H0.686293C2.80802 11 4.84286 10.1571 6.34315 8.65685L11.5858 3.41422Z"
            className="fill-theme-bg dark:fill-theme-border"
          />
          <defs>
            <filter
              id="editor-tail-filter"
              x="-5"
              y="-1.17157"
              width="36"
              height="19.1716"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix
                in="SourceAlpha"
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              />
              <feOffset dy="1" />
              <feGaussianBlur stdDeviation="2" />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"
              />
              <feBlend
                mode="normal"
                in2="BackgroundImageFix"
                result="effect1_dropShadow"
              />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="effect1_dropShadow"
                result="shape"
              />
            </filter>
          </defs>
        </svg>

        <div className="flex items-start gap-3">
          <div className="relative">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="bg-theme-bg-hover flex size-10 shrink-0 items-center justify-center rounded-full text-xl transition-colors hover:opacity-80"
                  >
                    <Twemoji
                      tag="span"
                      className="flex items-center justify-center leading-none"
                      options={{ className: 'h-[1em] w-[1em]' }}
                    >
                      {emoji}
                    </Twemoji>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Choose emoji</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  ref={pickerRef}
                  className="absolute left-0 top-12 z-50 shadow-xl"
                >
                  <EmojiPicker
                    emojiStyle={EmojiStyle.TWITTER}
                    onEmojiClick={(e) => {
                      setEmoji(e.emoji);
                      setShowEmojiPicker(false);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <input
              type="text"
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Looking to build something new..."
              className="w-full bg-transparent pt-2 text-sm text-theme-primary placeholder:text-theme-secondary focus:outline-none focus:ring-0"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') onClose();
              }}
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={onClose}
                className="px-4 text-[14px] font-medium text-theme-primary hover:underline hover:underline-offset-4"
              >
                Cancel
              </button>
              {!text.trim() ? (
                <button
                  onClick={handleClear}
                  className="h-9 rounded-md border border-border-strong bg-surface-card px-6 text-sm font-medium text-content-primary shadow-sm active:bg-surface-2 dark:border-none dark:bg-border-strong dark:active:bg-[#555]"
                >
                  Clear status
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="h-9 rounded-md border border-border-strong bg-surface-card px-6 text-sm font-medium text-content-primary shadow-sm active:bg-surface-2 dark:border-none dark:bg-border-strong dark:active:bg-[#555]"
                >
                  Set status
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
