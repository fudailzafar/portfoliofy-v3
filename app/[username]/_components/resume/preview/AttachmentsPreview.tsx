'use client';

import { useState } from 'react';
import { AttachmentSchemaType } from '@/lib/resume';
import { Lightbox } from '@/components/composite/Lightbox';

export function AttachmentsPreview({
  attachments,
}: {
  attachments?: AttachmentSchemaType[];
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const handleOpenLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="custom-scrollbar mb-2 mt-4 flex snap-x gap-3 overflow-x-auto pb-2">
        {attachments.map((attachment, index) => (
          <div
            key={attachment.id}
            className="group relative h-[90px] shrink-0 cursor-pointer snap-center overflow-hidden rounded-lg border border-theme-border bg-theme-bg"
            onClick={() => handleOpenLightbox(index)}
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
            {/* Subtle hover overlay to indicate clickability */}
            <div className="absolute inset-0" />
          </div>
        ))}
      </div>

      <Lightbox
        attachments={attachments}
        currentIndex={currentIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        onIndexChange={setCurrentIndex}
      />
    </>
  );
}
