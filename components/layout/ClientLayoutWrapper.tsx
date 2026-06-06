'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { GlobalSidebar } from './GlobalSidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

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
  }, []);

  // Auto-close sidebar on mobile when navigating
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  }, [pathname]);

  // Expose sidebar state via CSS variable so other fixed elements (like edit button) can follow
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--sidebar-offset', isOpen ? '330px' : '0px');
  }, [isOpen]);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="relative flex min-h-screen w-full overflow-x-hidden bg-surface-1 font-sans">
        {/* Fixed Sidebar Underneath */}
        <div className="fixed left-0 top-0 z-0 h-full w-[330px] print:hidden">
          <GlobalSidebar />
        </div>

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
          {children}
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
                className="flex size-[50px] flex-col items-center justify-center gap-1 rounded-full border border-border-strong bg-surface-1 shadow-[0_2px_10px_rgba(0,0,0,0.05)] outline-none transition-colors"
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
