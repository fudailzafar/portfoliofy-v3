'use client';

import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { motion } from 'framer-motion';
import { PencilSimpleIcon } from '@phosphor-icons/react/ssr';
import { SIDEBAR_SLIDE, useSidebarStore } from '@/store/useSidebarStore';
import { cn } from '@/lib/utils';

// Rail: 16px bottom padding + a 44px avatar button = centre 38px up.
// This 48px pill sits 14px up, so its centre is at 38px too.
export const CORNER_PILL_POSITION =
  'bottom-[86px] left-6 md:bottom-[14px] md:left-[80px]';

export const CORNER_PILL_CLASS =
  'flex h-12 items-center justify-center gap-2 rounded-full border border-border-strong bg-surface-1 px-[18px] text-[14px] font-medium text-content-primary shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1 dark:border-none dark:bg-[#333]';

type Props = Omit<
  ComponentPropsWithoutRef<typeof motion.button>,
  'children'
> & {
  label: string;
};

export const EditFab = forwardRef<HTMLButtonElement, Props>(function EditFab(
  { label, className, ...rest },
  ref,
) {
  const { isOpen: isSidebarOpen, sidebarWidth } = useSidebarStore();
  return (
    <motion.button
      ref={ref}
      type="button"
      initial={false}
      animate={{ x: isSidebarOpen ? sidebarWidth : 0 }}
      transition={SIDEBAR_SLIDE}
      whileTap={{ scale: 0.9 }}
      style={{ position: 'fixed', zIndex: 50 }}
      className={cn(
        CORNER_PILL_POSITION,
        CORNER_PILL_CLASS,
        'print:hidden',
        className,
      )}
      {...rest}
    >
      <PencilSimpleIcon className="size-[18px]" aria-hidden />
      {label}
    </motion.button>
  );
});
