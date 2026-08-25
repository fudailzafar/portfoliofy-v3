'use client';

import { useEffect, useRef } from 'react';

export function PageContent({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  // Gallery images expand in place on click (read.cv-style — no modal, no
  // lost scroll position). Content is injected via dangerouslySetInnerHTML,
  // so this is a single delegated listener rather than per-button handlers.
  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      const button = (e.target as HTMLElement).closest('.content-gallery-item');
      if (button && container.contains(button)) {
        button.classList.toggle('expanded');
      }
    };

    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [html]);

  return (
    <div
      ref={ref}
      className="blog-prose prose prose-sm max-w-none text-theme-primary [--tw-prose-bullets:var(--theme-secondary)] [--tw-prose-counters:var(--theme-secondary)] prose-headings:font-normal prose-headings:text-theme-primary prose-h1:text-[20px] prose-h2:mb-4 prose-h2:mt-8 prose-h2:text-[20px] prose-h3:text-[16px] prose-p:text-[14px] prose-p:text-theme-primary prose-a:border-b prose-a:border-theme-muted prose-a:text-theme-primary prose-a:no-underline prose-blockquote:mx-0 prose-blockquote:my-6 prose-blockquote:ml-[1em] prose-blockquote:border-l-2 prose-blockquote:border-theme-primary prose-blockquote:pl-[1em] prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-theme-primary prose-strong:font-medium prose-strong:text-theme-primary prose-code:mx-[2px] prose-code:rounded-[2px] prose-code:bg-[#2F2F2F] prose-code:px-[2px] prose-code:font-mono prose-code:font-normal prose-code:text-theme-primary prose-code:before:content-none prose-code:after:content-none prose-pre:rounded-lg prose-pre:bg-[#2F2F2F] prose-pre:px-4 prose-pre:py-2 prose-pre:font-mono prose-pre:text-[14px] prose-pre:text-theme-primary prose-ol:pl-0 prose-ol:text-theme-primary prose-ul:my-1 prose-ul:pl-0 prose-ul:text-theme-primary prose-li:pl-0 prose-li:leading-[1.6] prose-li:text-theme-primary prose-hr:my-12 prose-hr:border-theme-border [&_blockquote_p]:before:content-none [&_blockquote_p]:after:content-none [&_h2_code]:text-[20px] [&_h3_code]:text-[16px]"
      // Sanitized server-side (sanitizePageContent) before ever being
      // persisted — see lib/server/sanitize.ts.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
