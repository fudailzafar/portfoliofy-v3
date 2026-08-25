'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SettingsTabProps {
  username: string;
  onConfirmDelete: () => void;
  isDeletingAccount: boolean;
  createdAt?: Date | null;
}

export function SettingsTab({
  username,
  onConfirmDelete,
  isDeletingAccount,
  createdAt,
}: SettingsTabProps) {
  const { theme, setTheme } = useTheme();
  // Expands the confirmation inline, in place — no separate dialog. Matches
  // typing the username to enable the destructive action, not just a click.
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [typedUsername, setTypedUsername] = useState('');

  const getThemeDescription = () => {
    switch (theme) {
      case 'light':
        return 'Always appears light';
      case 'dark':
        return 'Always appears dark';
      case 'system':
      default:
        return 'Inherits OS dark mode';
    }
  };

  const usernameMatches =
    typedUsername.trim().toLowerCase() === username.toLowerCase();

  const cancelDelete = () => {
    setIsConfirmingDelete(false);
    setTypedUsername('');
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col">
      <div className="mb-8 flex items-center justify-between border-b border-border-subtle pb-4">
        <h2 className="text-xl font-bold text-content-primary sm:text-2xl">
          Settings
        </h2>
      </div>
      <div className="space-y-10">
        <div className="w-full min-w-0 space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm text-content-primary">Appearance</h4>
                <p className="text-sm text-content-muted">
                  {getThemeDescription()}
                </p>
              </div>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-[120px] bg-transparent text-content-primary">
                  <SelectValue placeholder="System" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="w-full min-w-0 space-y-6">
          <div className="flex flex-col gap-4">
            {!isConfirmingDelete && (
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm text-content-primary">Account</h4>
                  <p className="text-sm text-content-muted">
                    {createdAt
                      ? (() => {
                          const daysAgo = Math.floor(
                            (new Date().getTime() -
                              new Date(createdAt).getTime()) /
                              (1000 * 60 * 60 * 24),
                          );
                          if (daysAgo < 1) return 'Joined less than a day ago';
                          if (daysAgo === 1) return 'Joined 1 day ago';
                          return `Joined ${daysAgo} days ago`;
                        })()
                      : 'Permanently delete your account and all associated data.'}
                  </p>
                </div>

                <button
                  onClick={() => setIsConfirmingDelete(true)}
                  className="h-9 w-[120px] shrink-0 items-center justify-center rounded-md border border-border-strong bg-surface-card px-4 text-[13px] font-medium text-content-primary shadow-sm transition-all active:bg-surface-2 dark:border-none dark:bg-border-subtle dark:text-red-600 dark:active:bg-border-strong"
                >
                  Delete
                </button>
              </div>
            )}

            {isConfirmingDelete && (
              <div className="space-y-3 border-t border-border-subtle pt-4">
                <p className="text-sm leading-relaxed text-content-muted">
                  Deleting your account cannot be undone, your data will be
                  permanently erased. To continue type your username.
                </p>
                <Input
                  value={typedUsername}
                  onChange={(e) => setTypedUsername(e.target.value)}
                  placeholder="Your username"
                  autoFocus
                  disabled={isDeletingAccount}
                />
                <div className="flex items-center justify-end gap-3 pt-1">
                  <button
                    onClick={cancelDelete}
                    disabled={isDeletingAccount}
                    className="text-sm font-medium text-content-primary hover:underline hover:underline-offset-4 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirmDelete}
                    disabled={!usernameMatches || isDeletingAccount}
                    className="h-9 w-auto min-w-[120px] whitespace-nowrap rounded-md border border-border-strong bg-surface-card px-4 text-[13px] font-medium text-content-primary shadow-sm transition-all active:bg-surface-2 dark:border-none dark:bg-border-subtle dark:text-red-600 dark:active:bg-border-strong"
                  >
                    {isDeletingAccount ? (
                      <span className="flex items-center justify-center">
                        <Spinner size={14} />
                      </span>
                    ) : (
                      'Delete account'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
