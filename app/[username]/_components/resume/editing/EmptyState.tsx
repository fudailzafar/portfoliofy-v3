import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  buttonText: string;
  onClick: () => void;
}

export function EmptyState({ icon: Icon, buttonText, onClick }: EmptyStateProps) {
  return (
    <div className="mt-12 flex flex-1 flex-col items-center justify-center space-y-6 text-center opacity-80">
      <div className="rounded-full bg-surface-2 p-8">
        <Icon className="h-16 w-16 text-content-muted" strokeWidth={1} />
      </div>
      <Button
        variant="secondary"
        className="h-auto rounded-md border-none bg-surface-2 px-6 py-5 text-sm text-content-primary hover:bg-surface-3"
        onClick={onClick}
      >
        {buttonText}
      </Button>
    </div>
  );
}
