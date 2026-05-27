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
  
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  useEffect(() => {
    if (!username.trim()) {
      setStatus('idle');
      return;
    }

    const checkAvailability = async () => {
      setStatus('checking');
      try {
        const res = await fetch(`/api/check-username?username=${encodeURIComponent(username)}`, {
          method: 'POST',
        });
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
      toast.error('Username can only contain lowercase letters, numbers, and hyphens.');
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
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-12 gap-6 min-h-[70vh]">
      <div className="w-full max-w-md bg-white p-8 rounded-xl border border-gray-200 shadow-sm font-mono">
        <h1 className="text-2xl font-bold text-left mb-2">Welcome to Portfoliofy👋🏻</h1>
        <p className="text-sm text-gray-500 text-left mb-8">
          We just need a few details to finish creating your account. You can always change this later.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="username">Username</Label>
              {status === 'taken' && (
                <span className="text-xs text-red-500 font-medium">Username is taken</span>
              )}
            </div>
            <div className="relative">
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className={cn(
                  "pr-10",
                  status === 'taken' && "border-red-500 focus-visible:ring-red-500"
                )}
                placeholder="your unique @username"
                maxLength={30}
                required
              />
              {status === 'checking' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              )}
              {status === 'available' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-green-500 rounded-full p-0.5 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="displayName">Display Name</Label>
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
                className="pr-10"
              />
              {displayName.length > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-green-500 rounded-full p-0.5 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={async () => {
                await signOut({ callbackUrl: '/' });
              }}
              className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              Log in with a different email
            </button>
            <Button
              type="submit"
              className="bg-design-black hover:bg-design-black/95 text-white"
              disabled={isSubmitting || !username || !displayName || status === 'taken' || status === 'checking'}
            >
              {isSubmitting ? 'Claiming...' : 'Continue'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
