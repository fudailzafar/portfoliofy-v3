import { Lock } from 'lucide-react';
import {
  AttachmentSchemaType,
  estimateReadMinutes,
  isRedactedPage,
} from '@/lib/resume';

export function PageAttachmentCard({
  attachment,
}: {
  attachment: AttachmentSchemaType;
}) {
  const redacted = isRedactedPage(attachment);
  return (
    <div className="flex h-[90px] w-full max-w-[415px] shrink-0 overflow-hidden rounded-lg border border-theme-border bg-theme-border">
      <div className="flex h-full w-[152px] shrink-0 items-center justify-center overflow-hidden rounded-l-md border-none bg-black/5 dark:border dark:border-[#383838] dark:bg-[#222]">
        {redacted ? (
          <Lock aria-hidden="true" className="h-4 w-4 text-theme-muted" />
        ) : attachment.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={attachment.url}
            alt={attachment.title || 'Thumbnail'}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center px-3">
        <h4 className="line-clamp-1 text-sm text-theme-primary">
          {redacted ? 'This page is private' : attachment.title || 'Untitled'}
          {attachment.passwordProtected && !redacted && (
            <Lock
              aria-label="Password protected"
              className="relative -top-px ml-1.5 inline h-3.5 w-3.5 text-theme-muted"
            />
          )}
        </h4>
        <p className="text-sm text-theme-secondary">
          {redacted
            ? 'Enter password to view'
            : `${estimateReadMinutes(attachment.content || '')} min read`}
        </p>
      </div>
    </div>
  );
}
