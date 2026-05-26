'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { claimUsernameAndInitProfile } from './actions';
import { toast } from 'sonner';

export default function ClaimPageClient({ userId }: { userId: string }) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      router.push(`/${cleanUsername}`);
      router.refresh(); // to ensure RSC for username page is fetched fresh
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-12 gap-6 min-h-[70vh]">
      <div className="w-full max-w-md bg-white p-8 rounded-xl border border-gray-200 shadow-sm font-mono">
        <h1 className="text-2xl font-bold text-center mb-2">Claim your handle</h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          This will be your unique portfolio URL.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 select-none">
                portfoliofy.me/
              </span>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="pl-36"
                placeholder="john-doe"
                maxLength={30}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="displayName">Display Name</Label>
              <span className="text-xs text-gray-400">
                {displayName.length} of 48
              </span>
            </div>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="John Doe"
              maxLength={48}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-design-black hover:bg-design-black/95 text-white"
            disabled={isSubmitting || !username || !displayName}
          >
            {isSubmitting ? 'Claiming...' : 'Continue'}
          </Button>
        </form>
      </div>
    </div>
  );
}
