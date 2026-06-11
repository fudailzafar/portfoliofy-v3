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
      <AlertDialogContent className="max-w-sm rounded-xl p-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-content-primary">
            Unsaved changes
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-2 text-sm text-content-muted">
            You have unsaved changes, leave anyway?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 flex gap-2 sm:justify-end">
          <AlertDialogCancel className="m-0 h-9 rounded-md border border-border-strong bg-surface-card px-5 text-sm font-medium text-content-secondary hover:bg-surface-3">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onLeaveAnyway}
            className="m-0 h-9 rounded-md border-none bg-action-primary px-5 text-sm font-medium text-surface-1 hover:bg-action-primary dark:text-action-primary-hover dark:hover:bg-surface-3"
          >
            Okay
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
