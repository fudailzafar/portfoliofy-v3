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
      <AlertDialogContent className="gap-4 border border-border-subtle p-6 font-sans dark:border-none dark:bg-surface-1 sm:max-w-sm">
        <AlertDialogHeader className="flex flex-col gap-1.5 space-y-0">
          <AlertDialogTitle className="text-left text-lg font-medium tracking-tight text-content-primary">
            Are you sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left text-[14px] leading-snug text-content-secondary">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-3 flex !flex-row justify-end gap-2 space-x-0">
          <AlertDialogCancel
            disabled={isLoading}
            className="border-none bg-surface-1 px-4 py-2 text-sm font-medium text-content-primary hover:bg-surface-1 hover:underline hover:underline-offset-4"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="h-9 whitespace-nowrap rounded-md border border-border-strong bg-surface-card px-4 text-[13px] font-medium text-content-primary shadow-sm transition-all active:bg-surface-2 dark:border-none dark:bg-border-subtle dark:text-red-600 dark:active:bg-border-strong"
          >
            {isLoading ? loadingLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
