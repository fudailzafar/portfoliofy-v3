'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { GlobalSidebar } from './GlobalSidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Listen for Cmd+E or Ctrl+E (without shift)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'e' && !e.shiftKey) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
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
    root.style.setProperty('--sidebar-offset', isOpen ? '260px' : '0px');
  }, [isOpen]);

  return (
    <TooltipProvider delayDuration={0}>
      <div className="relative min-h-screen bg-white w-full overflow-x-hidden flex font-sans">
        {/* Fixed Sidebar Underneath */}
        <div className="fixed top-0 left-0 h-full z-0 w-[260px]">
          <GlobalSidebar />
        </div>

        {/* Main Content Layer */}
        <motion.div
          animate={{
            x: isOpen ? 260 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
          className={`relative z-10 flex-1 flex flex-col min-h-screen bg-white ${isOpen ? 'shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.05)]' : ''}`}
        >
          {children}
        </motion.div>

        {/* Floating Menu Toggle Button */}
        <motion.div 
          className="fixed bottom-6 left-6 z-50 flex items-center gap-3"
          animate={{ x: isOpen ? 260 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="size-[48px] rounded-full bg-white border border-gray-200 shadow-sm flex flex-col items-center justify-center gap-1 outline-none transition-colors"
              >
                {/* 3 lines menu icon - exact match to reference */}
                <div className="flex flex-col gap-[5px]">
                  <div className="w-[18px] h-[1.5px] bg-[#111] rounded-full" />
                  <div className="w-[18px] h-[1.5px] bg-[#111] rounded-full" />
                  <div className="w-[12px] h-[1.5px] bg-[#111] rounded-full" />
                </div>
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={12} className="bg-[#111] text-white text-[13px] font-medium rounded-lg px-3 py-1.5 border-none shadow-md flex items-center gap-1.5">
              <span>Menu</span>
              <span className="opacity-60 text-[11px] font-mono tracking-tighter">⌘E</span>
            </TooltipContent>
          </Tooltip>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}
