import React from 'react';
import { Button } from '@/components/ui/button';

interface TabHeaderProps {
  title: string;
  showAddButton: boolean;
  onAdd: () => void;
  addButtonText?: string;
}

export function TabHeader({ title, showAddButton, onAdd, addButtonText = "Add item" }: TabHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between border-b border-border-subtle pb-4">
      <h2 className="text-2xl font-bold text-content-primary">{title}</h2>
      {showAddButton && (
        <Button
          onClick={onAdd}
          className="h-8 rounded-md border-none bg-surface-2 px-4 text-xs text-content-primary hover:bg-surface-3"
        >
          {addButtonText}
        </Button>
      )}
    </div>
  );
}
