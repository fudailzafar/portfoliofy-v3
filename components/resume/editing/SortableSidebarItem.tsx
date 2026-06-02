import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface SortableSidebarItemProps {
  id: string;
  label: string;
  disabled?: boolean;
  isActive: boolean;
  onClick: () => void;
}

export function SortableSidebarItem({
  id,
  label,
  disabled,
  isActive,
  onClick,
}: SortableSidebarItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
        isActive
          ? 'bg-gray-100 text-gray-900'
          : 'text-gray-500 hover:bg-gray-50',
        disabled && 'opacity-50 hover:bg-transparent hover:text-gray-500',
        isDragging && 'bg-gray-200 opacity-50',
      )}
      onClick={() => {
        if (!disabled) {
          onClick();
        }
      }}
    >
      <span>{label}</span>
      <div
        className={cn(
          'flex items-center justify-center px-2 py-1 font-bold text-gray-300',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
        )}
        {...attributes}
        {...listeners}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        =
      </div>
    </div>
  );
}
