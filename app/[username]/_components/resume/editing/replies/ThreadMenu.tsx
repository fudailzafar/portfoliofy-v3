'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DotsThreeIcon } from '@/components/icons/readcv';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { REPORT_REASONS, type ReportReason } from '@/lib/replies';
import { cn } from '@/lib/utils';
import {
  useBlockPerson,
  useHideConversation,
  useReportPerson,
} from './useReplies';
import { displayName } from './format';
import type { ThreadData } from './api';

const REASON_LABELS: Record<ReportReason, string> = {
  spam: 'Spam',
  harassment: 'Harassment or bullying',
  inappropriate: 'Inappropriate content',
  impersonation: 'Pretending to be someone else',
  other: 'Something else',
};

function ReportDialog({
  open,
  onOpenChange,
  conversationId,
  messageId,
  name,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  messageId?: number;
  name: string;
}) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const report = useReportPerson();

  const submit = () => {
    if (!reason) return;
    report.mutate(
      {
        conversationId,
        messageId,
        reason,
        details: details.trim() || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setReason(null);
          setDetails('');
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Report {name}</DialogTitle>
          <DialogDescription>
            Only we see your report. {name} isn’t told.
          </DialogDescription>
        </DialogHeader>

        <fieldset className="space-y-1">
          <legend className="sr-only">Reason</legend>
          {REPORT_REASONS.map((value) => (
            <label
              key={value}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-content-primary transition-colors hover:bg-surface-2 dark:hover:bg-surface-card',
                reason === value && 'bg-surface-2 dark:bg-surface-card',
              )}
            >
              <input
                type="radio"
                name="report-reason"
                value={value}
                checked={reason === value}
                onChange={() => setReason(value)}
                className="size-4 accent-current"
              />
              {REASON_LABELS[value]}
            </label>
          ))}
        </fieldset>

        <textarea
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          maxLength={1000}
          rows={3}
          placeholder="Anything else we should know? (optional)"
          aria-label="Details"
          className="w-full resize-none rounded-lg bg-surface-2 px-3 py-2.5 text-base text-content-primary placeholder:text-content-muted focus:outline-none dark:bg-surface-card sm:text-sm"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 text-[14px] font-medium text-content-primary hover:underline hover:underline-offset-4"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!reason || report.isPending}
            className="grid h-9 place-items-center rounded-md border border-border-strong bg-surface-1 px-6 text-[14px] font-medium text-content-primary shadow-sm transition-all active:bg-surface-2 disabled:opacity-50 dark:border-none dark:bg-border-subtle dark:active:bg-border-strong"
          >
            <span
              className={`[grid-area:1/1] ${report.isPending ? 'invisible' : ''}`}
            >
              Send report
            </span>
            {report.isPending && (
              <Spinner size={14} className="[grid-area:1/1]" />
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** The ⋯ menu in a conversation header. */
export function ThreadMenu({
  conversationId,
  thread,
  onHidden,
}: {
  conversationId: string;
  thread: ThreadData;
  onHidden: () => void;
}) {
  const [reportOpen, setReportOpen] = useState(false);
  const block = useBlockPerson(conversationId);
  const hide = useHideConversation(onHidden);
  const name = displayName(thread.other);

  // Their latest message, so a report points at something concrete.
  const lastFromThem = [...thread.messages].reverse().find((m) => !m.mine);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="Conversation options"
            className="flex size-9 items-center justify-center rounded-full text-content-muted transition-colors hover:text-content-primary"
          >
            <DotsThreeIcon className="size-6" weight="bold" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem asChild>
            <Link href={`/${thread.other.username}`} target="_blank">
              View profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setReportOpen(true)}>
            Report…
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() =>
              block.mutate({
                username: thread.other.username,
                blocked: !thread.blockedByYou,
              })
            }
          >
            {thread.blockedByYou ? 'Unblock' : 'Block'}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => hide.mutate(conversationId)}>
            Remove from my inbox
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        conversationId={conversationId}
        messageId={lastFromThem?.id}
        name={name}
      />
    </>
  );
}
