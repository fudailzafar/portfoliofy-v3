'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { AuthorizationParams } from '@/lib/server/oauth';
import { approveAuthorization } from './actions';

// For our own app: there is nothing to approve, so send the code straight back.
export function AutoApprove({ params }: { params: AuthorizationParams }) {
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  const approve = async () => {
    setError(null);
    const result = await approveAuthorization(params);
    if ('error' in result) {
      setError(result.error);
      return;
    }
    window.location.assign(result.redirectUrl);
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void approve();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <>
        <p>{error}</p>
        <Button onClick={approve}>Try again</Button>
      </>
    );
  }
  return <p>Returning you to the Portfoliofy app…</p>;
}
