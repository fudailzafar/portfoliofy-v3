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

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  description: string;
  onConfirm: () => void;
  isLoading?: boolean;
  confirmLabel?: string;
  loadingLabel?: string;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  description,
  onConfirm,
  isLoading = false,
  confirmLabel = 'Delete',
  loadingLabel = 'Deleting…',
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="gap-6 border border-border-subtle p-8 font-sans dark:bg-surface-1 sm:max-w-sm">
        <AlertDialogHeader className="flex flex-col gap-1.5 space-y-0">
          <AlertDialogTitle className="text-left text-lg font-medium tracking-tight text-content-primary">
            Are you sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left text-[14px] leading-snug text-content-secondary">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-5 flex !flex-row justify-end gap-2 space-x-0">
          <AlertDialogCancel
            disabled={isLoading}
            className="border-none bg-surface-1 px-4 py-2 text-sm font-medium text-content-primary hover:bg-surface-1 hover:underline hover:underline-offset-4"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="w-[120px] shrink-0 border-red-200 bg-red-50 text-red-600 transition-colors active:bg-red-100 active:text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-400 dark:active:border-red-800 dark:active:bg-red-900/40 dark:active:text-red-300"
          >
            {isLoading ? loadingLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
