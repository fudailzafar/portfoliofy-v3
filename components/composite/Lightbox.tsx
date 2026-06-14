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

        {/* Viewport Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="fixed right-3 top-3 z-50 rounded-full bg-[#383838] p-2 text-white"
        >
          <X className="size-3" strokeWidth={4} />
          <span className="sr-only">Close</span>
        </button>

        {/* Main Media Container */}
        <div
          className="relative flex h-full max-h-[85vh] w-full max-w-7xl items-center justify-center px-4 md:px-16"
          onClick={() => onOpenChange(false)} // Clicking outside media closes dialog
        >
          <div
            className="relative flex h-full w-full items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the media itself
          >
            {/* Left/Right Click Areas */}
            {attachments.length > 1 && (
              <>
                <div
                  className="absolute left-0 top-0 z-10 h-full w-1/2 cursor-w-resize"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                />
                <div
                  className="absolute right-0 top-0 z-10 h-full w-1/2 cursor-e-resize"
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
                className="relative z-0 max-h-full max-w-full rounded-lg object-contain shadow-2xl"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentAttachment.url}
                alt={currentAttachment.filename || 'Attachment preview'}
                className="relative z-0 max-h-full max-w-full rounded-lg object-contain shadow-2xl"
                loading="eager"
              />
            )}
          </div>
        </div>

        {/* Bottom Pagination Dots */}
        {attachments.length > 1 && (
          <div className="fixed bottom-3 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1.5 px-4 py-2">
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
