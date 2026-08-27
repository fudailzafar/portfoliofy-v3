'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { AttachmentSchemaType, estimateReadMinutes } from '@/lib/resume';
import { Check, PencilIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttachPagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Every page on the resume — filtered down to published ones below, since
  // only those are eligible to attach to an experience.
  pages: AttachmentSchemaType[];
  attachedPageIds: string[];
  onSave: (pageIds: string[]) => void;
}

// Opened from "Add a page" on any section item. Creating/editing a page's
// actual content happens only in the Writing tab — this dialog just lets
// you pick one or more already-published pages to attach here.
export function AttachPagesDialog({
  open,
  onOpenChange,
  pages,
  attachedPageIds,
  onSave,
}: AttachPagesDialogProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) setSelected(new Set(attachedPageIds));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const publishedPages = pages.filter((p) => !p.hidden);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    onSave(Array.from(selected));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[600px] flex-col overflow-hidden border-border-strong bg-surface-1 p-0 text-content-primary sm:max-w-lg [&>button]:hidden">
        <div className="flex-1 overflow-hidden p-6 pb-0">
          <DialogTitle>Select pages</DialogTitle>
          <DialogDescription className="mt-3">
            Select 1 or more pages to attach to this experience. To create or
            manage pages, visit the{' '}
            <PencilIcon
              size={15}
              className="mx-1 inline text-content-primary"
            />
            <span className="text-content-primary">writing tab</span> in the
            profile editor.
          </DialogDescription>

          {publishedPages.length === 0 ? (
            <div className="mt-4 flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border-strong py-10 text-center">
              <p className="text-sm text-content-primary">
                No published pages yet
              </p>
              <p className="text-xs text-content-muted">
                Create and publish a page from the Writing tab first.
              </p>
            </div>
          ) : (
            <div className="scrollbar-hide -mx-6 mt-2 flex h-full flex-col overflow-y-auto px-6 pb-6">
              {publishedPages.map((page) => {
                const isSelected = selected.has(page.id);
                return (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => toggle(page.id)}
                    className="flex w-full items-center gap-7 py-2.5 text-left outline-none"
                  >
                    <span
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded-sm',
                        isSelected ? 'bg-blue-600 text-white' : 'bg-surface-3',
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-content-primary">
                        {page.title || 'Untitled'}
                      </span>
                      <span className="text-sm text-content-muted">
                        {estimateReadMinutes(page.content || '')} min read
                      </span>
                    </span>
                    {page.url && (
                      <span className="h-16 w-24 flex-shrink-0 overflow-hidden rounded bg-surface-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={page.url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-border-subtle px-6 py-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 text-sm font-medium text-content-primary hover:underline hover:underline-offset-4"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-9 rounded-md border border-border-strong bg-surface-1 px-6 text-[14px] font-medium text-content-primary shadow-sm transition-all active:bg-surface-2 dark:border-none dark:bg-border-subtle dark:active:bg-border-strong"
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
