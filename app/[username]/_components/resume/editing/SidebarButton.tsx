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
        'pl-10 pr-6 py-2.5 text-left text-sm transition-colors',
        isActive
          ? 'bg-gray-100 text-black'
          : 'text-gray-500 hover:bg-gray-50',
        disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent',
      )}
    >
      {label}
    </button>
  );
}
