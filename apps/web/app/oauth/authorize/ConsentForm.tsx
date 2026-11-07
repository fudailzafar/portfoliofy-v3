'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import type { AuthorizationParams } from '@/lib/server/oauth';
import {
  approveAuthorization,
  ConsentResult,
  denyAuthorization,
} from './actions';

export function ConsentForm({ params }: { params: AuthorizationParams }) {
  const [isPending, startTransition] = useTransition();

  const respond = (action: typeof approveAuthorization) =>
    startTransition(async () => {
      const result: ConsentResult = await action(params);
      if ('error' in result) {
        toast.error(result.error);
        return;
      }
      window.location.assign(result.redirectUrl);
    });

  return (
    <div className="mt-8 flex gap-3">
      <Button
        onClick={() => respond(approveAuthorization)}
        disabled={isPending}
      >
        {isPending && <Spinner size={14} className="mr-2" />}
        Allow access
      </Button>
      <Button
        variant="outline"
        onClick={() => respond(denyAuthorization)}
        disabled={isPending}
      >
        Cancel
      </Button>
    </div>
  );
}
