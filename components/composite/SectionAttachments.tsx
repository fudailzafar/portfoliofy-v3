'use client';

import React, { useState } from 'react';
import { AttachmentSchemaType } from '@/lib/resume';
import { Button } from '@/components/ui/button';
import { MediaUploadDialog } from './MediaUploadDialog';

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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-content-secondary">
          Attachments
        </span>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-7 text-xs"
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
        <div className="custom-scrollbar mb-2 flex snap-x gap-3 overflow-x-auto pb-2">
          {attachments.map((attachment) => (
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
                  className="h-full w-auto object-cover"
                  preload="metadata"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={attachment.url}
                  alt={attachment.filename || 'Attachment'}
                  loading="lazy"
                  className="h-full w-auto object-cover"
                />
              )}
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
