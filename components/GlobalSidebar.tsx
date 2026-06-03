'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { AuthDialog } from './AuthDialog';
import { Button } from '@/components/ui/button';
import { ExploreSidebar } from './ExploreSidebar';
import { toast } from 'sonner';
import { useUserActions } from '@/hooks/useUserActions';

export function GlobalSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { usernameQuery, resumeQuery } = useUserActions();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isExploreMode, setIsExploreMode] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsExploreMode((prev) => !prev);
    window.addEventListener('toggleExploreMode', handleToggle);
    return () => window.removeEventListener('toggleExploreMode', handleToggle as EventListener);
  }, []);

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthDialogOpen(true);
  };

  const displayName =
    resumeQuery.data?.resume?.resumeData?.header?.name || session?.user?.name;

  if (isExploreMode) {
    return <ExploreSidebar onClose={() => setIsExploreMode(false)} />;
  }

  return (
    <>
      <div className="flex h-full w-[260px] flex-col border-r border-gray-100 bg-[#fafafa] px-4 py-6">
        <div className="mt-2 flex-1">
          <div 
            onClick={() => setIsExploreMode(true)}
            className="flex cursor-pointer items-center justify-between rounded-[10px] bg-[#f2f2f2] px-3 py-2 transition-colors hover:bg-gray-200/80"
          >
            <span className="text-[13px] font-medium text-gray-500">
              Explore
            </span>
            <span className="text-[12px] tracking-tighter text-gray-400">
              ⌘⇧E
            </span>
          </div>
        </div>

        <div className="mt-auto flex flex-col pb-4">
          {session ? (
            <div className="flex flex-col gap-4 pl-1">
              {/* User Info & Logout */}
              <div className="mb-3 pl-4">
                <div className="text-[14px] text-gray-800">{displayName}</div>
                <div className="mt-1 text-[13px] text-gray-400">
                  Not you?{' '}
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-[#b3b3b3] hover:underline"
                  >
                    Logout
                  </button>
                </div>
              </div>

              {/* Profile */}
              {usernameQuery.data?.username && (
                <Link
                  href={`/${usernameQuery.data.username}`}
                  className="group flex w-fit items-center gap-3"
                >
                  <div
                    className={`h-1 w-1 rounded-full ${pathname === `/${usernameQuery.data.username}` ? 'bg-black' : 'bg-transparent'}`}
                  />
                  <span className="text-[14px] text-gray-800 underline-offset-4 group-hover:underline">
                    Profile
                  </span>
                </Link>
              )}
              {/* About */}
              <Link href="/" className="group flex w-fit items-center gap-3">
                <div
                  className={`h-1 w-1 rounded-full ${pathname === '/' || pathname === '/about' ? 'bg-black' : 'bg-transparent'}`}
                />
                <span className="text-[14px] text-gray-800 underline-offset-4 group-hover:underline">
                  About
                </span>
              </Link>

              {/* Username copy to clipboard */}
              {usernameQuery.data?.username && (
                <div className="mt-2 pt-6">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `portfoliofy.me/${usernameQuery.data.username}`,
                      );
                      toast.success('Copied to clipboard');
                    }}
                    className="pl-4 text-left text-[14px] text-gray-400 transition-colors hover:text-gray-600"
                  >
                    portfoliofy.me/{usernameQuery.data.username}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link href="/" className="group flex w-fit items-center gap-3">
                <div
                  className={`h-1 w-1 rounded-full ${pathname === '/' || pathname === '/about' ? 'bg-black' : 'bg-transparent'}`}
                />
                <span className="text-[14px] text-gray-800 underline-offset-4 group-hover:underline">
                  About
                </span>
              </Link>
              <button
                onClick={() => openAuth('login')}
                className="group flex w-fit items-center gap-3 text-left"
              >
                <div className="h-1 w-1 rounded-full bg-transparent" />
                <span className="text-[14px] text-gray-800 underline-offset-4 group-hover:underline">
                  Login
                </span>
              </button>
              <div className="pt-3">
                <Button
                  variant="outline"
                  onClick={() => openAuth('signup')}
                  className="h-9 w-full rounded-md border border-gray-200 bg-white text-[13px] font-medium text-black shadow-sm hover:bg-gray-50"
                >
                  Create a profile
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        mode={authMode}
      />
    </>
  );
}
