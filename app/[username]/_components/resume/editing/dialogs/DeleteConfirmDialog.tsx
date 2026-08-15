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
      <AlertDialogContent className="max-w-[320px] rounded-xl p-5">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-left text-lg font-bold text-content-primary">
            Are you sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-1.5 text-left text-sm text-content-muted">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-5 flex !flex-row justify-end gap-2 space-x-0">
          <AlertDialogCancel
            disabled={isLoading}
            className="m-0 h-8 rounded-md border border-border-strong bg-surface-card px-4 text-xs font-medium text-content-secondary hover:bg-surface-3"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="m-0 h-8 rounded-md border-none bg-action-danger px-4 text-xs font-medium text-surface-1 hover:bg-red-700 dark:text-white dark:hover:bg-red-600"
          >
            {isLoading ? loadingLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
