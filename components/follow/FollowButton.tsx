'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SIDEBAR_SLIDE, useSidebarStore } from '@/store/useSidebarStore';
import { cn } from '@/lib/utils';
import { FOLLOW_KEYS, followsApi } from './useFollows';

const PARTICLES = [
  { x: -20, y: 100, duration: 0.2, scale: 0.5 },
  { x: -35, y: 50, duration: 0.4, scale: 0.4 },
  { x: -45, y: 75, duration: 0.1, scale: 0.6 },
  { x: -62, y: 150, duration: 0.5, scale: 0.8 },
  { x: -75, y: 65, duration: 0.25, scale: 0.7 },
  { x: -95, y: 35, duration: 0.15, scale: 0.9 },
  { x: -100, y: 20, duration: 0.2, scale: 1 },
  { x: -160, y: 5, duration: 0.23, scale: 0.9 },
  { x: -90, y: -15, duration: 0.13, scale: 0.5 },
  { x: -60, y: -32, duration: 0.16, scale: 0.7 },
  { x: -100, y: -46, duration: 0.32, scale: 0.6 },
  { x: -15, y: -90, duration: 0.12, scale: 0.8 },
  { x: -2, y: -40, duration: 0.05, scale: 0.9 },
  { x: 12, y: -30, duration: 0.08, scale: 0.8 },
  { x: 24, y: 14, duration: 0.24, scale: 0.6 },
  { x: 44, y: 60, duration: 0.15, scale: 0.5 },
  { x: 64, y: 120, duration: 0.17, scale: 0.9 },
  { x: 80, y: 32, duration: 0.16, scale: 1 },
  { x: 140, y: 12, duration: 0.42, scale: 0.9 },
  { x: 160, y: 12, duration: 0.33, scale: 0.5 },
];
const PARTICLE_EASE = [0.33, 1, 0.68, 1] as const;
const BLUE = '#0788f5';

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
  const [burst, setBurst] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!burst) return;
    const timer = setTimeout(() => setBurst(false), 10);
    return () => clearTimeout(timer);
  }, [burst]);

  const toggle = async () => {
    if (pending) return;
    const next = !following;
    setFollowing(next); // show it straight away
    if (next) setBurst(true);
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
    }
  };

  if (!mounted) return null;

  return createPortal(
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={false}
        animate={{ x: isSidebarOpen ? sidebarWidth : 0 }}
        transition={SIDEBAR_SLIDE}
        style={{ position: 'fixed', zIndex: 50 }}
        className="bottom-[86px] left-6 w-fit md:bottom-[14px] md:left-[80px] print:hidden"
      >
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={toggle}
          aria-pressed={following}
          aria-label={following ? `Unfollow ${username}` : `Follow ${username}`}
          className="relative z-[2] flex h-12 items-center justify-center rounded-full border border-border-strong bg-surface-1 px-[18px] text-[14px] font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1 dark:border-none dark:bg-[#333]"
        >
          {/* Holds the button at the width of "Following". */}
          <span className="invisible" aria-hidden>
            Following
          </span>
          <span className="absolute inset-0 flex items-center justify-center text-content-primary">
            {following ? 'Following' : 'Follow'}
          </span>
        </motion.button>

        <AnimatePresence>
          {burst && (
            <motion.div
              key="burst"
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ rotate: 180, transformOrigin: 'center' }}
            >
              {PARTICLES.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, scale: p.scale / 2, opacity: p.scale }}
                  exit={{
                    x: p.x,
                    y: p.y,
                    scale: [p.scale / 2, (p.scale / 2) * 1.2, 0],
                    opacity: [p.scale / 2, (p.scale / 2) * 1.2, 0],
                  }}
                  transition={{ duration: 2 * p.duration, ease: PARTICLE_EASE }}
                  className="absolute left-1/2 top-1/2 z-[1] -ml-1.5 -mt-1.5 size-3 rounded-[10px]"
                  style={{ backgroundColor: BLUE }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </MotionConfig>,
    document.body,
  );
}
