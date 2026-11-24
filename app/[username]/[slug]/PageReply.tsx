'use client';


import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { repliesApi } from '@/app/[username]/_components/resume/editing/replies/api';
import { MessageConfirmation } from '@/app/[username]/_components/resume/preview/replies/MessageConfirmation';
import { ReplyComposer } from '@/app/[username]/_components/resume/preview/replies/ReplyComposer';
import { CONFIRMATION_MS } from '@/app/[username]/_components/resume/preview/replies/spring';

export interface PageReplyTarget {
  username: string;
  name: string;
  pageId: string;
}

export function PageReply({ username, name, pageId }: PageReplyTarget) {
  const { status } = useSession();
  const [signInOpen, setSignInOpen] = useState(false);
  const [sent, setSent] = useState<{ emoji?: string } | null>(null);

  useEffect(() => {
    if (!sent) return;
    const timer = setTimeout(() => setSent(null), CONFIRMATION_MS);
    return () => clearTimeout(timer);
  }, [sent]);

  return (
    <div className="relative mb-12 print:hidden">
      <p className="mb-2 text-[length:var(--secondary-type-size)] leading-[var(--line-height)] text-theme-muted">
        Send {name} a reply about this page
      </p>
      <div className="relative">
        <ReplyComposer
          label={`Reply to ${name}’s page`}
          onPage
          signedIn={status === 'authenticated'}
          onRequireSignIn={() => setSignInOpen(true)}
          onSend={async (body, reaction) => {
            try {
              await repliesApi.start({
                username,
                body,
                target: { kind: 'page', pageId },
              });
              setSent({ emoji: reaction });
            } catch (error) {
              toast.error((error as Error).message);
              throw error;
            }
          }}
        />
        <AnimatePresence>
          {sent && <MessageConfirmation key="sent" emoji={sent.emoji} />}
        </AnimatePresence>
      </div>
      {signInOpen && (
        <AuthDialog open onOpenChange={setSignInOpen} mode="login" />
      )}
    </div>
  );
}
