'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { AuthDialog } from './AuthDialog';
import { Button } from '@/components/ui/button';

export function GlobalSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthDialogOpen(true);
  };

  return (
    <>
      <div className="flex flex-col h-full w-[260px] bg-[#fafafa] border-r border-gray-100 py-6 px-4">
        <div className="flex-1 mt-2">
          <div className="bg-[#f2f2f2] rounded-[10px] px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-200/80 transition-colors">
            <span className="text-[13px] text-gray-500 font-medium">Explore</span>
            <span className="text-[12px] text-gray-400 font-mono tracking-tighter">⌘⇧E</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-auto pb-4">
          <Link href="/" className="flex items-center gap-3 w-fit group">
            <div className={`w-1 h-1 rounded-full ${pathname === '/' || pathname === '/about' ? 'bg-black' : 'bg-transparent'}`} />
            <span className="text-[14px] text-gray-800 font-medium group-hover:underline underline-offset-4">About</span>
          </Link>

          {session ? (
            <div className="flex flex-col gap-3">
              {/* User avatar + name */}
              <div className="flex items-center gap-2">
                {session.user.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name ?? 'User'}
                    className="size-7 rounded-full object-cover"
                  />
                )}
                <span className="text-[13px] text-gray-700 font-medium truncate max-w-[160px]">
                  {session.user.name}
                </span>
              </div>
              {/* Sign out */}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-3 w-fit group text-left"
              >
                <div className="w-1 h-1 rounded-full bg-transparent" />
                <span className="text-[14px] text-gray-800 font-medium group-hover:underline underline-offset-4">
                  Sign out
                </span>
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => openAuth('login')}
                className="flex items-center gap-3 w-fit group text-left"
              >
                <div className="w-1 h-1 rounded-full bg-transparent" />
                <span className="text-[14px] text-gray-800 font-medium group-hover:underline underline-offset-4">Login</span>
              </button>
              <div className="pt-3">
                <Button
                  variant="outline"
                  onClick={() => openAuth('signup')}
                  className="w-full bg-white text-black border border-gray-200 hover:bg-gray-50 rounded-md h-9 shadow-sm text-[13px] font-medium"
                >
                  Create a profile
                </Button>
              </div>
            </>
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
