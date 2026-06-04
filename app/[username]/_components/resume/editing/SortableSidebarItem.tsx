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
        'flex cursor-pointer items-center justify-between py-2.5 pl-10 pr-6 text-sm transition-colors',
        isActive
          ? 'bg-gray-100 text-black'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
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
          'flex flex-col gap-[4px] p-2 opacity-50 transition-opacity hover:opacity-100',
          isDragging ? 'cursor-grabbing opacity-100' : 'cursor-grab',
        )}
        {...attributes}
        {...listeners}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="h-[2px] w-3.5 rounded-full bg-gray-400" />
        <div className="h-[2px] w-3.5 rounded-full bg-gray-400" />
      </div>
    </div>
  );
}
