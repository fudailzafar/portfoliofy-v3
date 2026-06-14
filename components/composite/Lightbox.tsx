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
  const currentAttachment = attachments[currentIndex];

  const handlePrevious = useCallback(() => {
    onIndexChange((currentIndex - 1 + attachments.length) % attachments.length);
  }, [currentIndex, attachments.length, onIndexChange]);

  const handleNext = useCallback(() => {
    onIndexChange((currentIndex + 1) % attachments.length);
  }, [currentIndex, attachments.length, onIndexChange]);

  // Touch handlers for swiping
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }
  };

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

  if (!currentAttachment) return null;

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

        {/* Main Media Container */}
        <div
          className="relative flex h-full max-h-[85vh] w-full max-w-7xl items-center justify-center px-0 sm:px-4 md:px-16"
          onClick={() => onOpenChange(false)} // Clicking outside media closes dialog
        >
          <div
            className="relative flex h-full w-full items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the media itself
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEndHandler}
          >
            {/* Desktop Left/Right Click Areas */}
            {attachments.length > 1 && (
              <>
                <div
                  className="absolute left-0 top-0 z-10 hidden h-full w-1/2 cursor-w-resize sm:block"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                />
                <div
                  className="absolute right-0 top-0 z-10 hidden h-full w-1/2 cursor-e-resize sm:block"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                />
              </>
            )}

            {currentAttachment.type === 'video' ? (
              <video
                src={currentAttachment.url}
                autoPlay
                loop
                muted
                playsInline
                className="relative z-0 max-h-full max-w-full rounded-lg object-contain sm:shadow-2xl"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentAttachment.url}
                alt={currentAttachment.filename || 'Attachment preview'}
                className="relative z-0 max-h-full max-w-full rounded-lg object-contain sm:shadow-2xl"
                loading="eager"
              />
            )}
          </div>
        </div>

        {/* Mobile controls (Bottom) */}
        <div className="fixed bottom-6 left-4 right-4 z-50 flex items-center justify-between sm:hidden">
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-full bg-black/10 dark:bg-white/10 backdrop-blur-md px-5 py-2 text-sm font-medium text-content-primary"
          >
            Close
          </button>
          
          {attachments.length > 1 && (
            <div className="rounded-full bg-black/10 dark:bg-white/10 backdrop-blur-md px-5 py-2 text-sm font-medium text-content-primary tracking-widest">
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
                  'size-2 rounded-full transition-all duration-200',
                  idx === currentIndex ? 'bg-[#6e6e6e]' : 'bg-surface-3',
                )}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
