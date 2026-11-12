import React from 'react';
import { ArrowUpRightIcon } from '@phosphor-icons/react/ssr';
import { AttachmentsPreview } from '../AttachmentsPreview';
import { AvatarStack } from '@/components/composite/AvatarStack';
import { CollaboratorSchemaType } from '@/lib/resume';
import { cn, ensureHttps } from '@/lib/utils';

export interface PreviewListItemProps {
  leftContent: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  link?: string;
  location?: React.ReactNode;
  description?: string;
  attachments?: any[];
  collaborators?: CollaboratorSchemaType[];
  /** What a visitor's reply is about. Left out for items that can't be quoted. */
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
  const item = (
    <div className="flex flex-col min-[481px]:flex-row min-[481px]:gap-[36px] print:mb-6">
      {/* read.cv sizes this column by the widest range it could hold
          ("0000 — 0000"), set invisibly after the real text, in tabular digits. */}
      <div className="relative shrink-0 whitespace-nowrap text-[length:var(--type-size)] tabular-nums leading-[var(--line-height)] text-theme-muted min-[481px]:after:invisible min-[481px]:after:content-['0000_—_0000']">
        <span className="min-[481px]:absolute">{leftContent}</span>
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
            <ArrowUpRightIcon className="ml-0.5 inline-block h-3 w-3 shrink-0 align-baseline text-theme-primary" />
          )}
        </div>

        {location && (
          <p className="text-[length:var(--type-size)] leading-[var(--line-height)] text-theme-secondary">
            {location}
          </p>
        )}

        {description && description !== '<p></p>' && (
          <div
            className={cn(
              // read.cv: 8px under a location, nothing right under the title.
              location && 'mt-2',
              'prose prose-sm max-w-none text-theme-secondary [--tw-prose-bullets:var(--theme-secondary)] [--tw-prose-counters:var(--theme-secondary)] prose-p:my-0 prose-p:text-theme-secondary prose-strong:text-theme-primary prose-ol:my-4 prose-ol:pl-0 prose-ul:my-4 prose-ul:pl-0 prose-ul:text-theme-secondary prose-li:py-1 prose-li:pl-0 prose-li:text-theme-secondary [&>:first-child]:mt-0 [&>:last-child]:mb-0 [&_p+p:not(:empty)]:mt-4',
            )}
            style={{
              fontSize: 'var(--type-size)',
              lineHeight: 'var(--line-height)',
            }}
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}

        <AttachmentsPreview attachments={attachments} />
        {/* read.cv: 24px avatars, 8px apart, 8px below (16px below attachments). */}
        <AvatarStack
          collaborators={collaborators}
          size="sm"
          interactive
          className={attachments?.length ? 'mt-4' : 'mt-2'}
        />
      </div>
    </div>
  );

  return item;
}
