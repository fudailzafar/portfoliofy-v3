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
      <DialogContent 
        className="max-w-[100vw] w-[100vw] h-[100dvh] bg-surface-1 border-none shadow-none p-0 rounded-none sm:rounded-none flex flex-col items-center justify-center [&>button.absolute]:hidden"
      >
        <DialogTitle className="sr-only">Attachment Viewer</DialogTitle>
        <DialogDescription className="sr-only">
          Viewing attachment {currentIndex + 1} of {attachments.length}
        </DialogDescription>

        {/* Viewport Close Button */}
        <button
          onClick={() => onOpenChange(false)}
          className="fixed top-3 right-3 z-50 p-2 rounded-full bg-[#383838] text-white"
        >
          <X className="size-3" strokeWidth={4} />
          <span className="sr-only">Close</span>
        </button>

        {/* Main Media Container */}
        <div 
          className="relative w-full max-w-7xl h-full max-h-[85vh] flex items-center justify-center px-4 md:px-16"
          onClick={() => onOpenChange(false)} // Clicking outside media closes dialog
        >
          <div 
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the media itself
          >
            {/* Left/Right Click Areas */}
            {attachments.length > 1 && (
              <>
                <div 
                  className="absolute left-0 top-0 w-1/2 h-full z-10 cursor-w-resize" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                />
                <div 
                  className="absolute right-0 top-0 w-1/2 h-full z-10 cursor-e-resize" 
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
                className="max-w-full max-h-full rounded-lg object-contain shadow-2xl relative z-0"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentAttachment.url}
                alt={currentAttachment.filename || 'Attachment preview'}
                className="max-w-full max-h-full rounded-lg object-contain shadow-2xl relative z-0"
                loading="eager"
              />
            )}
          </div>
        </div>



        {/* Bottom Pagination Dots */}
        {attachments.length > 1 && (
          <div className="fixed bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-50 px-4 py-2">
            {attachments.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "size-2 rounded-full transition-all duration-200",
                  idx === currentIndex 
                    ? "bg-[#6e6e6e]" 
                    : "bg-surface-3"
                )}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
