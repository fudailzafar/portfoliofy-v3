import React from 'react';
import { Button } from '@/components/ui/button';

interface TabFormActionsProps {
  onCancel: () => void;
  onSave: () => void;
  isSaveDisabled?: boolean;
  saveText?: string;
  cancelText?: string;
}

export function TabFormActions({
  onCancel,
  onSave,
  isSaveDisabled = false,
  saveText = 'Save',
  cancelText = 'Cancel',
}: TabFormActionsProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-end gap-3 border-t border-border-subtle bg-surface-1 p-4 md:px-8">
      <button
        onClick={onCancel}
        className="px-4 text-[14px] font-medium text-content-primary hover:underline hover:underline-offset-2"
      >
        {cancelText}
      </button>
      <Button
        onClick={onSave}
        disabled={isSaveDisabled}
        variant="outline"
        className="h-9 rounded-md border border-border-strong bg-surface-card px-6 font-medium text-content-primary shadow-sm"
      >
        {saveText}
      </Button>
    </div>
  );
}
