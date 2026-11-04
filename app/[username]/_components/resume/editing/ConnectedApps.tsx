'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import type { ConnectedApp } from '@/lib/server/oauth';

const QUERY_KEY = ['connected-apps'];

// As sent over JSON, where dates arrive as strings.
type App = Omit<ConnectedApp, 'connectedAt' | 'lastUsedAt'> & {
  lastUsedAt: string | null;
};

function relativeTime(date: string): string {
  const hours = Math.floor((Date.now() - new Date(date).getTime()) / 3_600_000);
  if (hours < 1) return 'less than an hour ago';
  const format = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  return hours < 24
    ? format.format(-hours, 'hour')
    : format.format(-Math.floor(hours / 24), 'day');
}

function describeApp(app: App) {
  const access = app.scopes.includes('profile:write')
    ? 'Can read and change your profile'
    : 'Can read your profile';
  const used = app.lastUsedAt
    ? `Used ${relativeTime(app.lastUsedAt)}`
    : 'Not used yet';
  return `${access}. ${used}.`;
}

async function fetchApps(): Promise<App[]> {
  const response = await fetch('/api/user/connected-apps');
  if (!response.ok) throw new Error('Failed to load connected apps');
  return (await response.json()).apps;
}

export function ConnectedApps() {
  const queryClient = useQueryClient();
  const {
    data: apps,
    isLoading,
    isError,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchApps,
  });

  const disconnect = useMutation({
    mutationFn: async (clientId: string) => {
      const response = await fetch('/api/user/connected-apps', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }),
      });
      if (!response.ok) throw new Error('Failed to disconnect the app');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('App disconnected');
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="w-full min-w-0 space-y-4">
      <div>
        <h4 className="text-sm text-content-primary">Connected apps</h4>
        <p className="text-sm text-content-muted">
          {isError
            ? 'Connected apps could not be loaded. Try again later.'
            : apps?.length
              ? 'These apps can act on your profile.'
              : 'Update your profile by chatting with an AI app. '}
          {!isError && !apps?.length && (
            <Link
              href="/connect"
              target="_blank"
              className="text-content-primary underline underline-offset-[3px]"
            >
              See how
            </Link>
          )}
        </p>
      </div>

      {isLoading && <Spinner size={14} className="text-content-muted" />}

      {apps?.map((app) => {
        const isDisconnecting =
          disconnect.isPending && disconnect.variables === app.clientId;
        return (
          <div
            key={app.clientId}
            className="flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-content-primary">
                {app.clientName}
              </p>
              <p className="text-sm text-content-muted">{describeApp(app)}</p>
            </div>
            <button
              onClick={() => disconnect.mutate(app.clientId)}
              disabled={disconnect.isPending}
              aria-label={`Disconnect ${app.clientName}`}
              className="flex h-9 w-[120px] shrink-0 items-center justify-center rounded-md border border-border-strong bg-surface-card px-4 text-[13px] font-medium text-content-primary shadow-sm transition-all active:bg-surface-2 disabled:opacity-50 dark:border-none dark:bg-border-subtle dark:active:bg-border-strong"
            >
              {isDisconnecting ? <Spinner size={14} /> : 'Disconnect'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
