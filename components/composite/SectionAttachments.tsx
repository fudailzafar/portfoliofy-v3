'use client';

import { useState } from 'react';
import { AttachmentSchemaType, resolveAttachedPages } from '@/lib/resume';
import { Button } from '@/components/ui/button';
import { MediaUploadDialog } from './MediaUploadDialog';
import { AttachPagesDialog } from './AttachPagesDialog';
import { PageAttachmentCard } from './PageAttachmentCard';
import { useResumeStore } from '@/store/useResumeStore';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
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
  const [isAttachPagesOpen, setIsAttachPagesOpen] = useState(false);
  const resumePages = useResumeStore((state) => state.resume?.pages) || [];

  const pageStubs = attachments.filter((a) => a.type === 'page');
  const attachedPages = resolveAttachedPages(attachments, resumePages);

  // MediaUploadDialog only understands media, so page stubs are stripped
  // going in and spliced back unchanged coming out.
  const handleSaveUploads = (newMediaAttachments: AttachmentSchemaType[]) => {
    onChange([...newMediaAttachments, ...pageStubs]);
  };

  // Only rewrites this item's page stubs; media attachments are untouched.
  const handleAttachPagesSave = (pageIds: string[]) => {
    const mediaAttachments = attachments.filter((a) => a.type !== 'page');
    const newStubs = pageIds.map((id) => ({
      id,
      type: 'page' as const,
      hidden: false,
      isBlurred: false,
    }));
    onChange([...mediaAttachments, ...newStubs]);
  };

  const handleRemovePage = (pageId: string) => {
    onChange(
      attachments.filter((a) => !(a.type === 'page' && a.id === pageId)),
    );
  };

  // Reorder pages among themselves, then put them back after the media.
  const movePageLeft = (index: number) => {
    if (index === 0) return;
    const newPageStubs = [...pageStubs];
    [newPageStubs[index - 1], newPageStubs[index]] = [
      newPageStubs[index],
      newPageStubs[index - 1],
    ];
    onChange([...mediaAttachments, ...newPageStubs]);
  };

  const movePageRight = (index: number) => {
    if (index === pageStubs.length - 1) return;
    const newPageStubs = [...pageStubs];
    [newPageStubs[index], newPageStubs[index + 1]] = [
      newPageStubs[index + 1],
      newPageStubs[index],
    ];
    onChange([...mediaAttachments, ...newPageStubs]);
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

  const mediaAttachments = attachments.filter((a) => a.type !== 'page');

  return (
    <div className="w-full min-w-0 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-content-secondary">
          Attachments
        </span>
        <div className="flex items-center gap-2">
          <button
            className="flex h-5 items-center justify-center rounded-full p-4 text-xs font-medium dark:border-none dark:bg-border-subtle"
            onClick={() => setIsAttachPagesOpen(true)}
          >
            Add a page
          </button>
          <button
            className="flex h-5 items-center justify-center rounded-full p-4 text-xs font-medium dark:border-none dark:bg-border-subtle"
            onClick={() => setIsUploadOpen(true)}
          >
            Add media
          </button>
        </div>
      </div>

      {attachedPages.length > 0 && (
        <div className="custom-scrollbar mb-2 flex max-w-full snap-x gap-3 overflow-x-auto pb-2">
          {attachedPages.map((page, index) => (
            <div
              key={page.id}
              className="group relative w-[300px] shrink-0 snap-center"
            >
              <PageAttachmentCard attachment={page} />
              <div className="absolute right-1.5 top-1.5 z-10 flex items-center gap-[2px]">
                {(index > 0 || index < attachedPages.length - 1) && (
                  <div className="flex items-stretch divide-x divide-white/20 overflow-hidden rounded-full border border-white/20 bg-black/60 text-white shadow-sm backdrop-blur-md">
                    {index > 0 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          movePageLeft(index);
                        }}
                        className="flex items-center justify-center px-1 py-1 transition-colors hover:bg-white/20"
                      >
                        <ArrowLeft className="h-3 w-3" />
                      </button>
                    )}
                    {index < attachedPages.length - 1 && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          movePageRight(index);
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
                    handleRemovePage(page.id);
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

      {mediaAttachments.length === 0 ? null : (
        <div className="custom-scrollbar mb-2 flex max-w-full snap-x gap-3 overflow-x-auto pb-2">
          {mediaAttachments.map((attachment) => {
            const index = attachments.indexOf(attachment);
            return (
              <div
                key={attachment.id}
                className="group relative h-[90px] shrink-0 snap-center overflow-hidden rounded-lg border border-border-strong bg-surface-2"
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
            );
          })}
        </div>
      )}

      {attachments.length === 0 && (
        <div className="bg-surface-2/30 flex items-center justify-center rounded-lg border border-dashed border-border-strong p-6">
          <p className="text-sm text-content-muted">No attachments yet</p>
        </div>
      )}

      <MediaUploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        existingAttachments={mediaAttachments}
        onSave={handleSaveUploads}
      />

      <AttachPagesDialog
        open={isAttachPagesOpen}
        onOpenChange={setIsAttachPagesOpen}
        pages={resumePages}
        attachedPageIds={pageStubs.map((s) => s.id)}
        onSave={handleAttachPagesSave}
      />
    </div>
  );
}
