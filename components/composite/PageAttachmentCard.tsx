import { AttachmentSchemaType, estimateReadMinutes } from '@/lib/resume';
import { cn } from '@/lib/utils';

// The visual content of a page-type attachment's card — thumbnail + title +
// reading time — shared by AttachmentsPreview (list view / public page) and
// SectionAttachments (the item's edit form), so the two can't drift apart
// again. Callers own the outer clickable wrapper (button vs. relative div
// with overlay controls) and just size it to match: h-[90px] w-[415px].
export function PageAttachmentCard({
  attachment,
  variant = 'public',
}: {
  attachment: AttachmentSchemaType;
  variant?: 'public' | 'editor';
}) {
  const isEditor = variant === 'editor';

  return (
    <>
      <div
        className={cn(
          'h-full w-[152px] shrink-0 overflow-hidden rounded-l-[8px] border-r',
          isEditor
            ? 'border-border-strong bg-surface-2'
            : 'bg-theme-border/40 border-theme-border',
        )}
      >
        {attachment.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={attachment.url}
            alt={attachment.title || 'Thumbnail'}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center pr-3">
        <h4
          className={cn(
            'line-clamp-1 text-sm',
            isEditor ? 'text-content-primary' : 'text-theme-primary',
          )}
        >
          {attachment.title || 'Untitled'}
        </h4>
        <p
          className={cn(
            'text-sm',
            isEditor ? 'text-content-secondary' : 'text-theme-secondary',
          )}
        >
          {estimateReadMinutes(attachment.content || '')} min read
        </p>
      </div>
    </>
  );
}
