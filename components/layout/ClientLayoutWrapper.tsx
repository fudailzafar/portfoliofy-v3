'use client';

import React, { useContext, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { ExplorePanel } from '@/components/explore/ExplorePanel';
import { NavRail, RAIL_WIDTH } from './NavRail';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_PEEK,
  SIDEBAR_SLIDE,
  useSidebarStore,
} from '@/store/useSidebarStore';

// Keeps the page that is fading out rendering with the router state it had,
// not the one it is navigating to. Without this, App Router swaps the old
// page's content for the new page the moment you click, so the exit fade
// would show the wrong page.
function FrozenRouter({ children }: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext);
  const frozen = useRef(context).current;
  if (!frozen) return <>{children}</>;
  return (
    <LayoutRouterContext.Provider value={frozen}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

// The navigation is a slim rail down the left edge. "isOpen" in the sidebar
// store now means the Explore panel beside it is open; it slides out from
// behind the rail and pushes the page across.
export function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, setIsOpen, sidebarWidth, setSidebarWidth } =
    useSidebarStore();
  const pathname = usePathname();
  const router = useRouter();
  // The panel's contents are only mounted while it is open or sliding shut, so
  // a closed panel doesn't load people or grab focus.
  const [panelMounted, setPanelMounted] = useState(false);
  useEffect(() => {
    if (isOpen) setPanelMounted(true);
  }, [isOpen]);

  useEffect(() => {
    const updateWidth = () =>
      setSidebarWidth(
        Math.min(SIDEBAR_MAX_WIDTH, window.innerWidth - SIDEBAR_PEEK),
      );
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [setSidebarWidth]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl+E (or with Shift) opens Explore: the panel beside the page
      // on a computer, the Explore page on a phone.
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        if (window.innerWidth >= 768) {
          setIsOpen((open) => !open);
        } else {
          router.push('/explore');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, setIsOpen]);

  // Close Explore when navigating on a phone, where it covers the page.
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  }, [pathname, setIsOpen]);

  // Other fixed elements can follow the panel through this CSS variable.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty(
      '--sidebar-offset',
      isOpen ? `${sidebarWidth}px` : '0px',
    );
    root.style.setProperty('--rail-width', `${RAIL_WIDTH}px`);
  }, [isOpen, sidebarWidth]);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="relative flex min-h-screen w-full overflow-x-hidden bg-surface-1 font-sans">
        <NavRail />

        {/* The Explore panel sits behind the rail and slides out from it */}
        <motion.aside
          aria-label="Explore"
          aria-hidden={!isOpen}
          inert={!isOpen}
          initial={false}
          animate={{ x: isOpen ? 0 : -sidebarWidth }}
          transition={SIDEBAR_SLIDE}
          style={{ width: sidebarWidth }}
          className="fixed inset-y-0 left-0 z-0 hidden bg-surface-1 pl-[60px] shadow-[inset_-1px_0_0_0_rgba(0,0,0,0.05)] dark:shadow-[inset_-1px_0_0_0_rgba(255,255,255,0.1)] md:block print:hidden"
        >
          {panelMounted && <ExplorePanel onClose={() => setIsOpen(false)} />}
        </motion.aside>

        {/* Main content layer: clear of the rail, pushed over by the panel */}
        <motion.div
          animate={{ marginLeft: isOpen ? sidebarWidth : 0 }}
          initial={false}
          transition={SIDEBAR_SLIDE}
          className="relative z-10 flex min-h-screen min-w-0 flex-1 flex-col bg-surface-1 max-md:pb-14 md:pl-[60px] print:!ml-0 print:pb-0 print:pl-0 print:shadow-none"
        >
          {/* Old page fades out, then the new one fades in, like the original */}
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex min-h-screen min-w-0 flex-1 flex-col"
            >
              <FrozenRouter>{children}</FrozenRouter>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}
