'use client';

import React, { useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { AttachmentSchemaType } from '@/lib/resume';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LightboxProps {
  attachments: AttachmentSchemaType[];
  currentIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIndexChange: (index: number) => void;
}

export function Lightbox({
  attachments,
  currentIndex,
  open,
  onOpenChange,
  onIndexChange,
}: LightboxProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = React.useRef(false);

  const handlePrevious = useCallback(() => {
    onIndexChange((currentIndex - 1 + attachments.length) % attachments.length);
  }, [currentIndex, attachments.length, onIndexChange]);

  const handleNext = useCallback(() => {
    onIndexChange((currentIndex + 1) % attachments.length);
  }, [currentIndex, attachments.length, onIndexChange]);

  // Setup initial scroll position when opened
  useEffect(() => {
    if (scrollRef.current && open) {
      isProgrammaticScroll.current = true;
      scrollRef.current.scrollTo({
        left: currentIndex * scrollRef.current.clientWidth,
        behavior: 'instant' as ScrollBehavior
      });
      setTimeout(() => { isProgrammaticScroll.current = false; }, 50);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Animate scroll when index changes via desktop arrows
  useEffect(() => {
    if (scrollRef.current && open && !isProgrammaticScroll.current) {
      isProgrammaticScroll.current = true;
      scrollRef.current.scrollTo({
        left: currentIndex * scrollRef.current.clientWidth,
        behavior: 'smooth'
      });
      setTimeout(() => { isProgrammaticScroll.current = false; }, 400);
    }
  }, [currentIndex, open]);

  // Update currentIndex when user manually swipes
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || isProgrammaticScroll.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    const newIndex = Math.round(scrollLeft / clientWidth);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < attachments.length) {
      onIndexChange(newIndex);
    }
  }, [currentIndex, attachments.length, onIndexChange]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, handlePrevious, handleNext]);

  if (!attachments || attachments.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[100dvh] w-[100vw] max-w-[100vw] flex-col items-center justify-center rounded-none border-none bg-surface-1 p-0 shadow-none sm:rounded-none [&>button.absolute]:hidden">
        <DialogTitle className="sr-only">Attachment Viewer</DialogTitle>
        <DialogDescription className="sr-only">
          Viewing attachment {currentIndex + 1} of {attachments.length}
        </DialogDescription>

        {/* Desktop Viewport Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="fixed right-3 top-3 z-50 hidden rounded-full bg-[#383838] p-2 text-white sm:block"
        >
          <X className="size-3" strokeWidth={4} />
          <span className="sr-only">Close</span>
        </button>

        {/* Desktop Left/Right Click Areas (Overlayed over the scroll container) */}
        {attachments.length > 1 && (
          <>
            <div
              className="absolute left-0 top-0 z-10 hidden h-full w-[15%] cursor-w-resize sm:block"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
            />
            <div
              className="absolute right-0 top-0 z-10 hidden h-full w-[15%] cursor-e-resize sm:block"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            />
          </>
        )}

        {/* Main Media Scroll Container */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="scrollbar-hide relative flex h-full w-full snap-x snap-mandatory items-center overflow-x-auto overflow-y-hidden scroll-smooth"
          onClick={() => onOpenChange(false)} // Clicking outside media closes dialog
        >
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex h-full w-full shrink-0 snap-center items-center justify-center px-0 sm:px-4 md:px-16"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the media itself
            >
              <div className="relative flex max-h-[85vh] w-full items-center justify-center">
                {attachment.type === 'video' ? (
                  <video
                    src={attachment.url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="relative z-0 max-h-full max-w-full rounded-lg object-contain sm:shadow-2xl"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={attachment.url}
                    alt={attachment.filename || 'Attachment preview'}
                    className="relative z-0 max-h-[85vh] max-w-full rounded-lg object-contain sm:shadow-2xl"
                    loading="lazy"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile controls (Bottom) */}
        <div className="fixed bottom-6 left-4 right-4 z-50 flex items-center justify-between sm:hidden pointer-events-none">
          <button
            onClick={() => onOpenChange(false)}
            className="pointer-events-auto rounded-full bg-black/10 dark:bg-white/10 backdrop-blur-md px-5 py-2 text-sm font-medium text-content-primary"
          >
            Close
          </button>
          
          {attachments.length > 1 && (
            <div className="pointer-events-auto rounded-full bg-black/10 dark:bg-white/10 backdrop-blur-md px-5 py-2 text-sm font-medium text-content-primary tracking-widest">
              {currentIndex + 1} / {attachments.length}
            </div>
          )}
        </div>

        {/* Desktop Bottom Pagination Dots */}
        {attachments.length > 1 && (
          <div className="fixed bottom-3 left-1/2 z-50 hidden -translate-x-1/2 items-center gap-1.5 px-4 py-2 sm:flex">
            {attachments.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  'size-2 rounded-full transition-all duration-200 cursor-pointer',
                  idx === currentIndex ? 'bg-[#6e6e6e]' : 'bg-surface-3',
                )}
                onClick={() => onIndexChange(idx)}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
