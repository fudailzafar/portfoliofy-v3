'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function SignInButton({ callbackUrl }: { callbackUrl: string }) {
  return (
    <Button className="mt-8" onClick={() => signIn('google', { callbackUrl })}>
      Continue with Google
    </Button>
  );
}
