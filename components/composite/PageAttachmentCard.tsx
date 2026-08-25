import { AttachmentSchemaType, estimateReadMinutes } from '@/lib/resume';

export function PageAttachmentCard({
  attachment,
}: {
  attachment: AttachmentSchemaType;
}) {
  return (
    <div className="flex h-[90px] w-full max-w-[415px] shrink-0 overflow-hidden rounded-lg bg-theme-bg dark:bg-[#333]">
      <div className="h-full w-[152px] shrink-0 overflow-hidden rounded-l-lg border border-theme-border bg-black/5 dark:border-[#383838] dark:bg-[#222]">
        {attachment.url ? (
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
          {attachment.title || 'Untitled'}
        </h4>
        <p className="text-sm text-theme-secondary">
          {estimateReadMinutes(attachment.content || '')} min read
        </p>
      </div>
    </div>
  );
}
