'use client';

// read.cv's reply container for profile items, rebuilt from its stylesheet
// and script. A 48px column to the right of the item holds the reply arrow,
// which fades in (0.4s) on hover. The arrow opens a 420px popover (16px
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
import { useReplyProfile } from './ReplyProvider';
import { CONFIRMATION_MS, READCV_SPRING } from './spring';

const POPOVER_WIDTH = 420;
const VIEWPORT_MARGIN = 8;
const POPOVER_GAP = 6;
const SWIPE_DISTANCE = 60;
const SWIPE_MAX_DRIFT = 40;

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
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!sent) return;
    const timer = setTimeout(() => setSent(null), CONFIRMATION_MS);
    return () => clearTimeout(timer);
  }, [sent]);

  // Centre the popover under the arrow, kept inside the window.
  const place = useCallback(() => {
    const wrap = wrapRef.current?.getBoundingClientRect();
    const arrow = arrowRef.current?.getBoundingClientRect();
    if (!wrap || !arrow) return;
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
    <div
      ref={wrapRef}
      className="group/reply relative"
      onTouchStart={(event) => {
        const touch = event.touches[0];
        touchStart.current = { x: touch.clientX, y: touch.clientY };
      }}
      onTouchEnd={(event) => {
        const start = touchStart.current;
        touchStart.current = null;
        if (!start || open) return;
        const touch = event.changedTouches[0];
        const dx = touch.clientX - start.x;
        const dy = Math.abs(touch.clientY - start.y);
        if (dx < -SWIPE_DISTANCE && dy < SWIPE_MAX_DRIFT) begin();
      }}
    >
      {children}

      {/* The 48px reply column, outside the item on wide screens. */}
      <div className="absolute right-0 top-0 flex w-12 justify-end min-[700px]:-right-12 min-[700px]:top-1/2 min-[700px]:-translate-y-1/2 print:hidden">
        <button
          ref={arrowRef}
          type="button"
          onClick={() => (open ? close() : begin())}
          aria-label={label}
          aria-expanded={open}
          className={cn(
            'flex h-8 items-center text-theme-muted outline-none [transition:opacity_.4s_ease] focus-visible:opacity-100 active:opacity-70',
            open || sent
              ? 'opacity-100'
              : 'opacity-0 group-focus-within/reply:opacity-100 group-hover/reply:opacity-100',
            // Touch screens use the swipe; the button stays for screen readers.
            '[@media(hover:none)]:sr-only',
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
              focusOnMount
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
    </div>
  );
}
