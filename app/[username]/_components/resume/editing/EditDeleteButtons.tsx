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
    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-content-muted transition-opacity duration-200">
      {onToggleVisibility && (
        <button
          onClick={onToggleVisibility}
          className="grid items-center justify-items-start hover:underline hover:underline-offset-4"
        >
          <span className="col-start-1 row-start-1">{isHidden ? 'Show' : 'Hide'}</span>
          <span className="col-start-1 row-start-1 invisible" aria-hidden="true">Show</span>
          <span className="col-start-1 row-start-1 invisible" aria-hidden="true">Hide</span>
        </button>
      )}
      <button
        onClick={onEdit}
        className="hover:underline hover:underline-offset-4"
      >
        Edit
      </button>
      <button
        onClick={onDelete}
        className="hover:underline hover:underline-offset-4"
      >
        Delete
      </button>
      {children}
    </div>
  );
}
