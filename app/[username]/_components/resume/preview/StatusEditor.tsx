'use client';

import React, { useState, useRef, useEffect } from 'react';
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
        // Close the entire editor if clicked outside of it and picker is closed
        onClose();
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
        className="relative w-full max-w-lg rounded-3xl border border-border-strong bg-surface-1 p-4 shadow-sm"
      >
        {/* Speech Bubble Tail */}
        <div className="absolute -top-[9px] left-[62px] h-4 w-4 rotate-45 rounded-tl-sm border-l border-t border-border-strong bg-surface-1 md:left-[78px]" />

        <div className="flex items-start gap-3">
          <div className="relative">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xl transition-colors hover:bg-surface-3"
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
              className="w-full bg-transparent pt-2 text-sm text-content-primary placeholder:text-content-muted focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') onClose();
              }}
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-content-secondary"
              >
                Cancel
              </Button>
              {!text.trim() ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="text-content-secondary"
                >
                  Clear status
                </Button>
              ) : (
                <Button size="sm" onClick={handleSave}>
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
