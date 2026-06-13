import React from 'react';

interface EditDeleteButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisibility?: () => void;
  isHidden?: boolean;
  children?: React.ReactNode;
}

export function EditDeleteButtons({
  onEdit,
  onDelete,
  onToggleVisibility,
  isHidden = false,
  children,
}: EditDeleteButtonsProps) {
  return (
    <div className="mt-3 flex items-center gap-4 text-xs text-content-muted transition-opacity duration-200">
      {onToggleVisibility && (
        <button
          onClick={onToggleVisibility}
          className="w-9 text-left transition-colors hover:text-content-primary hover:underline hover:underline-offset-4"
        >
          {isHidden ? 'Show' : 'Hide'}
        </button>
      )}
      <button
        onClick={onEdit}
        className="transition-colors hover:text-content-primary hover:underline hover:underline-offset-4"
      >
        Edit
      </button>
      <button
        onClick={onDelete}
        className="transition-colors hover:text-red-600 hover:underline hover:underline-offset-4"
      >
        Delete
      </button>
      {children}
    </div>
  );
}
