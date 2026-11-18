'use client';

// The main navigation: a slim icon rail down the left edge, as on read.cv.
// Home, Profile, Explore, Replies and Following sit in the middle; your avatar
// at the bottom opens a menu with Edit profile, Settings and Log out. On a
// phone the same buttons become a bar along the bottom.

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
  CheckIcon,
  GearIcon,
  LinkSimpleIcon,
  MagnifyingGlassIcon,
  NewspaperIcon,
  PaperPlaneTiltIcon,
  PencilSimpleIcon,
  RssSimpleIcon,
  SignOutIcon,
  UserIcon,
} from '@phosphor-icons/react/ssr';
import type { Icon } from '@phosphor-icons/react';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useNewFollowerCount } from '@/components/follow/useFollows';
import { useUnreadCount } from '@/app/[username]/_components/resume/editing/replies/useReplies';
import { useUserActions } from '@/hooks/useUserActions';
import { useResumeStore } from '@/store/useResumeStore';
import { SITE_URL } from '@/lib/site';
import { cn } from '@/lib/utils';

export const RAIL_WIDTH = 60;

interface RailItem {
  key: string;
  label: string;
  /** Shown beside the label in the tooltip, e.g. a keyboard shortcut. */
  hint?: string;
  icon: Icon;
  href?: string;
  onClick?: () => void;
  active: boolean;
  /** A dot for something unread, with its spoken form. */
  badge?: string;
}

