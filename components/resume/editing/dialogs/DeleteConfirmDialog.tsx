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
      <AlertDialogContent className="max-w-sm rounded-xl p-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-gray-900">
            Are you sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-2 text-sm text-gray-500">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 flex gap-2 sm:justify-end">
          <AlertDialogCancel
            disabled={isLoading}
            className="m-0 h-9 rounded-md border border-gray-200 bg-white px-5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="m-0 h-9 rounded-md border-none bg-red-600 px-5 text-sm font-medium text-white hover:bg-red-700"
          >
            {isLoading ? loadingLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
