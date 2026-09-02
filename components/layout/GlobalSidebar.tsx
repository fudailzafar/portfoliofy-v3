'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { ExploreSidebar } from './ExploreSidebar';
import { toast } from 'sonner';
import { useUserActions } from '@/hooks/useUserActions';
import { SITE_HOST } from '@/lib/site';

export function GlobalSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { usernameQuery, resumeQuery } = useUserActions();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isExploreMode, setIsExploreMode] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsExploreMode((prev) => !prev);
    window.addEventListener('toggleExploreMode', handleToggle);
    return () =>
      window.removeEventListener(
        'toggleExploreMode',
        handleToggle as EventListener,
      );
  }, []);

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthDialogOpen(true);
  };

  const displayName =
    resumeQuery.data?.resume?.resumeData?.header?.name || session?.user?.name;

  const currentUsername =
    usernameQuery.data?.username || session?.user?.username;

  if (isExploreMode) {
    return <ExploreSidebar onClose={() => setIsExploreMode(false)} />;
  }

  return (
    <>
      <div className="flex h-full w-[330px] flex-col border-r border-border-strong bg-surface-1 px-4 py-6">
        <div className="mt-2 flex-1">
          <div
            onClick={() => setIsExploreMode(true)}
            className="flex h-10 cursor-pointer items-center justify-between rounded-full bg-surface-2 px-4 transition-all dark:bg-[#333]"
          >
            <span className="text-[14px] text-content-muted">Explore</span>
            <span
              className="text-[12px] tracking-[0.2em] text-content-muted dark:text-content-muted"
              style={{
                fontFamily:
                  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              ⌘⇧E
            </span>
          </div>
        </div>

        <div className="mt-auto flex flex-col pb-4">
          {session ? (
            <div className="flex flex-col gap-4 pl-1">
              {/* User Info & Logout */}
              <div className="mb-3 pl-4">
                <div className="text-[14px] text-content-primary">
                  {displayName}
                </div>
                <div className="mt-1 text-[13px] text-content-muted">
                  Not you?{' '}
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-[#b3b3b3] hover:underline hover:underline-offset-4"
                  >
                    Logout
                  </button>
                </div>
              </div>

              {/* Profile */}
              {!currentUsername && usernameQuery.isLoading ? (
                <div className="group flex w-fit items-center gap-3">
                  <div className="h-1 w-1 rounded-full bg-transparent" />
                  <div className="h-4 w-12 animate-pulse rounded bg-surface-3" />
                </div>
              ) : (
                currentUsername && (
                  <Link
                    href={`/${currentUsername}`}
                    className="group flex w-fit items-center gap-3"
                  >
                    <div
                      className={`h-1 w-1 rounded-full ${pathname === `/${currentUsername}` ? 'bg-content-primary' : 'bg-transparent'}`}
                    />
                    <span className="text-[14px] text-content-secondary underline-offset-4 group-hover:underline">
                      Profile
                    </span>
                  </Link>
                )
              )}

              {/* About */}
              <Link href="/" className="group flex w-fit items-center gap-3">
                <div
                  className={`h-1 w-1 rounded-full ${pathname === '/' || pathname === '/about' ? 'bg-content-primary' : 'bg-transparent'}`}
                />
                <span className="text-[14px] text-content-secondary underline-offset-4 group-hover:underline">
                  About
                </span>
              </Link>

              {/* Username copy to clipboard */}
              {!currentUsername && usernameQuery.isLoading ? (
                <div className="mt-2 pt-6">
                  <div className="ml-4 h-4 w-40 animate-pulse rounded bg-surface-3" />
                </div>
              ) : (
                currentUsername && (
                  <div className="mt-2 pt-6">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${SITE_HOST}/${currentUsername}`,
                        );
                        toast.success('Copied to clipboard');
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      }}
                      className="relative h-5 w-40 overflow-hidden pl-4 text-left text-[14px] text-content-muted transition-colors hover:underline hover:underline-offset-[3px]"
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={isCopied ? 'copied' : 'copy'}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-4 top-0"
                        >
                          {isCopied
                            ? 'Copied my profile link'
                            : 'Copy my profile link'}
                        </motion.span>
                      </AnimatePresence>
                    </button>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* About */}
              <Link href="/" className="group flex w-fit items-center gap-3">
                <div
                  className={`h-1 w-1 rounded-full ${pathname === '/' || pathname === '/about' ? 'bg-action-primary' : 'bg-transparent'}`}
                />
                <span className="text-[14px] text-content-primary underline-offset-4 group-hover:underline">
                  About
                </span>
              </Link>

              {/* Login */}
              <div className="pt-1">
                <button
                  onClick={() => openAuth('login')}
                  className="group flex w-fit items-center gap-3 text-left"
                >
                  <div className="h-1 w-1 rounded-full bg-transparent" />
                  <span className="text-[14px] text-content-primary underline-offset-4 group-hover:underline">
                    Login
                  </span>
                </button>
              </div>

              {/* Create a profile */}
              <div className="pl-2 pt-3">
                <button
                  onClick={() => openAuth('signup')}
                  className="h-[32px] w-[130px] rounded-[8px] border border-border-strong bg-surface-1 text-[14px] font-medium text-content-primary transition-all active:bg-surface-2 dark:border-none dark:bg-border-subtle dark:active:bg-border-strong"
                >
                  Create a profile
                </button>
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
