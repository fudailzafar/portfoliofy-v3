'use client';

import { DotsThreeIcon } from '@phosphor-icons/react/ssr';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface ItemAction {
  label: string;
  onSelect: () => void;
}

export function ItemActionsMenu({ actions }: { actions: ItemAction[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="More actions"
        className="ml-auto flex items-center rounded-sm text-content-muted transition-colors hover:text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <DotsThreeIcon weight="bold" className="h-5 w-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => (
          <DropdownMenuItem key={action.label} onSelect={action.onSelect}>
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
