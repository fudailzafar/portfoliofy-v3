'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { claimUsernameAndInitProfile } from '@/app/actions/claim';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export function ClaimDialog() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [status, setStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle');

  useEffect(() => {
    if (!username.trim()) {
      setStatus('idle');
      return;
    }

    const checkAvailability = async () => {
      setStatus('checking');
      try {
        const res = await fetch(
          `/api/check-username?username=${encodeURIComponent(username)}`,
          {
            method: 'POST',
          },
        );
        const data = await res.json();

        // Artificial delay so the loading spinner is briefly visible
        await new Promise((resolve) => setTimeout(resolve, 600));

        if (data.available) {
          setStatus('available');
        } else {
          setStatus('taken');
        }
      } catch (error) {
        setStatus('idle');
      }
    };

    const timeoutId = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !displayName.trim()) {
      toast.error('Please fill in both fields.');
      return;
    }

    // basic username format check
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (cleanUsername !== username) {
      toast.error(
        'Username can only contain lowercase letters, numbers, and hyphens.',
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await claimUsernameAndInitProfile(cleanUsername, displayName);
      if (res.error) {
        toast.error(res.error);
        setIsSubmitting(false);
        return;
      }

      toast.success('Handle claimed successfully!');
      window.location.href = `/${cleanUsername}`;
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent
        hideCloseButton
        className="gap-6 border-none p-8 font-sans dark:bg-surface-1 sm:max-w-sm"
      >
        <DialogHeader className="flex flex-col gap-1.5 space-y-0 text-left">
          <DialogTitle className="text-left text-lg font-medium tracking-tight text-content-primary">
            Welcome to Portfoliofy 👋🏻
          </DialogTitle>
          <DialogDescription className="text-left text-[14px] leading-snug text-content-secondary">
            We just need a few details to finish creating your account. You can
            always change this later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="username">Username</Label>
              {status === 'taken' && (
                <span className="text-xs font-medium text-red-500">
                  Username is taken
                </span>
              )}
            </div>
            <div className="relative">
              <Input
                id="username"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                  )
                }
                className={cn(
                  'bg-surface-1 pr-10 dark:border-none dark:bg-border-subtle',
                  status === 'taken' &&
                    'border-red-500 focus-visible:ring-red-500',
                )}
                placeholder="your unique @username"
                maxLength={30}
                required
              />
              {status === 'checking' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Spinner size={16} />
                </div>
              )}
              {status === 'available' && (
                <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-green-500 p-0.5">
                  <Check className="h-3 w-3 text-surface-1" strokeWidth={3} />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="displayName">Display Name</Label>
              <span className="text-xs text-content-muted">
                {displayName.length} of 48
              </span>
            </div>
            <div className="relative">
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="The name on your profile"
                maxLength={48}
                required
                className="bg-surface-1 pr-10 dark:border-none dark:bg-border-subtle"
              />
              {displayName.length > 0 && (
                <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-green-500 p-0.5">
                  <Check className="h-3 w-3 text-surface-1" strokeWidth={3} />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={async () => {
                await signOut({ callbackUrl: '/' });
              }}
              className="text-xs text-content-primary hover:underline hover:underline-offset-[3px]"
            >
              Log in with a different email
            </button>
            <button
              type="submit"
              className="h-[32px] w-[100px] rounded-[8px] border border-border-strong bg-surface-1 text-[14px] font-medium text-content-primary transition-all active:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-none dark:bg-border-subtle dark:active:bg-border-strong"
              disabled={
                isSubmitting ||
                !username ||
                !displayName ||
                status === 'taken' ||
                status === 'checking'
              }
            >
              {isSubmitting ? <Spinner size={16} /> : 'Continue'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
