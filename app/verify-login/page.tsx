'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Spinner } from '@/components/ui/spinner';

function VerifyLogin() {
  const token = useSearchParams().get('token');
  const [failed, setFailed] = useState(!token);
  // Strict Mode runs effects twice in development; a token only works once.
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;

    signIn('email-link', { token, redirect: false }).then((res) => {
      if (res?.error || !res?.ok) {
        setFailed(true);
        return;
      }
      // Full navigation so the new session is picked up everywhere.
      window.location.replace('/auth/post-login');
    });
  }, [token]);

  if (failed) {
    return (
      <div className="flex flex-col items-center gap-3 text-center text-[14px] leading-[1.6]">
        <p className="text-content-primary">This link has expired</p>
        <p className="text-content-secondary">
          Links work once and last 15 minutes.
        </p>
        <Link
          href="/"
          className="text-content-primary underline underline-offset-4"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-[14px] text-content-primary">
      <Spinner size={14} className="text-content-muted" />
      Verifying Login <span aria-hidden="true">🟡</span>
    </div>
  );
}

export default function VerifyLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Suspense fallback={null}>
        <VerifyLogin />
      </Suspense>
    </div>
  );
}
