'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { AuthDialog } from './AuthDialog';
import { Button } from '@/components/ui/button';
import { useUserActions } from '@/hooks/useUserActions';
import { toast } from 'sonner';

export function GlobalSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { usernameQuery } = useUserActions();
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
            <span className="text-[12px] text-gray-400 tracking-tighter">⌘⇧E</span>
          </div>
        </div>

        <div className="flex flex-col mt-auto pb-4">
          {session ? (
            <div className="flex flex-col gap-4 pl-1">
              {/* User Info & Logout */}
              <div className="pl-4 mb-3">
                <div className="text-[14px] text-gray-800">{session.user.name}</div>
                <div className="text-[13px] text-gray-400 mt-1">
                  Not you? <button onClick={() => signOut({ callbackUrl: '/' })} className="hover:underline text-[#b3b3b3]">Logout</button>
                </div>
              </div>
              
              {/* Profile */}
              {usernameQuery.data?.username && (
                <Link href={`/${usernameQuery.data.username}`} className="flex items-center gap-3 w-fit group">
                  <div className={`w-1 h-1 rounded-full ${pathname === `/${usernameQuery.data.username}` ? 'bg-black' : 'bg-transparent'}`} />
                  <span className="text-[14px] text-gray-800 group-hover:underline underline-offset-4">Profile</span>
                </Link>
              )}
              {/* About */}
              <Link href="/" className="flex items-center gap-3 w-fit group">
                <div className={`w-1 h-1 rounded-full ${pathname === '/' || pathname === '/about' ? 'bg-black' : 'bg-transparent'}`} />
                <span className="text-[14px] text-gray-800 group-hover:underline underline-offset-4">About</span>
              </Link>
              
              {/* Username copy to clipboard */}
              {usernameQuery.data?.username && (
                <div className="pt-6 mt-2">
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`portfoliofy-v3.vercel.app/${usernameQuery.data.username}`);
                      toast.success('Copied to clipboard');
                    }}
                    className="text-[14px] text-gray-400 hover:text-gray-600 transition-colors pl-4"
                  >
                    portfoliofy-v3.vercel.app/{usernameQuery.data.username}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link href="/" className="flex items-center gap-3 w-fit group">
                <div className={`w-1 h-1 rounded-full ${pathname === '/' || pathname === '/about' ? 'bg-black' : 'bg-transparent'}`} />
                <span className="text-[14px] text-gray-800 group-hover:underline underline-offset-4">About</span>
              </Link>
              <button
                onClick={() => openAuth('login')}
                className="flex items-center gap-3 w-fit group text-left"
              >
                <div className="w-1 h-1 rounded-full bg-transparent" />
                <span className="text-[14px] text-gray-800 group-hover:underline underline-offset-4">Login</span>
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
