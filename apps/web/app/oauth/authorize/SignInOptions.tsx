'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { ValidCheck } from '@/components/ui/valid-check';
import {
  isValidEmail,
  normalizeEmail,
} from '@portfoliofy/shared/validation/email';

// Off unless set, so the email option only appears where it is configured.
const EMAIL_AUTH_ENABLED = process.env.NEXT_PUBLIC_EMAIL_AUTH === 'true';

type Step = 'choose' | 'email' | 'sent';

/**
 * `returnTo` is this connect screen, so both sign-in methods bring the person
 * back to it afterwards.
 */
export function SignInOptions({ returnTo }: { returnTo: string }) {
  const [step, setStep] = useState<Step>('choose');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [devLink, setDevLink] = useState('');

  const normalizedEmail = normalizeEmail(email);
  const emailIsValid = isValidEmail(normalizedEmail);

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailIsValid || sending) return;

    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/auth/email-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail,
          mode: 'login',
          next: returnTo,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "We couldn't send the link. Try again.");
        return;
      }
      setDevLink(data.devLink ?? '');
      setStep('sent');
    } catch {
      setError("We couldn't send the link. Try again.");
    } finally {
      setSending(false);
    }
  };

  if (step === 'sent') {
    return (
      <div className="mt-8 space-y-3">
        <p className="text-[#111] dark:text-[#eee]">Check your inbox</p>
        <p>
          Open the link sent to{' '}
          <span className="break-all text-[#111] dark:text-[#eee]">
            {normalizedEmail}
          </span>{' '}
          in this browser. You&apos;ll come back here to finish connecting.
        </p>
        {devLink && (
          <a href={devLink} className="block underline underline-offset-4">
            Development only: open the link here
          </a>
        )}
        <button
          type="button"
          onClick={() => setStep('email')}
          className="text-[#111] hover:underline hover:underline-offset-4 dark:text-[#eee]"
        >
          Use a different email
        </button>
      </div>
    );
  }

  if (step === 'email') {
    return (
      <form onSubmit={sendLink} className="mt-8 space-y-3">
        <div className="relative">
          <Input
            type="email"
            inputMode="email"
            autoComplete="email"
            spellCheck={false}
            placeholder="Email address"
            aria-label="Email address"
            aria-invalid={!!error}
            autoFocus
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            className="pr-10"
          />
          {emailIsValid && (
            <ValidCheck className="absolute right-3 top-1/2 -translate-y-1/2" />
          )}
        </div>
        {error && (
          <p role="alert" className="text-[13px] text-red-500">
            {error}
          </p>
        )}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={!emailIsValid || sending}>
            {sending && <Spinner size={14} className="mr-2" />}
            Send link
          </Button>
          <button
            type="button"
            onClick={() => setStep('choose')}
            className="text-[#111] hover:underline hover:underline-offset-4 dark:text-[#eee]"
          >
            Back
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="mt-8 flex flex-col items-start gap-3">
      <Button onClick={() => signIn('google', { callbackUrl: returnTo })}>
        Continue with Google
      </Button>
      {EMAIL_AUTH_ENABLED && (
        <button
          type="button"
          onClick={() => setStep('email')}
          className="text-[#111] hover:underline hover:underline-offset-4 dark:text-[#eee]"
        >
          Continue with email
        </button>
      )}
    </div>
  );
}
