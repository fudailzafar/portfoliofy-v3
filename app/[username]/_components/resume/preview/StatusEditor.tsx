'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';
import Twemoji from 'react-twemoji';
import { Button } from '@/components/ui/button';
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
      animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
      exit={{ height: 0, opacity: 0, marginTop: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="overflow-visible"
    >
      <div
        ref={containerRef}
        className="relative flex w-full flex-col gap-1 rounded-3xl bg-theme-border p-4 shadow-sm"
      >
        {/* Speech Bubble Tail — centered under the status toggle button */}
        <svg
          width="48"
          height="12"
          viewBox="0 0 48 12"
          fill="none"
          className="absolute -top-[10px] left-[56px]"
          aria-hidden="true"
        >
          <path
            d="M0 12V11H6C13 11 17 1 24 1C31 1 35 11 42 11H48V12H0Z"
            className="fill-theme-border"
          />
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="bg-theme-bg-hover hover:bg-theme-bg-hover/80 h-9 rounded-md border border-theme-border px-6 font-medium text-theme-primary shadow-sm"
                >
                  Clear status
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleSave}
                  variant="outline"
                  className="bg-theme-bg-hover hover:bg-theme-bg-hover/80 h-9 rounded-md border border-theme-border px-6 font-medium text-theme-primary shadow-sm"
                >
                  Set status
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
