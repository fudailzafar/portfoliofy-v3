'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ExploreSidebar } from './ExploreSidebar';
import { NavRail, RAIL_WIDTH } from './NavRail';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_PEEK,
  SIDEBAR_SLIDE,
  useSidebarStore,
} from '@/store/useSidebarStore';

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
      // Cmd/Ctrl+E or Cmd/Ctrl+Shift+E toggles Explore.
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsOpen]);

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
        <NavRail
          exploreOpen={isOpen}
          onToggleExplore={() => setIsOpen((prev) => !prev)}
        />

        {/* Explore panel, sliding out from behind the rail */}
        <motion.div
          className="fixed bottom-14 left-0 top-0 z-40 md:bottom-0 md:left-[60px] print:hidden"
          style={{ width: sidebarWidth }}
          initial={{ x: -sidebarWidth - RAIL_WIDTH }}
          animate={{ x: isOpen ? 0 : -sidebarWidth - RAIL_WIDTH }}
          transition={SIDEBAR_SLIDE}
          onAnimationComplete={() => {
            if (!isOpen) setPanelMounted(false);
          }}
          aria-hidden={!isOpen}
          inert={!isOpen}
        >
          {panelMounted && <ExploreSidebar onClose={() => setIsOpen(false)} />}
        </motion.div>

        {/* Click-away overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 z-30 bg-transparent"
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Main content layer: clear of the rail, pushed over by the panel */}
        <motion.div
          animate={{ x: isOpen ? sidebarWidth : 0 }}
          transition={SIDEBAR_SLIDE}
          className="relative z-10 flex min-h-screen min-w-0 flex-1 flex-col bg-surface-1 max-md:pb-14 md:pl-[60px] print:!transform-none print:pb-0 print:pl-0 print:shadow-none"
        >
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex min-h-screen min-w-0 flex-1 flex-col"
          >
            {children}
          </motion.div>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}
