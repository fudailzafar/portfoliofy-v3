'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { claimUsernameAndInitProfile } from './actions';
import { toast } from 'sonner';
import { Check, Loader2 } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

export default function ClaimPageClient({ userId }: { userId: string }) {
  const router = useRouter();
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
    <div className="flex min-h-[70vh] flex-1 flex-col items-center justify-center gap-6 px-4 py-12 dark:bg-[#121212]">
      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-[#333] dark:bg-[#1f1f1f]">
        <h1 className="mb-2 text-left text-2xl font-bold dark:text-gray-100">
          Welcome to Portfoliofy👋🏻
        </h1>
        <p className="mb-8 text-left text-sm text-gray-500 dark:text-gray-400">
          We just need a few details to finish creating your account. You can
          always change this later.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="username" className="dark:text-gray-200">Username</Label>
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
                  'pr-10 dark:bg-[#2c2c2c] dark:border-[#333] dark:text-gray-100',
                  status === 'taken' &&
                    'border-red-500 focus-visible:ring-red-500',
                )}
                placeholder="your unique @username"
                maxLength={30}
                required
              />
              {status === 'checking' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
              {status === 'available' && (
                <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-green-500 p-0.5">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="displayName" className="dark:text-gray-200">Display Name</Label>
              <span className="text-xs text-gray-400">
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
                className="pr-10 dark:bg-[#2c2c2c] dark:border-[#333] dark:text-gray-100"
              />
              {displayName.length > 0 && (
                <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-green-500 p-0.5">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={async () => {
                await signOut({ callbackUrl: '/' });
              }}
              className="text-xs text-gray-500 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Log in with a different email
            </button>
            <Button
              type="submit"
              className="bg-design-black text-white hover:bg-design-black/95 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              disabled={
                isSubmitting ||
                !username ||
                !displayName ||
                status === 'taken' ||
                status === 'checking'
              }
            >
              {isSubmitting ? 'Claiming...' : 'Continue'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