function RailButton({ item }: { item: RailItem }) {
  const Glyph = item.icon;
  const className = cn(
    'relative grid size-11 shrink-0 place-items-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    item.active
      ? 'text-content-primary'
      : 'text-[#aaa] hover:text-content-primary dark:text-[#777] dark:hover:text-content-primary',
  );
  const inner = (
    <>
      <Glyph size={28} weight="light" aria-hidden />
      {item.badge && (
        <>
          <span
            className="absolute right-2 top-2 size-1.5 rounded-full bg-red-500"
            aria-hidden
          />
          <span className="sr-only">{item.badge}</span>
        </>
      )}
    </>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {item.href ? (
          <Link
            href={item.href}
            aria-label={item.label}
            aria-current={item.active ? 'page' : undefined}
            className={className}
          >
            {inner}
          </Link>
        ) : (
          <button
            type="button"
            onClick={item.onClick}
            aria-label={item.label}
            aria-pressed={item.active}
            className={className}
          >
            {inner}
          </button>
        )}
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8} className="hidden md:block">
        {item.label}
        {item.hint && (
          <span className="ml-2 text-[11px] tracking-tighter opacity-60">
            {item.hint}
          </span>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export function NavRail() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { usernameQuery, resumeQuery } = useUserActions();
  const setActiveTab = useResumeStore((state) => state.setActiveTab);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [copied, setCopied] = useState(false);

  const signedIn = !!session;
  // Only ask the server while signed in.
  const { data: unreadReplies = 0 } = useUnreadCount(signedIn);
  const { data: newFollowers = 0 } = useNewFollowerCount(signedIn);

  const username = usernameQuery.data?.username || session?.user?.username;
  const displayName =
    resumeQuery.data?.resume?.resumeData?.header?.name || session?.user?.name;
  const profilePath = username ? `/${username}` : null;

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  // The editor lives on your own profile page. From anywhere else, go there
  // first; the page opens the editor when it sees ?edit=.
  const openEditor = (tab: 'general' | 'settings') => {
    if (!profilePath) return;
    if (pathname === profilePath) {
      setActiveTab(tab);
      window.dispatchEvent(new CustomEvent('open-editor'));
    } else {
      router.push(`${profilePath}?edit=${tab}`);
    }
  };

  const copyLink = async () => {
    if (!username) return;
    try {
      await navigator.clipboard.writeText(`${SITE_URL}/${username}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy the link.');
    }
  };

  const items: RailItem[] = [
    {
      key: 'home',
      label: 'Home',
      icon: NewspaperIcon,
      href: '/',
      active: pathname === '/' || pathname === '/about',
    },
    ...(signedIn && profilePath
      ? [
          {
            key: 'profile',
            label: 'Profile',
            icon: UserIcon,
            href: profilePath,
            active: pathname === profilePath,
          },
        ]
      : []),
    {
      key: 'explore',
      label: 'Explore',
      hint: '⌘ E',
      icon: MagnifyingGlassIcon,
      href: '/explore',
      active: pathname.startsWith('/explore'),
    },
    ...(signedIn
      ? [
          {
            key: 'replies',
            label: 'Replies',
            icon: PaperPlaneTiltIcon,
            href: '/replies',
            active: pathname.startsWith('/replies'),
            badge:
              unreadReplies > 0
                ? `${unreadReplies} unread ${unreadReplies === 1 ? 'conversation' : 'conversations'}`
                : undefined,
          },
          {
            key: 'following',
            label: 'Following',
            icon: RssSimpleIcon,
            href: '/following',
            active: pathname.startsWith('/following'),
            badge:
              newFollowers > 0
                ? `${newFollowers} new ${newFollowers === 1 ? 'follower' : 'followers'}`
                : undefined,
          },
        ]
      : []),
  ];

  const initial = (displayName || username || '?').charAt(0).toUpperCase();

  return (
    <>
      <nav
        aria-label="Main"
        className="fixed bottom-0 left-0 z-50 flex h-14 w-full items-center justify-around border-t border-border-subtle bg-surface-1 md:inset-y-0 md:h-auto md:w-[60px] md:flex-col md:justify-between md:border-0 md:py-4 md:shadow-[1px_0_0_0_rgba(0,0,0,0.05)] dark:md:shadow-[1px_0_0_0_rgba(255,255,255,0.1)] print:hidden"
      >
        {/* Desktop: spacer so the icons sit in the middle. */}
        <div className="hidden md:block md:size-11" aria-hidden />

        <ul className="flex items-center gap-1 max-md:flex-1 max-md:justify-around md:flex-col md:gap-2">
          {items.map((item) => (
            <li key={item.key}>
              <RailButton item={item} />
            </li>
          ))}
        </ul>

        {signedIn ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Account menu"
                className="grid size-11 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Avatar className="size-8">
                  {session?.user?.image && (
                    <AvatarImage src={session.user.image} alt="" />
                  )}
                  <AvatarFallback className="bg-surface-3 text-sm text-content-secondary">
                    {initial}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="right"
              align="end"
              sideOffset={12}
              className="w-56 max-md:mb-2"
            >
              <div className="px-4 pb-2 pt-1">
                <div className="truncate text-sm text-content-primary">
                  {displayName}
                </div>
                {username && (
                  <div className="truncate text-[13px] text-content-muted">
                    @{username}
                  </div>
                )}
              </div>
              <div className="my-1 h-px bg-border-subtle" role="separator" />
              <DropdownMenuItem
                disabled={!profilePath}
                onSelect={() => openEditor('general')}
              >
                <PencilSimpleIcon className="mr-3 size-4" aria-hidden />
                Edit profile
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!profilePath}
                onSelect={() => openEditor('settings')}
              >
                <GearIcon className="mr-3 size-4" aria-hidden />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!username}
                onSelect={(event) => {
                  event.preventDefault();
                  copyLink();
                }}
              >
                {copied ? (
                  <CheckIcon className="mr-3 size-4" aria-hidden />
                ) : (
                  <LinkSimpleIcon className="mr-3 size-4" aria-hidden />
                )}
                {copied ? 'Copied' : 'Copy profile link'}
              </DropdownMenuItem>
              <div className="my-1 h-px bg-border-subtle" role="separator" />
              <DropdownMenuItem onSelect={() => signOut({ callbackUrl: '/' })}>
                <SignOutIcon className="mr-3 size-4" aria-hidden />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Account"
                className="grid size-11 place-items-center rounded-lg text-[#aaa] transition-colors hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-[#777] dark:hover:text-content-primary"
              >
                <UserIcon size={28} weight="light" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="right"
              align="end"
              sideOffset={12}
              className="w-48 max-md:mb-2"
            >
              <DropdownMenuItem onSelect={() => openAuth('login')}>
                Log in
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => openAuth('signup')}>
                Create a profile
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </nav>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} mode={authMode} />
    </>
  );
}
