'use client';

import { useCallback, useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { useMutation } from '@tanstack/react-query';
import { ArrowBendUpLeftIcon } from '@phosphor-icons/react/ssr';
import { toast } from 'sonner';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { REPLY_SECTION_NOUN, type ReplyTarget } from '@/lib/replies';
import { cn } from '@/lib/utils';
import { repliesApi } from '../../editing/replies/api';
import { useReplyProfile } from './ReplyProvider';

// Loaded on first use, so the emoji picker costs nothing on page load.
const ReplyPanel = dynamic(() => import('./ReplyPanel'), { ssr: false });

const SWIPE_DISTANCE = 60;
const SWIPE_MAX_DRIFT = 40;

/**
 * Wraps one repliable thing on a profile (an item or the status). On desktop a
 * reply arrow appears on hover or keyboard focus; on a phone, swiping left
 * opens the same "Reply directly…" bar. Outside a profile where replies are
 * allowed it renders its children untouched.
 */
export function Repliable({
  target,
  children,
}: {
  target: ReplyTarget;
  children: ReactNode;
}) {
  const profile = useReplyProfile();
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const arrowRef = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const send = useMutation({
    mutationFn: (body: string) =>
      repliesApi.start({ username: profile!.username, body, target }),
    onSuccess: () => {
      toast.success(`Reply sent to ${profile!.name}`);
      setOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const close = useCallback(() => {
    setOpen(false);
    arrowRef.current?.focus({ preventScroll: true });
  }, []);

  if (!profile?.enabled) return <>{children}</>;

  const noun =
    target.kind === 'status' ? 'status' : REPLY_SECTION_NOUN[target.section];
  const label = `Reply to ${profile.name}’s ${noun}`;

  // Replies need an account; everyone else is asked to sign in first.
  const begin = () => {
    if (status === 'authenticated') setOpen(true);
    else setSignInOpen(true);
  };

  return (
    <div
      className="group/reply relative"
      onTouchStart={(event) => {
        const touch = event.touches[0];
        touchStart.current = { x: touch.clientX, y: touch.clientY };
      }}
      onTouchEnd={(event) => {
        const start = touchStart.current;
        touchStart.current = null;
        if (!start) return;
        const touch = event.changedTouches[0];
        const dx = touch.clientX - start.x;
        const dy = Math.abs(touch.clientY - start.y);
        if (dx < -SWIPE_DISTANCE && dy < SWIPE_MAX_DRIFT) begin();
      }}
    >
      {children}

      <button
        ref={arrowRef}
        type="button"
        data-reply-arrow
        onClick={() => (open ? close() : begin())}
        aria-label={label}
        aria-expanded={open}
        className={cn(
          'absolute right-0 top-0 flex size-8 items-center justify-center rounded-full text-theme-muted transition-opacity hover:text-theme-primary focus-visible:opacity-100 min-[700px]:-right-12 min-[700px]:top-1/2 min-[700px]:-translate-y-1/2 print:hidden',
          open
            ? 'opacity-100'
            : 'opacity-0 group-focus-within/reply:opacity-100 group-hover/reply:opacity-100',
          // Touch screens use the swipe; the button stays for screen readers.
          '[@media(hover:none)]:sr-only',
        )}
      >
        <ArrowBendUpLeftIcon className="size-5" weight="fill" />
      </button>

      {open && (
        <ReplyPanel
          label={label}
          isSending={send.isPending}
          onSend={(body) => send.mutate(body)}
          onClose={close}
          className="absolute right-0 top-9 w-[min(22rem,calc(100vw-3rem))] min-[700px]:-right-12 min-[700px]:top-1/2 min-[700px]:mt-3"
        />
      )}

      {signInOpen && (
        <AuthDialog open onOpenChange={setSignInOpen} mode="login" />
      )}
    </div>
  );
}
