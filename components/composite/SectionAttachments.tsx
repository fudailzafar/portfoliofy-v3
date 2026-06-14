'use client';

import React, { useState } from 'react';
import { AttachmentSchemaType } from '@/lib/resume';
import { Button } from '@/components/ui/button';
import { MediaUploadDialog } from './MediaUploadDialog';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

interface SectionAttachmentsProps {
  attachments: AttachmentSchemaType[];
  onChange: (attachments: AttachmentSchemaType[]) => void;
}

export function SectionAttachments({
  attachments,
  onChange,
}: SectionAttachmentsProps) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const handleSaveUploads = (newAttachments: AttachmentSchemaType[]) => {
    onChange(newAttachments);
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
    <div className="space-y-3 min-w-0 w-full">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-content-secondary">
          Attachments
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs rounded-full"
          onClick={() => setIsUploadOpen(true)}
        >
          Add media
        </Button>
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
              <div className="absolute top-1.5 right-1.5 flex items-center gap-[2px] z-10">
                {(index > 0 || index < attachments.length - 1) && (
                  <div className="flex items-stretch rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white overflow-hidden shadow-sm divide-x divide-white/20">
                    {index > 0 && (
                      <button
                        onClick={(e) => { e.preventDefault(); moveLeft(index); }}
                        className="px-1 py-1 hover:bg-white/20 transition-colors flex items-center justify-center"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                    )}
                    {index < attachments.length - 1 && (
                      <button
                        onClick={(e) => { e.preventDefault(); moveRight(index); }}
                        className="px-1 py-1 hover:bg-white/20 transition-colors flex items-center justify-center"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
                
                <button
                  onClick={(e) => { e.preventDefault(); handleDelete(index); }}
                  className="p-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors shadow-sm"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <MediaUploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        existingAttachments={attachments}
        onSave={handleSaveUploads}
      />
    </div>
  );
}
