'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AttachmentSchemaType, resolveAttachedPages } from '@/lib/resume';
import { Lightbox } from '@/components/composite/Lightbox';
import { PageAttachmentCard } from '@/components/composite/PageAttachmentCard';
import { usePersonalDomainView } from '@/lib/ProfileUrlContext';
import { useResumePages } from '@/lib/ResumePagesContext';

export function AttachmentsPreview({
  attachments,
}: {
  attachments?: AttachmentSchemaType[];
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const params = useParams();
  const isPersonalDomainView = usePersonalDomainView();
  const resumePages = useResumePages();

  if (!attachments || attachments.length === 0) {
    return null;
  }

  // A page-type entry here is a {id, type:'page'} reference stub — resolve
  // it against the resume's top-level pages list for the real title/
  // content/thumbnail before rendering.
  const attachedPages = resolveAttachedPages(attachments, resumePages);

  // The lightbox only knows about image/video — a page attachment gets its
  // own thumbnail card below and navigates to its own URL on click instead.
  const mediaAttachments = attachments.filter((a) => a.type !== 'page');

  const handleOpenLightbox = (attachment: AttachmentSchemaType) => {
    const mediaIndex = mediaAttachments.findIndex(
      (a) => a.id === attachment.id,
    );
    if (mediaIndex === -1) return;
    setCurrentIndex(mediaIndex);
    setLightboxOpen(true);
  };

  const handleOpenPage = (page: AttachmentSchemaType) => {
    if (!page.slug) return;
    const username = params?.username as string | undefined;
    const href = isPersonalDomainView
      ? `/${page.slug}`
      : `/${username}/${page.slug}`;
    router.push(href);
  };

  return (
    <>
      <div className="custom-scrollbar mb-2 mt-4 flex w-full snap-x gap-3 overflow-x-auto pb-2">
        {attachedPages.map((page) => (
          <button
            key={page.id}
            type="button"
            onClick={() => handleOpenPage(page)}
            className="w-full max-w-[415px] shrink-0 snap-center text-left"
          >
            <PageAttachmentCard attachment={page} />
          </button>
        ))}
        {mediaAttachments.map((attachment) => (
          <div
            key={attachment.id}
            className="group relative h-[90px] shrink-0 cursor-pointer snap-center overflow-hidden rounded-lg border"
            onClick={() => handleOpenLightbox(attachment)}
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
        attachments={mediaAttachments}
        currentIndex={currentIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        onIndexChange={setCurrentIndex}
      />
    </>
  );
}
