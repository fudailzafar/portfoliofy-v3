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

export function SortableSidebarItem({ id, label, disabled, isActive, onClick }: SortableSidebarItemProps) {
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
        "flex justify-between items-center px-3 py-2 rounded-md text-sm transition-colors cursor-grab active:cursor-grabbing",
        isActive 
          ? "bg-gray-100 text-gray-900" 
          : "text-gray-500 hover:bg-gray-50",
        disabled && "opacity-50 hover:bg-transparent hover:text-gray-500",
        isDragging && "opacity-50 bg-gray-200"
      )}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Only trigger click if it's not disabled and we aren't dragging
        // The click is handled, but dnd-kit pointer sensor might interfere. 
        // We ensure onClick fires correctly using pointer down/up checks if needed, but standard onClick works fine usually.
        if (!disabled) {
          onClick();
        }
      }}
    >
      <span>{label}</span>
      <span className={cn("text-gray-300 font-bold", isDragging ? "cursor-grabbing" : "cursor-grab")}>=</span>
    </div>
  );
}
