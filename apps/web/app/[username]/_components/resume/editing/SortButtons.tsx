'use client';

import { ArrowLineUpIcon, ArrowLineDownIcon } from '@phosphor-icons/react/ssr';
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
                className="flex items-center gap-1 hover:underline hover:underline-offset-4 sm:transition-colors sm:hover:text-content-primary sm:hover:no-underline"
                aria-label="Move item up"
              >
                <ArrowLineUpIcon className="hidden h-[15px] w-[15px] sm:inline-block" />
                <span className="sm:hidden">Move up</span>
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              sideOffset={8}
              className="hidden sm:block"
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
                className="flex items-center gap-1 hover:underline hover:underline-offset-4 sm:transition-colors sm:hover:text-content-primary sm:hover:no-underline"
                aria-label="Move item down"
              >
                <ArrowLineDownIcon className="hidden h-[15px] w-[15px] sm:inline-block" />
                <span className="sm:hidden">Move down</span>
              </button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              sideOffset={8}
              className="hidden sm:block"
            >
              Move down
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  );
}
