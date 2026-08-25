'use client';

import React, { useState } from 'react';
import { AttachmentSchemaType } from '@/lib/resume';
import { Button } from '@/components/ui/button';
import { MediaUploadDialog } from './MediaUploadDialog';
import { PageAttachmentCard } from './PageAttachmentCard';
import { useResumeStore } from '@/store/useResumeStore';
import { ArrowLeft, ArrowRight, Pencil, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionAttachmentsProps {
  attachments: AttachmentSchemaType[];
  onChange: (attachments: AttachmentSchemaType[]) => void;
}

export function SectionAttachments({
  attachments,
  onChange,
}: SectionAttachmentsProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const setEditingPage = useResumeStore((state) => state.setEditingPage);

  const existingPage = attachments.find((a) => a.type === 'page');

  // MediaUploadDialog only knows about image/video attachments — it has no
  // concept of a page (undefined width/height/filename would render oddly,
  // and its own remove button would let someone delete the page from the
  // wrong dialog). Keep it entirely out of that dialog's world: strip it out
  // going in, splice it back in unchanged coming out.
  const handleSaveUploads = (newMediaAttachments: AttachmentSchemaType[]) => {
    onChange(
      existingPage
        ? [...newMediaAttachments, existingPage]
        : newMediaAttachments,
    );
  };

  // Opens the full-page editor for this item's one page. With no existing
  // page, "Add a page" creates a new one; with one, it (and its pencil icon)
  // always reopens that same page — never a second one.
  const openPageEditor = () => {
    setEditingPage({
      attachment: existingPage,
      onSave: (savedPage) => {
        const newAttachments = existingPage
          ? attachments.map((a) => (a.id === existingPage.id ? savedPage : a))
          : [...attachments, savedPage];
        onChange(newAttachments);
        setEditingPage(null);
      },
    });
  };

  const moveLeft = (index: number) => {
    if (index === 0) return;
    const newAttachments = [...attachments];
    const temp = newAttachments[index];
    newAttachments[index] = newAttachments[index - 1];
    newAttachments[index - 1] = temp;
    onChange(newAttachments);
  };

  const moveRight = (index: number) => {
    if (index === attachments.length - 1) return;
    const newAttachments = [...attachments];
    const temp = newAttachments[index];
    newAttachments[index] = newAttachments[index + 1];
    newAttachments[index + 1] = temp;
    onChange(newAttachments);
  };

  const handleDelete = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    onChange(newAttachments);
  };

  return (
    <div className="w-full min-w-0 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-content-secondary">
          Attachments
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 rounded-full text-xs dark:border-none dark:bg-border-subtle"
            onClick={() => setIsUploadOpen(true)}
          >
            Add media
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 rounded-full text-xs dark:border-none dark:bg-border-subtle"
            onClick={openPageEditor}
          >
            {existingPage ? 'Edit page' : 'Add a page'}
          </Button>
        </div>
      </div>

      {attachments.length === 0 ? (
        <div className="bg-surface-2/30 flex items-center justify-center rounded-lg border border-dashed border-border-strong p-6">
          <p className="text-sm text-content-muted">No attachments yet</p>
        </div>
      ) : (
        <div className="custom-scrollbar mb-2 flex max-w-full snap-x gap-3 overflow-x-auto pb-2">
          {attachments.map((attachment, index) => (
            <div
              key={attachment.id}
              className={cn(
                'group relative shrink-0 snap-center',
                attachment.type === 'page'
                  ? 'w-full max-w-[415px]'
                  : 'h-[90px] overflow-hidden rounded-lg border border-border-strong bg-surface-2',
              )}
            >
              {attachment.type === 'video' ? (
                <video
                  src={attachment.url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-auto min-w-[90px] object-cover"
                  preload="metadata"
                />
              ) : attachment.type === 'page' ? (
                <button
                  type="button"
                  onClick={openPageEditor}
                  className="block w-full text-left"
                >
                  <PageAttachmentCard attachment={attachment} />
                </button>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={attachment.url}
                  alt={attachment.filename || 'Attachment'}
                  loading="lazy"
                  className="h-full w-auto min-w-[90px] object-cover"
                />
              )}
              <div className="absolute right-1.5 top-1.5 z-10 flex items-center gap-[2px]">
                {attachment.type === 'page' && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      openPageEditor();
                    }}
                    className="rounded-full border border-white/20 bg-black/60 p-1 text-white shadow-sm backdrop-blur-md transition-colors hover:bg-white/20"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                )}
                {(index > 0 || index < attachments.length - 1) && (
                  <div className="flex items-stretch divide-x divide-white/20 overflow-hidden rounded-full border border-white/20 bg-black/60 text-white shadow-sm backdrop-blur-md">
                    {index > 0 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          moveLeft(index);
                        }}
                        className="flex items-center justify-center px-1 py-1 transition-colors hover:bg-white/20"
                      >
                        <ArrowLeft className="h-3 w-3" />
                      </button>
                    )}
                    {index < attachments.length - 1 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          moveRight(index);
                        }}
                        className="flex items-center justify-center px-1 py-1 transition-colors hover:bg-white/20"
                      >
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(index);
                  }}
                  className="rounded-full border border-white/20 bg-black/60 p-1 text-white shadow-sm backdrop-blur-md transition-colors hover:bg-white/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <MediaUploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        existingAttachments={attachments.filter((a) => a.type !== 'page')}
        onSave={handleSaveUploads}
      />
    </div>
  );
}
