import { ChevronLeft } from 'lucide-react';

interface TabHeaderProps {
  title: string;
  showAddButton: boolean;
  onAdd: () => void;
  addButtonText?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function TabHeader({
  title,
  showAddButton,
  onAdd,
  addButtonText = 'Add item',
  showBackButton = false,
  onBack,
}: TabHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between border-b border-border-subtle pb-4">
      <div className="flex items-center gap-2">
        {showBackButton && (
          <button
            onClick={onBack}
            aria-label="Back"
            className="-ml-1.5 flex h-8 w-8 items-center justify-center rounded-md text-content-secondary transition-colors hover:bg-surface-2 hover:text-content-primary"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <h2 className="text-xl font-bold text-content-primary sm:text-2xl">
          {title}
        </h2>
      </div>
      {showAddButton && (
        <button
          onClick={onAdd}
          className="inline-flex h-8 items-center justify-center rounded-md border border-border-strong bg-surface-card px-4 text-[13px] font-medium text-content-primary shadow-sm transition-all active:bg-surface-2 dark:border-none dark:bg-border-subtle dark:active:bg-border-strong"
        >
          {addButtonText}
        </button>
      )}
    </div>
  );
}
