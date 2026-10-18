'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { AttachmentSchemaType } from '@/lib/resume';
import { cn, getOptimizedImageUrl } from '@/lib/utils';

// A full-screen layer in the page colour fades in, and the media and controls
// fade in 600ms later. Closing reverses it.
const FADE = { duration: 0.3 } as const;
const CONTENT_DELAY_MS = 600;
// Gap between slides when swiping on touch screens.
const SWIPE_GAP_PX = 16;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function useIsTouch() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(hover: none) and (pointer: coarse)');
    const update = () => setIsTouch(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return isTouch;
}

const PILL_CLASS =
  'pointer-events-auto mx-1.5 flex h-9 items-center rounded-3xl bg-[var(--theme-glass)] px-[18px] text-[14px] font-medium text-theme-primary shadow-[0_0_0_1px_var(--theme-faint-border)] backdrop-blur-[5px]';

interface LightboxProps {
  attachments: AttachmentSchemaType[];
  currentIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIndexChange: (index: number) => void;
  // The profile's theme classes: the lightbox renders in a portal, outside
  // the element that sets the theme's colours.
  themeClassName?: string;
}

export function Lightbox({
  attachments,
  currentIndex,
  open,
  onOpenChange,
  onIndexChange,
  themeClassName = 'theme-default',
}: LightboxProps) {
  const isTouch = useIsTouch();
  const [showContent, setShowContent] = useState(false);
  const closeTimer = useRef<number>(0);
  const count = attachments.length;

  useEffect(() => {
    if (!open) return;
    window.clearTimeout(closeTimer.current);
    const delay = prefersReducedMotion() ? 0 : CONTENT_DELAY_MS;
    const timer = window.setTimeout(() => setShowContent(true), delay);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const requestClose = useCallback(() => {
    setShowContent(false);
    window.clearTimeout(closeTimer.current);
    const delay = prefersReducedMotion() ? 0 : CONTENT_DELAY_MS;
    closeTimer.current = window.setTimeout(() => onOpenChange(false), delay);
  }, [onOpenChange]);

  const next = useCallback(
    () => onIndexChange((currentIndex + 1) % count),
    [currentIndex, count, onIndexChange],
  );
  const previous = useCallback(
    () => onIndexChange((currentIndex - 1 + count) % count),
    [currentIndex, count, onIndexChange],
  );

  useEffect(() => {
    if (!open || count < 2) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') previous();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, count, next, previous]);

  // Preload the neighbours so moving to them is instant.
  useEffect(() => {
    if (!open || count < 2) return;
    [currentIndex - 1, currentIndex + 1].forEach((i) => {
      const neighbour = attachments[(i + count) % count];
      if (neighbour?.type === 'image' && neighbour.url) {
        new Image().src = getOptimizedImageUrl(neighbour.url) || neighbour.url;
      }
    });
  }, [open, currentIndex, attachments, count]);

  if (count === 0) return null;

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) requestClose();
      }}
    >
      <MotionConfig reducedMotion="user">
        <AnimatePresence onExitComplete={() => setShowContent(false)}>
          {open && (
            <DialogPrimitive.Portal forceMount>
              <DialogPrimitive.Content asChild forceMount>
                <motion.div
                  className={cn(
                    'fixed inset-0 z-50 bg-theme-bg outline-none print:hidden',
                    themeClassName,
                  )}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={FADE}
                >
                  <DialogPrimitive.Title className="sr-only">
                    Media viewer
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Description className="sr-only">
                    Item {currentIndex + 1} of {count}
                    {count > 1
                      ? '. Use the arrow keys to move between items.'
                      : ''}
                  </DialogPrimitive.Description>

                  <AnimatePresence>
                    {showContent && (
                      <motion.div
                        className="absolute inset-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={FADE}
                      >
                        {isTouch ? (
                          <SwipeView
                            attachments={attachments}
                            currentIndex={currentIndex}
                            onIndexChange={onIndexChange}
                          />
                        ) : (
                          <DesktopView
                            attachment={attachments[currentIndex]}
                            index={currentIndex}
                            count={count}
                            onNext={next}
                            onPrevious={previous}
                            onClose={requestClose}
                          />
                        )}

                        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[200] flex h-[108px] items-center px-[18px]">
                          <button
                            type="button"
                            onClick={requestClose}
                            className={cn(
                              PILL_CLASS,
                              'outline-none focus-visible:ring-2 focus-visible:ring-theme-primary active:brightness-95',
                            )}
                          >
                            Close
                          </button>
                          {count > 1 && (
                            <div
                              aria-hidden="true"
                              className={cn(PILL_CLASS, 'ml-auto tabular-nums')}
                            >
                              {currentIndex + 1} / {count}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          )}
        </AnimatePresence>
      </MotionConfig>
    </DialogPrimitive.Root>
  );
}

// Sized to fit the screen at the media's own proportions.
function fitStyle(attachment: AttachmentSchemaType): React.CSSProperties {
  const ratio =
    attachment.width && attachment.height
      ? attachment.width / attachment.height
      : null;
  if (!ratio) return { maxWidth: '100vw', maxHeight: '100dvh' };
  return {
    width: `min(100vw, calc(100dvh * ${ratio}))`,
    aspectRatio: String(ratio),
  };
}

function Media({
  attachment,
  label,
}: {
  attachment: AttachmentSchemaType;
  label: string;
}) {
  const src = getOptimizedImageUrl(attachment.url) || attachment.url;
  return attachment.type === 'video' ? (
    <video
      src={src}
      aria-label={label}
      autoPlay
      loop
      muted
      playsInline
      className="block h-full w-full object-contain"
    />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={label}
      draggable={false}
      className="block h-full w-full object-contain"
    />
  );
}

function DesktopView({
  attachment,
  index,
  count,
  onNext,
  onPrevious,
  onClose,
}: {
  attachment: AttachmentSchemaType;
  index: number;
  count: number;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
}) {
  const kind = attachment.type === 'video' ? 'Video' : 'Image';
  return (
    // Clicking the empty space around the media closes.
    <div
      className="absolute inset-0 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative" style={fitStyle(attachment)}>
        <Media
          attachment={attachment}
          label={`${kind} ${index + 1} of ${count}`}
        />
        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous"
              onClick={onPrevious}
              className="lightbox-cursor-previous absolute inset-y-0 left-0 w-1/2 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-theme-primary"
            />
            <button
              type="button"
              aria-label="Next"
              onClick={onNext}
              className="lightbox-cursor-next absolute inset-y-0 right-0 w-1/2 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-theme-primary"
            />
          </>
        )}
      </div>
    </div>
  );
}

// Touch screens: native swiping between full-screen slides that snap.
function SwipeView({
  attachments,
  currentIndex,
  onIndexChange,
}: {
  attachments: AttachmentSchemaType[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const count = attachments.length;

  // Start on the item that was tapped.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollLeft = currentIndex * (scroller.clientWidth + SWIPE_GAP_PX);
    // Only on mount; afterwards scrolling drives the index.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={scrollerRef}
      onScroll={(e) => {
        const el = e.currentTarget;
        const index = Math.round(
          el.scrollLeft / (el.clientWidth + SWIPE_GAP_PX),
        );
        if (index !== currentIndex && index >= 0 && index < count) {
          onIndexChange(index);
        }
      }}
      className="absolute inset-0 flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {attachments.map((attachment, i) => (
        <div
          key={attachment.id}
          className="flex h-full w-screen shrink-0 snap-start items-center justify-center"
          style={{ marginRight: i < count - 1 ? SWIPE_GAP_PX : 0 }}
        >
          {/* Only the visible item and its neighbours load. */}
          {Math.abs(i - currentIndex) <= 1 && (
            <div style={fitStyle(attachment)}>
              <Media
                attachment={attachment}
                label={`${attachment.type === 'video' ? 'Video' : 'Image'} ${i + 1} of ${count}`}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
