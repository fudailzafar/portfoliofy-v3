import React from 'react';

export interface PrintListItemProps {
  leftContent: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  location?: React.ReactNode;
  description?: string;
}

export function PrintListItem({
  leftContent,
  title,
  subtitle,
  location,
  description,
}: PrintListItemProps) {
  return (
    <div className="flex items-baseline gap-4">
      <div className="w-24 shrink-0 text-sm text-black">
        {leftContent}
      </div>
      <div>
        <p className="text-sm">
          {title}
          {subtitle && <span> {subtitle}</span>}
        </p>
        {location && (
          <p className="mt-0.5 text-sm text-black">{location}</p>
        )}
        {description && description !== '<p></p>' && (
          <div
            className="prose prose-sm prose-ul:pl-0 prose-ol:pl-0 prose-li:pl-0 mt-2 max-w-none text-sm text-black prose-p:my-1"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
      </div>
    </div>
  );
}
