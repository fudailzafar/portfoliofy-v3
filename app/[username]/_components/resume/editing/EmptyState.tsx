import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  buttonText: string;
  onClick: () => void;
}

export function EmptyState({
  icon: Icon,
  buttonText,
  onClick,
}: EmptyStateProps) {
  return (
    <div className="mt-12 flex flex-1 flex-col items-center justify-center space-y-6 text-center opacity-80">
      <div className="rounded-full bg-surface-2 p-8 dark:border-none dark:bg-border-subtle">
        <Icon className="h-16 w-16 text-content-muted" strokeWidth={1} />
      </div>
      <Button
        className="h-8 items-center justify-center rounded-md border border-border-strong bg-surface-card px-4 text-[13px] font-medium text-content-primary shadow-sm transition-all active:bg-surface-2 dark:border-none dark:bg-border-subtle dark:active:bg-border-strong"
        onClick={onClick}
      >
        {buttonText}
      </Button>
    </div>
  );
}
