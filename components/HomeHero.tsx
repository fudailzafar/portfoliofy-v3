'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AuthDialog } from './AuthDialog';

export function HomeHero() {
  const { data: session } = useSession();
  const router = useRouter();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const handleCreateProfile = () => {
    if (session) {
      router.push('/claim');
    } else {
      setAuthDialogOpen(true);
    }
  };

  return (
    <>
      <div className="flex flex-col mb-8">
        <h1 className="text-[20px] md:text-[24px] font-normal tracking-tight leading-[1.3] text-gray-900 mb-8">
          <strong translate="no">Portfoliofy</strong> is a <a href="https://web.dev/progressive-web-apps/" className="text-inherit no-underline hover:text-inherit cursor-text">progressive platform</a> used by
          thousands of people to create more <a href="https://en.wikipedia.org/wiki/Mindfulness" className="text-inherit no-underline hover:text-inherit cursor-text">mindful</a> professional profiles.
        </h1>

        <div className="flex justify-end">
          <Button
            onClick={handleCreateProfile}
            className="bg-[#111] text-white hover:bg-black rounded-md h-12 px-8 text-[16px] font-medium tracking-wide"
          >
            Create a profile
          </Button>
        </div>
      </div>

      <AuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        mode="signup"
      />
    </>
  );
}
