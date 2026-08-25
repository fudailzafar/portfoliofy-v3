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
      <AlertDialogContent className="gap-4 border border-border-subtle p-6 font-sans dark:border-none dark:bg-surface-1 sm:max-w-sm">
        <AlertDialogHeader className="flex flex-col gap-1.5 space-y-0">
          <AlertDialogTitle className="text-left text-lg font-medium tracking-tight text-content-primary">
            Unsaved changes
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left text-[14px] leading-snug text-content-secondary">
            You have unsaved changes, leave anyway?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-3 flex !flex-row justify-end gap-2 space-x-0">
          <AlertDialogCancel className="m-0 border-none bg-surface-1 px-4 py-2 text-sm font-medium text-content-primary hover:bg-surface-1 hover:underline hover:underline-offset-4">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onLeaveAnyway}
            className="m-0 h-9 rounded-md border border-border-strong bg-surface-card px-6 text-sm font-medium text-content-primary shadow-sm active:bg-surface-2 dark:border-none dark:bg-border-subtle dark:active:bg-border-strong"
          >
            Okay
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
