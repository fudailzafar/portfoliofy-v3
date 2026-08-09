import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { AttachmentsPreview } from '../../preview/AttachmentsPreview';
import { EditDeleteButtons } from '../EditDeleteButtons';
import { SortButtons } from '../SortButtons';

export interface EditorListItemProps {
  isHidden?: boolean;
  leftContent: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  link?: string;
  location?: React.ReactNode;
  description?: string;
  attachments?: any[];
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleVisibility: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function EditorListItem({
  isHidden,
  leftContent,
  title,
  subtitle,
  link,
  location,
  description,
  attachments,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onToggleVisibility,
  onEdit,
  onDelete,
}: EditorListItemProps) {
  return (
    <div className="group flex flex-col gap-4 sm:flex-row sm:gap-12 border-b border-border-subtle pb-5 mb-5 last:border-b-0 last:pb-0 last:mb-0">
      <div className="shrink-0 pt-0.5 text-sm text-content-muted sm:w-24">
        {leftContent}
      </div>

      <div className="flex flex-1 flex-col items-start justify-start">
        <div
          className={`w-full transition-all duration-200 ${isHidden ? 'opacity-50 blur-[1px]' : ''}`}
        >
          <div className="group flex items-center gap-1">
            {link ? (
              <a
                href={link.startsWith('http') ? link : `https://${link}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block hover:underline hover:underline-offset-4"
              >
                <span className="text-sm font-semibold text-content-primary">
                  {title}
                  {subtitle && <span className="font-normal text-content-primary"> {subtitle}</span>}
                  <ArrowUpRight className="relative -top-0.5 ml-1 inline-block h-4 w-4 text-content-primary" />
                </span>
              </a>
            ) : (
              <p className="text-sm font-semibold text-content-primary">
                {title}
                {subtitle && <span className="font-normal text-content-primary"> {subtitle}</span>}
              </p>
            )}
          </div>

          {location && <p className="mt-1 text-sm text-content-muted">{location}</p>}

          {description && description !== '<p></p>' && (
            <div
              className="prose prose-sm prose-ul:pl-0 prose-ol:pl-0 prose-li:pl-0 mt-4 max-w-none text-sm leading-relaxed text-content-muted prose-p:my-1 prose-p:text-content-muted prose-strong:text-content-primary prose-ul:my-1 prose-ul:text-content-muted prose-li:text-content-muted"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}

          {attachments && attachments.length > 0 && (
            <div className="mt-4">
              <AttachmentsPreview attachments={attachments} />
            </div>
          )}
        </div>

        <EditDeleteButtons
          isHidden={isHidden}
          onToggleVisibility={onToggleVisibility}
          onEdit={onEdit}
          onDelete={onDelete}
        >
          <SortButtons
            canMoveUp={canMoveUp}
            canMoveDown={canMoveDown}
            onMoveUp={onMoveUp}
            onMoveDown={onMoveDown}
          />
        </EditDeleteButtons>
      </div>
    </div>
  );
}
