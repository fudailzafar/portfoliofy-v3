'use client';

import { ArrowUpToLine, ArrowDownToLine } from 'lucide-react';
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
                className="transition-colors hover:text-content-primary"
                aria-label="Move item up"
              >
                <ArrowUpToLine className="h-[15px] w-[15px]" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="-[#333] mb-1 rounded-md border-none bg-action-primary px-2.5 py-1.5 text-xs font-medium text-surface-1 dark:border"
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
                className="transition-colors hover:text-content-primary"
                aria-label="Move item down"
              >
                <ArrowDownToLine className="h-[15px] w-[15px]" />
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="-[#333] mb-1 rounded-md border-none bg-action-primary px-2.5 py-1.5 text-xs font-medium text-surface-1 dark:border"
            >
              Move down
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  );
}
