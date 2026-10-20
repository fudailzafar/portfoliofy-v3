'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Spinner } from '@/components/ui/spinner';

// Mirrors PAGE_PASSWORD_MIN_LENGTH on the server.
const MIN_LENGTH = 4;

export function PagePasswordDialog({
  open,
  onOpenChange,
  pageId,
  isProtected,
  onChanged,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageId: string;
  isProtected: boolean;
  onChanged: (passwordProtected: boolean) => void;
}) {
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState<'save' | 'remove' | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setPassword('');
      setError('');
    }
  }, [open]);

  const update = async (next: string | null) => {
    setPending(next === null ? 'remove' : 'save');
    try {
      const res = await fetch(`/api/pages/${pageId}/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      onChanged(data.passwordProtected);
      toast.success(
        data.passwordProtected
          ? isProtected
            ? 'Password changed'
            : 'Page is now password protected'
          : 'Password removed',
      );
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not update password',
      );
    } finally {
      setPending(null);
    }
  };

  const handleSubmit = () => {
    if (pending) return;
    if (password.length < MIN_LENGTH) {
      setError(`Use at least ${MIN_LENGTH} characters.`);
      document.getElementById('page-password-input')?.focus();
      return;
    }
    setError('');
    update(password);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="gap-4 border border-border-subtle p-6 font-sans dark:border-none dark:bg-surface-1 sm:max-w-sm">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <AlertDialogHeader className="flex flex-col gap-1.5 space-y-0">
            <AlertDialogTitle className="text-left text-lg font-medium tracking-tight text-content-primary">
              Password protect
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left text-[14px] leading-snug text-content-secondary">
              {isProtected
                ? 'Only people with the password can read this page. Set a new password or remove it to make the page public.'
                : 'Only people with the password will be able to read this page. It also stays out of search results.'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="page-password-input"
              className="text-[13px] text-content-muted"
            >
              {isProtected ? 'New password' : 'Password'}
            </label>
            <input
              id="page-password-input"
              name="new-password"
              type="password"
              autoComplete="new-password"
              autoFocus
              value={password}
              aria-invalid={!!error}
              aria-describedby="page-password-hint"
              onChange={(e) => setPassword(e.target.value)}
              className="h-9 rounded-md border border-border-strong bg-surface-1 px-3 text-[16px] text-content-primary outline-none focus-visible:ring-2 focus-visible:ring-border-strong dark:border-none dark:bg-border-subtle sm:text-[14px]"
            />
            <p
              id="page-password-hint"
              aria-live="polite"
              className={`text-[12px] ${error ? 'text-red-600' : 'text-content-muted'}`}
            >
              {error || `At least ${MIN_LENGTH} characters.`}
            </p>
          </div>

          <AlertDialogFooter className="mt-1 flex !flex-row items-center justify-end gap-2 space-x-0">
            {isProtected && (
              <button
                type="button"
                onClick={() => update(null)}
                disabled={!!pending}
                className="mr-auto flex items-center gap-1.5 px-1 text-[13px] font-medium text-red-600 hover:underline hover:underline-offset-4 disabled:opacity-50"
              >
                {pending === 'remove' && (
                  <Spinner size={12} fill="currentColor" />
                )}
                Remove password
              </button>
            )}
            <AlertDialogCancel
              type="button"
              disabled={!!pending}
              className="border-none bg-surface-1 px-4 py-2 text-sm font-medium text-content-primary hover:bg-surface-1 hover:underline hover:underline-offset-4"
            >
              Cancel
            </AlertDialogCancel>
            <button
              type="submit"
              disabled={!!pending}
              className="flex h-9 items-center gap-1.5 whitespace-nowrap rounded-md border border-border-strong bg-surface-card px-4 text-[13px] font-medium text-content-primary shadow-sm transition-all active:bg-surface-2 disabled:opacity-50 dark:border-none dark:bg-border-subtle dark:active:bg-border-strong"
            >
              {pending === 'save' && <Spinner size={12} fill="currentColor" />}
              Save password
            </button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
