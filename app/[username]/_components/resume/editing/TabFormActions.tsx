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
    <div className="absolute bottom-0 left-0 right-0 z-10 bg-surface-1 px-4 pb-4 sm:px-8 md:px-12 md:pb-6">
      <div className="flex w-full justify-end gap-3 border-t border-border-subtle pt-4">
        <button
          onClick={onCancel}
          className="px-4 text-[14px] font-medium text-content-primary hover:underline hover:underline-offset-4"
        >
          {cancelText}
        </button>
        <Button
          onClick={onSave}
          disabled={isSaveDisabled}
          className="h-9 rounded-md border border-border-strong bg-surface-card px-6 font-medium text-content-primary shadow-sm hover:bg-surface-card active:bg-surface-3 dark:border-none dark:bg-border-subtle dark:active:bg-border-strong"
        >
          {saveText}
        </Button>
      </div>
    </div>
  );
}
