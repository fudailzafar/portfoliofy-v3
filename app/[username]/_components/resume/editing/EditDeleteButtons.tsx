import React from 'react';

interface EditDeleteButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  children?: React.ReactNode;
}

export function EditDeleteButtons({
  onEdit,
  onDelete,
  children,
}: EditDeleteButtonsProps) {
  return (
    <div className="mt-3 flex items-center gap-4 text-xs font-medium text-content-muted">
      <button
        onClick={onEdit}
        className="transition-colors hover:text-content-primary"
      >
        Edit
      </button>
      <button
        onClick={onDelete}
        className="transition-colors hover:text-red-600"
      >
        Delete
      </button>
      {children}
    </div>
  );
}
