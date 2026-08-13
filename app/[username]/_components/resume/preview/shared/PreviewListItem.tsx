import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { AttachmentsPreview } from '../AttachmentsPreview';

export interface PreviewListItemProps {
  leftContent: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  link?: string;
  location?: React.ReactNode;
  description?: string;
  attachments?: any[];
}

export function PreviewListItem({
  leftContent,
  title,
  subtitle,
  link,
  location,
  description,
  attachments,
}: PreviewListItemProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-[36px] print:mb-6">
      <div className="shrink-0 pt-0.5 text-sm text-theme-secondary sm:w-[94px]">
        {leftContent}
      </div>

      <div className="flex flex-1 flex-col items-start justify-start">
        <div className="group flex items-center gap-1">
          {link ? (
            <a
              href={link.startsWith('http') ? link : `https://${link}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-theme-primary hover:underline hover:underline-offset-4"
            >
              <span className="text-sm font-semibold">
                {title}
                {subtitle && (
                  <span className="font-normal text-theme-primary">
                    {' '}
                    {subtitle}
                  </span>
                )}
                <ArrowUpRight className="relative -top-0.5 ml-1 inline-block h-4 w-4" />
              </span>
            </a>
          ) : (
            <p className="text-sm font-semibold text-theme-primary">
              {title}
              {subtitle && (
                <span className="font-normal text-theme-primary">
                  {' '}
                  {subtitle}
                </span>
              )}
            </p>
          )}
        </div>

        {location && <p className="text-sm text-theme-secondary">{location}</p>}

        {description && description !== '<p></p>' && (
          <div
            className="prose prose-sm mt-4 max-w-none text-sm leading-relaxed text-theme-secondary [--tw-prose-bullets:var(--theme-secondary)] [--tw-prose-counters:var(--theme-secondary)] prose-p:my-1 prose-p:text-theme-secondary prose-strong:text-theme-primary prose-ol:pl-0 prose-ul:my-1 prose-ul:pl-0 prose-ul:text-theme-secondary prose-li:pl-0 prose-li:text-theme-secondary"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}

        <AttachmentsPreview attachments={attachments} />
      </div>
    </div>
  );
}
