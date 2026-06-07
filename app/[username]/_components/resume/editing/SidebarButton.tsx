import { cn } from '@/lib/utils';

interface SidebarButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function SidebarButton({
  label,
  isActive,
  onClick,
  disabled = false,
}: SidebarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'py-2.5 pl-10 pr-6 text-left text-sm transition-colors',
        isActive ? 'bg-surface-2 text-content-primary  ' : 'text-content-muted hover:text-content-primary hover:bg-surface-2  dark:hover:bg-surface-card ',
        disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent dark:hover:bg-transparent',
      )}
    >
      {label}
    </button>
  );
}
