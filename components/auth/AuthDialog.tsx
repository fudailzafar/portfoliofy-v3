'use client';

import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'login' | 'signup';
}

export function AuthDialog({ open, onOpenChange, mode }: AuthDialogProps) {
  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/auth/post-login' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-8 font-sans sm:max-w-sm">
        <DialogTitle className="sr-only">
          {mode === 'login'
            ? 'Login to your account﻿ 👋'
            : 'Create a new profile ✨'}
        </DialogTitle>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6"
            >
              {/* Header */}
              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg font-medium tracking-tight text-content-primary">
                  {mode === 'login'
                    ? 'Login to your account﻿ 👋'
                    : 'Create a new profile ✨'}
                </h2>
                <p className="text-[14px] leading-snug text-content-muted">
                  By continuing you agree to our terms of service and privacy
                  policy.
                </p>
              </div>

              {/* Google Sign-In Button */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleSignIn}
                className="flex h-11 w-full items-center justify-center gap-3 rounded-md border border-border-strong bg-surface-1 px-4 text-sm font-medium text-content-primary shadow-sm outline-none transition-colors hover:bg-surface-2"
              >
                {/* Google SVG Icon */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  xmlns="http://www.w3.org/2000/svg"
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
                Continue with Google
              </motion.button>

              {/* Terms */}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
