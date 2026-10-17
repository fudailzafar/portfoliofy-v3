'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { useUserActions } from '@/hooks/useUserActions';

const FEATURED_PROFILE_SEEDS = [
  'Jeff',
  'Mia',
  'Alex',
  'Sophie',
  'Tom',
  'Lauren',
  'Noah',
  'Priya',
  'Kenji',
];

export function HomeHero() {
  const { data: session } = useSession();
  const { usernameQuery } = useUserActions();
  const router = useRouter();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const handleCreateProfile = () => {
    if (session) {
      if (usernameQuery.data?.username) {
        router.push(`/${usernameQuery.data.username}`);
      } else {
        window.location.reload();
      }
    } else {
      setAuthDialogOpen(true);
    }
  };

  return (
    <>
      <div className="flex flex-col">
        <h1 className="text-[clamp(18px,-8px+5vw,24px)] font-normal leading-[1.6] tracking-tight text-content-primary">
          <strong translate="no" className="font-medium">
            Portfoliofy
          </strong>{' '}
          is a drag-and-drop portfolio builder for professionals who want their
          profile to actually look like them.
        </h1>

        <div className="mb-8 mt-4 grid grid-cols-[repeat(6,minmax(16px,72px))] items-center [gap:var(--hero-gap,22px)] min-[481px]:mb-12 min-[481px]:mt-8 min-[637px]:mb-[calc(50vw_-_270px)] min-[685px]:mb-[72px]">
          {FEATURED_PROFILE_SEEDS.map((seed) => (
            <div
              key={seed}
              className="aspect-square w-full overflow-hidden rounded-full bg-surface-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.dicebear.com/10.x/glyphs/svg?seed=${seed}`}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          ))}

          <Button
            onClick={handleCreateProfile}
            className="col-span-3 h-full min-h-11 rounded-full bg-[#111] text-[clamp(18px,-8px+5vw,24px)] font-medium tracking-wide text-surface-1 hover:bg-black dark:bg-action-primary dark:hover:bg-action-primary-hover max-[415px]:text-[16px] max-[340px]:px-2 max-[340px]:text-[14px]"
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
