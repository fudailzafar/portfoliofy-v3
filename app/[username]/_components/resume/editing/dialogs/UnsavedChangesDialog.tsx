'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface UnsavedChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLeaveAnyway: () => void;
}

export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onLeaveAnyway,
}: UnsavedChangesDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="gap-6 border-none p-8 font-sans dark:bg-surface-1 sm:max-w-sm">
        <AlertDialogHeader className="flex flex-col gap-1.5 space-y-0">
          <AlertDialogTitle className="text-left text-lg font-medium tracking-tight text-content-primary">
            Unsaved changes
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left text-[14px] leading-snug text-content-secondary">
            You have unsaved changes, leave anyway?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-5 flex !flex-row justify-end gap-2 space-x-0">
          <AlertDialogCancel className="m-0 h-8 rounded-md border border-border-strong bg-surface-card px-4 text-xs font-medium text-content-secondary hover:bg-surface-3">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onLeaveAnyway}
            className="m-0 h-8 rounded-md border-none bg-action-primary px-4 text-xs font-medium text-surface-1 hover:bg-action-primary hover:text-surface-2 dark:text-surface-1 dark:hover:bg-action-primary dark:hover:text-surface-2"
          >
            Okay
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
