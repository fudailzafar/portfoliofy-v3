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
  /** Label shown on the confirm button (default: "Delete") */
  confirmLabel?: string;
  /** Label shown while loading (default: "Deleting…") */
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
          <AlertDialogDescription className="text-sm text-gray-500 mt-2">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 flex gap-2 sm:justify-end">
          <AlertDialogCancel
            disabled={isLoading}
            className="rounded-md px-5 border border-gray-200 bg-white hover:bg-gray-50 h-9 text-sm font-medium text-gray-700 m-0"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-md px-5 bg-red-600 hover:bg-red-700 text-white h-9 text-sm font-medium border-none m-0"
          >
            {isLoading ? loadingLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
