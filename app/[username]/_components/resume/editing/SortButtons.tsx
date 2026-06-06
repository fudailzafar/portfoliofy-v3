'use client';

import { Upload, Download } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SortButtonsProps {
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function SortButtons({
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
}: SortButtonsProps) {
  return (
    <>
      {canMoveUp && (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onMoveUp}
                className="transition-colors hover:text-gray-900 dark:hover:text-gray-200"
              >
                <Upload className="h-[15px] w-[15px]" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="mb-1 rounded-md border-none bg-[#111] px-2.5 py-1.5 text-xs font-medium text-white dark:border dark:border-[#333] dark:bg-[#1f1f1f] dark:text-gray-200"
            >
              Move up
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {canMoveDown && (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onMoveDown}
                className="transition-colors hover:text-gray-900 dark:hover:text-gray-200"
              >
                <Download className="h-[15px] w-[15px]" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="mb-1 rounded-md border-none bg-[#111] px-2.5 py-1.5 text-xs font-medium text-white dark:border dark:border-[#333] dark:bg-[#1f1f1f] dark:text-gray-200"
            >
              Move down
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  );
}
