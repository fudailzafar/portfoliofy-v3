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
          <strong translate="no">Portfoliofy</strong> is a progressive platform used by
          thousands of people to create more mindful professional profiles.
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
