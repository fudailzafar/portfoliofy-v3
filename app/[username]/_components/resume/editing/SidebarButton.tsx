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
        isActive ? 'bg-gray-100 text-black dark:bg-[#1f1f1f] dark:text-gray-200' : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-[#1f1f1f] dark:hover:text-gray-200',
        disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent dark:hover:bg-transparent',
      )}
    >
      {label}
    </button>
  );
}
