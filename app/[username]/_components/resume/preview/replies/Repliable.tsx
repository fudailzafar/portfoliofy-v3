'use client';

// read.cv's reply container for profile items, rebuilt from its stylesheet
// and script. A 48px column to the right of the item holds the reply arrow,
// which fades in (0.4s) on hover. On a phone the item itself is dragged: it
// follows your finger left (elastically, half as far), the arrow slides in
// from the right and darkens past 100px, and letting go there opens the bar.
// The arrow opens a 420px popover (16px
// corners) centred under it, holding the composer with 12px padding. Sending
// sends the popover up and away, and a "Sent" pill shows for a second.

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useSession } from 'next-auth/react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { REPLY_SECTION_NOUN, type ReplyTarget } from '@/lib/replies';
import { cn } from '@/lib/utils';
import { repliesApi } from '../../editing/replies/api';
import { ReplyArrowIcon } from './icons';
import { MessageConfirmation } from './MessageConfirmation';
import { ReplyComposer } from './ReplyComposer';
import { useIsTouchDevice } from './useIsTouchDevice';
import { useReplyProfile } from './ReplyProvider';
import { CONFIRMATION_MS, READCV_SPRING } from './spring';

const POPOVER_WIDTH = 420;
const VIEWPORT_MARGIN = 8;
const POPOVER_GAP = 6;
// read.cv opens the bar when the item is let go past this far left.
const DRAG_OPEN_DISTANCE = 100;

