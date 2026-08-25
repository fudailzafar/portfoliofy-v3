import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { AttachmentsPreview } from '../AttachmentsPreview';
import { AvatarStack } from '@/components/composite/AvatarStack';
import { CollaboratorSchemaType } from '@/lib/resume';
import { ensureHttps } from '@/lib/utils';

export interface PreviewListItemProps {
  leftContent: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  link?: string;
  location?: React.ReactNode;
  description?: string;
  attachments?: any[];
  collaborators?: CollaboratorSchemaType[];
}

export function PreviewListItem({
  leftContent,
  title,
  subtitle,
  link,
  location,
  description,
  attachments,
  collaborators,
}: PreviewListItemProps) {
  return (
    <div className="flex flex-col gap-1 min-[481px]:flex-row min-[481px]:gap-[36px] print:mb-6">
      <div className="shrink-0 pt-0.5 text-[length:var(--type-size)] leading-[var(--line-height)] text-theme-muted min-[481px]:w-[94px]">
        {leftContent}
      </div>

      <div className="flex min-w-0 flex-1 flex-col items-start justify-start">
        <div className="group">
          {link ? (
            <a
              href={ensureHttps(link)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-theme-primary hover:underline hover:decoration-1 hover:underline-offset-2"
            >
              <span className="font-regular text-[length:var(--type-size)] leading-[var(--line-height)]">
                {title}
                {subtitle && (
                  <span className="font-normal text-theme-primary">
                    {' '}
                    {subtitle}
                  </span>
                )}
              </span>
            </a>
          ) : (
            <p className="font-regular text-[length:var(--type-size)] leading-[var(--line-height)] text-theme-primary">
              {title}
              {subtitle && (
                <span className="font-normal text-theme-primary">
                  {' '}
                  {subtitle}
                </span>
              )}
            </p>
          )}
          {link && (
            <ArrowUpRight className="ml-0.5 inline-block h-3 w-3 shrink-0 align-baseline text-theme-primary" />
          )}
        </div>

        {location && (
          <p className="text-[length:var(--type-size)] leading-[var(--line-height)] text-theme-secondary">
            {location}
          </p>
        )}

        {description && description !== '<p></p>' && (
          <div
            className="prose prose-sm max-w-none text-theme-secondary [--tw-prose-bullets:var(--theme-secondary)] [--tw-prose-counters:var(--theme-secondary)] prose-p:my-1 prose-p:text-theme-secondary prose-strong:text-theme-primary prose-ol:pl-0 prose-ul:my-1 prose-ul:pl-0 prose-ul:text-theme-secondary prose-li:pl-0 prose-li:text-theme-secondary"
            style={{
              fontSize: 'var(--type-size)',
              lineHeight: 'var(--line-height)',
            }}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}

        <AttachmentsPreview attachments={attachments} />
        <AvatarStack collaborators={collaborators} size="md" interactive />
      </div>
    </div>
  );
}
