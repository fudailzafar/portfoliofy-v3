import React from 'react';

export interface PrintListItemProps {
  leftContent: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  location?: React.ReactNode;
  description?: string;
}

/**
 * One item in the printed profile, as read.cv prints it: the date column is
 * sized by the widest range it could hold ("0000 — 0000") with a 36px gap,
 * and an item never splits across a page. Links, attachments and collaborators
 * are not printed.
 */
export function PrintListItem({
  leftContent,
  title,
  subtitle,
  location,
  description,
}: PrintListItemProps) {
  return (
    <div className="flex break-inside-avoid gap-9 text-black">
      <div className="relative shrink-0 whitespace-nowrap tabular-nums after:invisible after:content-['0000_—_0000']">
        <span className="absolute">{leftContent}</span>
      </div>
      <div className="min-w-0 flex-1 break-words">
        <p>
          {title}
          {subtitle && <span> {subtitle}</span>}
        </p>
        {location && <p>{location}</p>}
        {description && description !== '<p></p>' && (
          <div
            className={`prose prose-sm max-w-none text-[10px] leading-[1.6] text-black prose-p:my-0 prose-ol:my-4 prose-ol:pl-0 prose-ul:my-4 prose-ul:pl-0 prose-li:my-0 prose-li:py-1 prose-li:pl-0 [&>:first-child]:mt-0 [&>:last-child]:mb-0 [&_p+p:not(:empty)]:mt-4 ${location ? 'mt-2' : ''}`}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
      </div>
    </div>
  );
}