export function Repliable({
  target,
  children,
}: {
  target: ReplyTarget;
  children: ReactNode;
}) {
  const profile = useReplyProfile();
  const { status } = useSession();
  const signedIn = status === 'authenticated';
  const [open, setOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [sent, setSent] = useState<{ emoji?: string } | null>(null);
  // Closing drops the popover 4px; sending sends it 100px up, as read.cv does.
  const [exit, setExit] = useState({ opacity: 0, y: 4 });
  const [position, setPosition] = useState({ left: 0, top: 0, width: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const isTouch = useIsTouchDevice();
  const [dragging, setDragging] = useState(false);
  const [dragPassed, setDragPassed] = useState(false);

  useEffect(() => {
    if (!sent) return;
    const timer = setTimeout(() => setSent(null), CONFIRMATION_MS);
    return () => clearTimeout(timer);
  }, [sent]);

  // Centre the popover under the arrow, kept inside the window.
  const place = useCallback(() => {
    const wrapEl = wrapRef.current;
    const wrap = wrapEl?.getBoundingClientRect();
    const arrow = arrowRef.current?.getBoundingClientRect();
    if (!wrapEl || !wrap || !arrow) return;
    // While an item springs back after a drag it is still shifted sideways;
    // measure where it will rest, so the bar doesn't end up offset.
    const shift = new DOMMatrixReadOnly(getComputedStyle(wrapEl).transform).m41;
    wrap.x -= shift;
    arrow.x -= shift;
    const width = Math.min(
      POPOVER_WIDTH,
      window.innerWidth - VIEWPORT_MARGIN * 2,
    );
    const centred = arrow.left + arrow.width / 2 - width / 2;
    const left = Math.min(
      Math.max(centred, VIEWPORT_MARGIN),
      window.innerWidth - VIEWPORT_MARGIN - width,
    );
    setPosition({
      left: left - wrap.left,
      top: arrow.bottom - wrap.top + POPOVER_GAP,
      width,
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [open, place]);

  const close = useCallback((returnFocus = true) => {
    setExit({ opacity: 0, y: 4 });
    setOpen(false);
    if (returnFocus) arrowRef.current?.focus({ preventScroll: true });
  }, []);

  // Close on a click elsewhere or Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent | TouchEvent) => {
      const node = event.target as Node;
      if (popoverRef.current?.contains(node)) return;
      if (arrowRef.current?.contains(node)) return;
      // The emoji picker and sign-in dialog sit inside the popover or above it.
      if ((node as Element).closest?.('[role="dialog"]')) return;
      close(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  if (!profile?.enabled) return <>{children}</>;

  const noun =
    target.kind === 'status' ? 'status' : REPLY_SECTION_NOUN[target.section];
  const label = `Reply to ${profile.name}’s ${noun}`;

  const begin = () => {
    if (signedIn) {
      setExit({ opacity: 0, y: 4 });
      setOpen(true);
    } else {
      setSignInOpen(true);
    }
  };

  return (
    <motion.div
      ref={wrapRef}
      className="group/reply relative"
      // read.cv's drag: left only, snapping back, with a rubber band of 0.5.
      drag={isTouch && !open ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0.5, right: 0, top: 0, bottom: 0 }}
      dragMomentum={false}
      onDragStart={() => setDragging(true)}
      onDrag={(_, info) => setDragPassed(info.offset.x < -DRAG_OPEN_DISTANCE)}
      onDragEnd={(_, info) => {
        const opens = info.offset.x < -DRAG_OPEN_DISTANCE;
        setDragging(false);
        setDragPassed(false);
        if (opens) setTimeout(begin, 1);
      }}
    >
      {children}

      {/* The 48px reply column, outside the item on wide screens. */}
      <div
        className={cn(
          'absolute flex w-12 justify-end print:hidden',
          // On a phone the column sits off the right edge and slides in as
          // the item is dragged.
          isTouch
            ? '-right-12 top-1/2 -translate-y-1/2'
            : 'right-0 top-0 min-[700px]:-right-12 min-[700px]:top-1/2 min-[700px]:-translate-y-1/2',
        )}
      >
        <button
          ref={arrowRef}
          type="button"
          onClick={() => (open ? close() : begin())}
          aria-label={label}
          aria-expanded={open}
          className={cn(
            'flex h-8 items-center outline-none [transition:opacity_.4s_ease] focus-visible:opacity-100 active:opacity-70',
            // The arrow darkens once the drag is far enough to open the bar.
            dragPassed ? 'text-theme-primary' : 'text-theme-muted',
            open || sent || dragging
              ? 'opacity-100'
              : isTouch
                ? 'opacity-0'
                : 'opacity-0 group-focus-within/reply:opacity-100 group-hover/reply:opacity-100',
            // Touch screens use the drag; the button stays for screen readers.
            isTouch && !dragging && !open && !sent && 'sr-only',
          )}
        >
          <ReplyArrowIcon />
        </button>
        <AnimatePresence>
          {sent && <MessageConfirmation key="sent" emoji={sent.emoji} />}
        </AnimatePresence>
      </div>

      {/* custom hands the latest exit to the popover even as it unmounts. */}
      <AnimatePresence custom={exit}>
        {open && (
          <motion.div
            ref={popoverRef}
            key="popover"
            custom={exit}
            variants={{ leave: (to: typeof exit) => to }}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit="leave"
            transition={READCV_SPRING}
            className="absolute z-30 rounded-2xl bg-theme-bg shadow-[0_0_0_1px_rgba(0,0,0,.1),0_4px_40px_rgba(0,0,0,.075)] dark:bg-theme-border dark:shadow-[0_0_0_1px_rgba(0,0,0,.15),0_4px_40px_rgba(0,0,0,.5)] print:hidden"
            style={{
              left: position.left,
              top: position.top,
              width: position.width || POPOVER_WIDTH,
            }}
          >
            <ReplyComposer
              label={label}
              padded
              clearOnSend={false}
              // read.cv doesn't pop the keyboard up on phones.
              focusOnMount={!isTouch}
              signedIn={signedIn}
              onRequireSignIn={() => {
                close(false);
                setSignInOpen(true);
              }}
              onSend={async (body, reaction) => {
                try {
                  await repliesApi.start({
                    username: profile.username,
                    body,
                    target,
                  });
                  setExit({ opacity: 0, y: -100 });
                  setOpen(false);
                  setSent({ emoji: reaction });
                } catch (error) {
                  toast.error((error as Error).message);
                  throw error;
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {signInOpen && (
        <AuthDialog open onOpenChange={setSignInOpen} mode="login" />
      )}
    </motion.div>
  );
}
