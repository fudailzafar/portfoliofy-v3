'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { repliesApi } from '../../editing/replies/api';
import { useReplyProfile } from './ReplyProvider';

const ReplyPanel = dynamic(() => import('./ReplyPanel'), {
  ssr: false,
  // Holds the row's height while it loads, so the bubble doesn't jump.
  loading: () => <div className="h-10" aria-hidden />,
});

/**
 * The reply bar inside the status bubble, always visible, as on read.cv: a
 * "Reply directly…" field and four quick emoji under the status. Visitors who
 * aren't signed in are asked to sign in when they touch it.
 */
export function StatusReply() {
  const profile = useReplyProfile();
  const { status } = useSession();
  const [signInOpen, setSignInOpen] = useState(false);

  const send = useMutation({
    mutationFn: (body: string) =>
      repliesApi.start({
        username: profile!.username,
        body,
        target: { kind: 'status' },
      }),
    onSuccess: () => toast.success(`Reply sent to ${profile!.name}`),
    onError: (error) => toast.error(error.message),
  });

  if (!profile?.enabled) return null;

  const signedIn = status === 'authenticated';
  const askToSignIn = (event: { preventDefault: () => void }) => {
    if (signedIn) return;
    event.preventDefault();
    setSignInOpen(true);
  };

  return (
    <div
      className="mt-3 print:hidden"
      // Capture phase, so nothing inside the bar acts before sign-in.
      onPointerDownCapture={(event) => {
        if (!signedIn) event.stopPropagation();
        askToSignIn(event);
      }}
      onFocusCapture={(event) => {
        if (signedIn) return;
        (event.target as HTMLElement).blur();
        setSignInOpen(true);
      }}
    >
      <ReplyPanel
        variant="inline"
        label={`Reply to ${profile.name}’s status`}
        isSending={send.isPending}
        onSend={(body) => send.mutateAsync(body)}
      />
      {signInOpen && (
        <AuthDialog open onOpenChange={setSignInOpen} mode="login" />
      )}
    </div>
  );
}
