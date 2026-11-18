'use client';

// The Follow pill on someone else's profile. It sits where the owner sees the
// Edit profile button, bottom left beside the sidebar, as on read.cv.

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SIDEBAR_SLIDE, useSidebarStore } from '@/store/useSidebarStore';
import { FOLLOW_KEYS, followsApi } from './useFollows';

export function FollowButton({
  username,
  initialFollowing,
}: {
  username: string;
  initialFollowing: boolean;
}) {
  const queryClient = useQueryClient();
  const { isOpen: isSidebarOpen, sidebarWidth } = useSidebarStore();
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, setPending] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggle = async () => {
    const next = !following;
    setFollowing(next); // show it straight away
    setPending(true);
    try {
      await followsApi.set(username, next);
      queryClient.invalidateQueries({ queryKey: FOLLOW_KEYS.overview });
    } catch (error) {
      setFollowing(!next);
      toast.error(
        error instanceof Error ? error.message : 'Something went wrong.',
      );
    } finally {
      setPending(false);
      setHovered(false);
    }
  };

  if (!mounted) return null;

  const label = following ? (hovered ? 'Unfollow' : 'Following') : 'Follow';

  return createPortal(
    <motion.button
      type="button"
      initial={false}
      animate={{ x: isSidebarOpen ? sidebarWidth : 0 }}
      transition={SIDEBAR_SLIDE}
      whileTap={{ scale: 0.95 }}
      onClick={toggle}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      disabled={pending}
      aria-pressed={following}
      aria-label={following ? `Unfollow ${username}` : `Follow ${username}`}
      style={{ position: 'fixed', zIndex: 50 }}
      className="bottom-[86px] left-6 flex h-12 min-w-[104px] items-center justify-center rounded-full border border-border-strong bg-surface-1 px-6 text-[14px] text-content-primary shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1 dark:border-none dark:bg-[#333] md:bottom-[30px] md:left-[80px] print:hidden"
    >
      {label}
    </motion.button>,
    document.body,
  );
}
