'use client';

import { useEffect, useRef, useState } from 'react';
import { signIn } from 'next-auth/react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { Spinner } from '@/components/ui/spinner';
import { ValidCheck } from '@/components/ui/valid-check';
import { isValidEmail, normalizeEmail } from '@/lib/validation/email';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'login' | 'signup';
}

const SPRING = { type: 'spring', stiffness: 700, damping: 50 } as const;
// Read.cv's bouncier spring for small pop-ins like the checkmark.
const POP_SPRING = { type: 'spring', stiffness: 700, damping: 25 } as const;

// Off unless set, so the email option only appears where it is configured.
const EMAIL_AUTH_ENABLED = process.env.NEXT_PUBLIC_EMAIL_AUTH === 'true';

type Step = 0 | 1 | 2; // choose → email → check inbox

const TITLE_CLASS =
  'mb-1 text-[18px] font-medium leading-[1.6] text-[#111] dark:text-[#eee]';
const TEXT_BUTTON_CLASS =
  'text-[#111] outline-none hover:underline hover:underline-offset-4 focus-visible:underline dark:text-[#eee]';
// Read.cv's .button: white with a hairline border, #333 and borderless in dark.
const BUTTON_CLASS =
  'relative flex h-8 items-center justify-center rounded-lg border border-[#e5e5e5] bg-[#fff] px-3 font-medium text-[#111] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#111]/20 active:bg-[#f2f2f2] disabled:text-[#aaa] dark:border-none dark:bg-[#333] dark:text-[#eee] dark:focus-visible:ring-[#eee]/20 dark:active:bg-[#444] dark:disabled:text-[#777]';

export function AuthDialog({ open, onOpenChange, mode }: AuthDialogProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>(0);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [devLink, setDevLink] = useState('');

  const title =
    mode === 'login' ? 'Login to your account' : 'Create a new profile';
  const normalizedEmail = normalizeEmail(email);
  const emailIsValid = isValidEmail(normalizedEmail);

  // Start from the first step every time the dialog opens.
  useEffect(() => {
    if (open) return;
    setStep(0);
    setEmail('');
    setError('');
    setDevLink('');
    setSending(false);
  }, [open]);

  useEffect(() => {
    // preventScroll: the panel is still sliding in, and focusing it would make
    // the clipped wrapper scroll sideways to reveal it.
    if (open && step === 1) inputRef.current?.focus({ preventScroll: true });
  }, [open, step]);

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/auth/post-login' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailIsValid || sending) return;

    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/auth/email-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, mode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "We couldn't send the link. Try again.");
        return;
      }
      setDevLink(data.devLink ?? '');
      setStep(2);
    } catch {
      setError("We couldn't send the link. Try again.");
    } finally {
      setSending(false);
    }
  };

  // Each panel slides in from the side; inactive ones are inert. They share one
  // grid cell, so the card keeps the tallest step's height, like Read.cv.
  const panelProps = (index: Step) => ({
    className: 'col-start-1 row-start-1 flex flex-col p-6',
    inert: step !== index,
    initial: false,
    animate: { x: `${(index - step) * 100}%` },
    transition: SPRING,
  });

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
                {/* CSS centres the card; motion only adds the 20px rise. Animating
                    y from calc(-50% + 20px) to -50% never completes in Framer. */}
                <div
                  ref={cardRef}
                  className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-24px)] max-w-[375px] -translate-x-1/2 -translate-y-1/2 font-sans text-[14px] leading-[1.6] text-[#111] outline-none dark:text-[#eee] print:hidden"
                >
                  <motion.div
                    className="grid overflow-hidden rounded-2xl bg-[#fff] dark:bg-[#222]"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={SPRING}
                  >
                    <motion.div {...panelProps(0)}>
                      <DialogPrimitive.Title className={TITLE_CLASS}>
                        {title}
                        <span aria-hidden="true" className="whitespace-nowrap">
                          {' '}
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

                      {EMAIL_AUTH_ENABLED && (
                        <div className="mt-2 flex h-8 items-center justify-center">
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className={TEXT_BUTTON_CLASS}
                          >
                            Continue with email
                          </button>
                        </div>
                      )}
                    </motion.div>

                    <motion.div {...panelProps(1)}>
                      <DialogPrimitive.Title className={TITLE_CLASS}>
                        Continue with an email link{' '}
                        <span aria-hidden="true">💌</span>
                      </DialogPrimitive.Title>
                      <p className="text-[#666] dark:text-[#aaa]">
                        Enter your email and we&apos;ll send you a link to{' '}
                        {mode === 'login'
                          ? 'log in to your account.'
                          : 'create a new profile.'}
                      </p>

                      <form onSubmit={handleSubmit}>
                        <div className="relative mt-3">
                          <input
                            ref={inputRef}
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            spellCheck={false}
                            placeholder="Email address"
                            aria-label="Email address"
                            aria-invalid={!!error}
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setError('');
                            }}
                            // 16px on phones so iOS doesn't zoom into the field.
                            className={`h-9 w-full rounded-lg bg-[#f2f2f2] px-3 pr-9 text-[16px] text-[#111] outline-none placeholder:text-[#aaa] focus-visible:ring-2 focus-visible:ring-[#111]/20 dark:bg-[#333] dark:text-[#eee] dark:focus-visible:ring-[#eee]/20 sm:text-[14px] ${error ? 'shadow-[0_0_0_2px_#f04848]' : ''}`}
                          />
                          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
                            <AnimatePresence>
                              {emailIsValid && (
                                <motion.span
                                  className="block"
                                  initial={{ opacity: 0, scale: 0.5 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.5 }}
                                  transition={POP_SPRING}
                                >
                                  <ValidCheck />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </span>
                        </div>

                        {error && (
                          <p
                            role="alert"
                            className="mt-2 text-[13px] text-[#f04848]"
                          >
                            {error}
                          </p>
                        )}

                        <div className="mt-3 flex items-center justify-end gap-4">
                          <button
                            type="button"
                            onClick={() => setStep(0)}
                            className={TEXT_BUTTON_CLASS}
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            disabled={!emailIsValid || sending}
                            aria-busy={sending}
                            className={BUTTON_CLASS}
                          >
                            {/* The label stays (hidden) so the width holds. */}
                            <span className={sending ? 'text-transparent' : ''}>
                              Submit
                            </span>
                            {sending && (
                              <Spinner
                                size={14}
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#111] dark:text-[#eee]"
                              />
                            )}
                          </button>
                        </div>
                      </form>
                    </motion.div>

                    <motion.div {...panelProps(2)}>
                      <DialogPrimitive.Title className={TITLE_CLASS}>
                        Check your inbox! <span aria-hidden="true">🍄</span>
                      </DialogPrimitive.Title>
                      <p className="text-[#666] dark:text-[#aaa]">
                        Open the link sent to{' '}
                        <span className="break-all text-[#111] dark:text-[#eee]">
                          {normalizedEmail}
                        </span>{' '}
                        in this browser.
                      </p>

                      {devLink && (
                        <a
                          href={devLink}
                          className="mt-3 block text-[13px] text-[#666] underline underline-offset-4 dark:text-[#aaa]"
                        >
                          Development only: open the link here
                        </a>
                      )}

                      {/* Pinned to the bottom of the card, as on Read.cv. */}
                      <div className="mt-auto flex items-center justify-end gap-4 pt-3">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className={TEXT_BUTTON_CLASS}
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenChange(false)}
                          className={BUTTON_CLASS}
                        >
                          Done
                        </button>
                      </div>
                    </motion.div>
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
