'use client';

import { useRef } from 'react';
import { signIn } from 'next-auth/react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'login' | 'signup';
}

const SPRING = { type: 'spring', stiffness: 700, damping: 50 } as const;

export function AuthDialog({ open, onOpenChange, mode }: AuthDialogProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const title =
    mode === 'login' ? 'Login to your account' : 'Create a new profile';

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/auth/post-login' });
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <MotionConfig reducedMotion="user">
        <AnimatePresence>
          {open && (
            <DialogPrimitive.Portal forceMount>
              <DialogPrimitive.Overlay asChild forceMount>
                <motion.div
                  className="fixed inset-0 z-50 bg-black/30 dark:bg-black/50 print:hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={SPRING}
                />
              </DialogPrimitive.Overlay>

              <DialogPrimitive.Content
                asChild
                forceMount
                aria-describedby={undefined}
                // Focus the card, not the button, so no focus ring shows on open.
                onOpenAutoFocus={(e) => {
                  e.preventDefault();
                  cardRef.current?.focus();
                }}
              >
                {/* CSS centres the card; motion only animates the 20px rise. */}
                <div
                  ref={cardRef}
                  className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-24px)] max-w-[375px] -translate-x-1/2 -translate-y-1/2 font-sans text-[14px] leading-[1.6] text-[#111] outline-none dark:text-[#eee] print:hidden"
                >
                  <motion.div
                    className="rounded-2xl bg-[#fff] p-6 dark:bg-[#222]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={SPRING}
                  >
                    <DialogPrimitive.Title className="mb-1 text-[18px] font-medium leading-[1.6] text-[#111] dark:text-[#eee]">
                      {title}
                      <span aria-hidden="true" className="whitespace-nowrap">
                        {' '}
                        {mode === 'login' ? '👋' : '✨'}
                      </span>
                    </DialogPrimitive.Title>
                    <p className="text-[#666] dark:text-[#aaa]">
                      By continuing you agree to our terms of service and
                      privacy policy.
                    </p>

                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="mt-4 flex h-9 w-full items-center justify-center rounded-lg border border-[#e5e5e5] bg-[#fff] px-3 font-medium text-[#666] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#111]/20 active:bg-[#f2f2f2] dark:border-none dark:bg-[#333] dark:text-[#aaa] dark:focus-visible:ring-[#eee]/20 dark:active:bg-[#444]"
                    >
                      <GoogleIcon />
                      Continue with Google
                    </button>
                  </motion.div>
                </div>
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          )}
        </AnimatePresence>
      </MotionConfig>
    </DialogPrimitive.Root>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 18 18"
      aria-hidden="true"
      className="mr-2 shrink-0"
    >
      <path
        d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
