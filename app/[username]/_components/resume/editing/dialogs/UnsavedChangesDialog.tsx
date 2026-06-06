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
          <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Unsaved changes
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            You have unsaved changes, leave anyway?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 flex gap-2 sm:justify-end">
          <AlertDialogCancel className="m-0 h-9 rounded-md border border-gray-200 bg-white px-5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-[#333] dark:bg-[#1f1f1f] dark:text-gray-200 dark:hover:bg-[#2c2c2c]">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onLeaveAnyway}
            className="m-0 h-9 rounded-md border-none bg-gray-900 px-5 text-sm font-medium text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Leave anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
