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
import { motion, AnimatePresence } from 'framer-motion';

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
  const [direction, setDirection] = React.useState(0);

  const handlePrevious = useCallback(() => {
    setDirection(-1);
    onIndexChange((currentIndex - 1 + attachments.length) % attachments.length);
  }, [currentIndex, attachments.length, onIndexChange]);

  const handleNext = useCallback(() => {
    setDirection(1);
    onIndexChange((currentIndex + 1) % attachments.length);
  }, [currentIndex, attachments.length, onIndexChange]);

  const handleDotClick = useCallback((idx: number) => {
    setDirection(idx > currentIndex ? 1 : -1);
    onIndexChange(idx);
  }, [currentIndex, onIndexChange]);

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

  if (!currentAttachment || !attachments || attachments.length === 0) return null;

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

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

        {/* Desktop Left/Right Click Areas */}
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

        {/* Main Media Container */}
        <div
          className="relative flex h-full max-h-[85vh] w-full max-w-7xl items-center justify-center overflow-hidden px-0 sm:px-4 md:px-16"
          onClick={() => onOpenChange(false)} // Clicking outside media closes dialog
        >
          <div
            className="relative flex h-full w-full items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the media itself
          >
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                drag={attachments.length > 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);
                  if (swipe < -swipeConfidenceThreshold) {
                    handleNext();
                  } else if (swipe > swipeConfidenceThreshold) {
                    handlePrevious();
                  }
                }}
                className="absolute flex h-full w-full items-center justify-center"
              >
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
                    className="relative z-0 max-h-[85vh] max-w-full rounded-lg object-contain sm:shadow-2xl"
                    loading="eager"
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile controls (Bottom) */}
        <div className="fixed bottom-6 left-4 right-4 z-50 flex items-center justify-between sm:hidden pointer-events-none">
          <button
            onClick={() => onOpenChange(false)}
            className="pointer-events-auto rounded-full bg-black/10 px-5 py-2 text-sm font-medium text-content-primary backdrop-blur-md dark:bg-white/10"
          >
            Close
          </button>

          {attachments.length > 1 && (
            <div className="pointer-events-auto rounded-full bg-black/10 px-5 py-2 text-sm font-medium tracking-widest text-content-primary backdrop-blur-md dark:bg-white/10">
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
                  'size-2 cursor-pointer rounded-full transition-all duration-200',
                  idx === currentIndex ? 'bg-[#6e6e6e]' : 'bg-surface-3',
                )}
                onClick={() => handleDotClick(idx)}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
