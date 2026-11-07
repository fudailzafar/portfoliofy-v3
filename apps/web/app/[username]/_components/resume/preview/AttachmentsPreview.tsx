'use client';

import { useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AttachmentSchemaType, resolveAttachedPages } from '@/lib/resume';
import { Lightbox } from '@/components/composite/Lightbox';
import { PageAttachmentCard } from '@/components/composite/PageAttachmentCard';
import { usePersonalDomainView } from '@/lib/ProfileUrlContext';
import { useResumePages } from '@/lib/ResumePagesContext';

const THEME_CLASS =
  /^theme-(default|brutalist|swiss|klein|red|green|blue|albers)$/;
const CARRIED_CLASS = /^(theme-\w+|typography-\w+|font-(sans|serif|mono))$/;

// The theme, typography and font classes of the nearest themed ancestor.
function themeClassesAbove(el: HTMLElement | null): string {
  let node: HTMLElement | null = el;
  while (node && !Array.from(node.classList).some((c) => THEME_CLASS.test(c))) {
    node = node.parentElement;
  }
  if (!node) return 'theme-default';
  return Array.from(node.classList)
    .filter((c) => CARRIED_CLASS.test(c))
    .join(' ');
}

export function AttachmentsPreview({
  attachments,
}: {
  attachments?: AttachmentSchemaType[];
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [themeClassName, setThemeClassName] = useState('theme-default');
  const stripRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useParams();
  const isPersonalDomainView = usePersonalDomainView();
  const resumePages = useResumePages();

  if (!attachments || attachments.length === 0) {
    return null;
  }

  // Page entries are {id, type:'page'} stubs; resolve them against resume.pages.
  const attachedPages = resolveAttachedPages(attachments, resumePages);

  // The lightbox only knows about image/video — a page attachment gets its
  // own thumbnail card below and navigates to its own URL on click instead.
  const mediaAttachments = attachments.filter((a) => a.type !== 'page');

  const handleOpenLightbox = (attachment: AttachmentSchemaType) => {
    const mediaIndex = mediaAttachments.findIndex(
      (a) => a.id === attachment.id,
    );
    if (mediaIndex === -1) return;
    // The lightbox renders in a portal, so carry the profile's theme along.
    setThemeClassName(themeClassesAbove(stripRef.current));
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
      <div
        ref={stripRef}
        className="custom-scrollbar mb-2 mt-4 flex w-full snap-x gap-3 overflow-x-auto pb-2"
      >
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
          <button
            key={attachment.id}
            type="button"
            aria-label={`Open ${attachment.type === 'video' ? 'video' : 'image'}`}
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
                alt=""
                loading="lazy"
                className="h-full w-auto object-cover"
              />
            )}
          </button>
        ))}
      </div>

      <Lightbox
        attachments={mediaAttachments}
        currentIndex={currentIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        onIndexChange={setCurrentIndex}
        themeClassName={themeClassName}
      />
    </>
  );
}
