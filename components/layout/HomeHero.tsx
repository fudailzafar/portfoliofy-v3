'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AuthDialog } from '@/components/auth/AuthDialog';

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
      <div className="mb-8 flex flex-col">
        <h1 className="mb-8 text-[20px] font-normal leading-[1.3] tracking-tight text-gray-900 md:text-[24px]">
          <strong translate="no">Portfoliofy</strong> is a{' '}
          <a
            href="https://web.dev/progressive-web-apps/"
            className="cursor-text text-inherit no-underline hover:text-inherit"
          >
            progressive platform
          </a>{' '}
          used by thousands of people to create more{' '}
          <a
            href="https://en.wikipedia.org/wiki/Mindfulness"
            className="cursor-text text-inherit no-underline hover:text-inherit"
          >
            mindful
          </a>{' '}
          professional profiles.
        </h1>

        <div className="flex justify-end">
          <Button
            onClick={handleCreateProfile}
            className="h-12 rounded-full bg-[#111] px-8 text-[16px] font-medium tracking-wide text-white hover:bg-black"
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
