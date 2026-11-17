'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { repliesApi } from '../../editing/replies/api';
import { MessageConfirmation } from './MessageConfirmation';
import { ReplyComposer } from './ReplyComposer';
import { useReplyProfile } from './ReplyProvider';
import { CONFIRMATION_MS } from './spring';

/**
 * The reply bar under the status, as on read.cv: a 12px space after the time,
 * then the composer with no padding of its own. After sending, a "Sent" pill
 * appears under the bubble for a second. Must sit directly inside the bubble,
 * which is the pill's positioning parent.
 */
export function StatusReply() {
  const profile = useReplyProfile();
  const { status } = useSession();
  const [signInOpen, setSignInOpen] = useState(false);
  const [sent, setSent] = useState<{ emoji?: string } | null>(null);

  useEffect(() => {
    if (!sent) return;
    const timer = setTimeout(() => setSent(null), CONFIRMATION_MS);
    return () => clearTimeout(timer);
  }, [sent]);

  if (!profile?.enabled) return null;

  return (
    <>
      <div className="h-3" aria-hidden />
      <div className="print:hidden">
        <ReplyComposer
          label={`Reply to ${profile.name}’s status`}
          signedIn={status === 'authenticated'}
          onRequireSignIn={() => setSignInOpen(true)}
          onSend={async (body, reaction) => {
            try {
              await repliesApi.start({
                username: profile.username,
                body,
                target: { kind: 'status' },
              });
              setSent({ emoji: reaction });
            } catch (error) {
              toast.error((error as Error).message);
              throw error;
            }
          }}
        />
      </div>
      <AnimatePresence>
        {sent && <MessageConfirmation key="sent" emoji={sent.emoji} />}
      </AnimatePresence>
      {signInOpen && (
        <AuthDialog open onOpenChange={setSignInOpen} mode="login" />
      )}
    </>
  );
}
