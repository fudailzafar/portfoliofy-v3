'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { GlobalSidebar } from './GlobalSidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSidebarStore } from '@/store/useSidebarStore';

export function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, setIsOpen } = useSidebarStore();
  const pathname = usePathname();

  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('Service Worker registration failed:', err);
      });
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Listen for Cmd+E or Ctrl+E
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        if (e.shiftKey) {
          setIsOpen(true);
          window.dispatchEvent(new CustomEvent('toggleExploreMode'));
        } else {
          setIsOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsOpen]);

  // Auto-close sidebar on mobile when navigating
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  }, [pathname, setIsOpen]);

  // Expose sidebar state via CSS variable so other fixed elements (like edit button) can follow
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--sidebar-offset', isOpen ? '330px' : '0px');
  }, [isOpen]);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="relative flex min-h-screen w-full overflow-x-hidden bg-surface-1 font-sans">
        {/* Sliding Sidebar */}
        <motion.div
          className="fixed left-0 top-0 z-40 h-full w-[330px] print:hidden"
          initial={{ x: -330 }}
          animate={{ x: isOpen ? 0 : -330 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <GlobalSidebar />
        </motion.div>

        {/* Main Content Layer */}
        <motion.div
          animate={{
            x: isOpen ? 330 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
          className="relative z-10 flex min-h-screen flex-1 flex-col bg-surface-1 print:!transform-none print:shadow-none"
        >
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex min-h-screen flex-1 flex-col"
          >
            {children}
          </motion.div>
        </motion.div>

        {/* Floating Menu Toggle Button */}
        <motion.div
          className="fixed bottom-6 left-6 z-50 flex items-center gap-3 print:hidden"
          animate={{ x: isOpen ? 330 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <Tooltip>
            <TooltipTrigger asChild className="print:hidden">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Menu"
                className="flex size-[50px] flex-col items-center justify-center gap-1 rounded-full border border-border-strong bg-surface-1 shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1"
              >
                {/* 3 lines menu icon */}
                <div className="flex flex-col gap-[5px]">
                  <div className="h-[1.5px] w-[20px] rounded-full bg-content-primary" />
                  <div className="h-[1.5px] w-[20px] rounded-full bg-content-primary" />
                  <div className="h-[1.5px] w-[14px] rounded-full bg-content-primary" />
                </div>
              </motion.button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              sideOffset={12}
              className="flex items-center gap-1.5 rounded-lg border-none bg-action-primary px-3 py-1.5 text-[13px] font-medium text-surface-1 shadow-md"
            >
              <span>Menu</span>
              <span className="text-[11px] tracking-tighter opacity-60">
                ⌘E
              </span>
            </TooltipContent>
          </Tooltip>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}
