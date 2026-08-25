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
      // Tailwind's `prose` plugin has its own default color palette and
      // typographic choices (bold headings, italic quotes, backticked
      // inline code) — none of which read.cv actually uses. These overrides
      // are calibrated against several archived read.cv pages (computed
      // styles pulled directly from the DOM): 14px/22.4px body text at full
      // primary-color contrast (not muted), headings at font-weight 400,
      // not italic/bold blockquotes with just a left border, and inline
      // code/links with no decoration of their own.
      className="prose-pre:bg-theme-border/40 prose prose-sm max-w-none text-theme-primary [--tw-prose-bullets:var(--theme-secondary)] [--tw-prose-counters:var(--theme-secondary)] sm:prose-base prose-headings:font-normal prose-headings:text-theme-primary prose-h2:mb-4 prose-h2:mt-8 prose-p:text-theme-primary prose-a:text-theme-primary prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-2 prose-blockquote:border-theme-primary prose-blockquote:pl-4 prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-theme-primary prose-strong:text-theme-primary prose-code:font-normal prose-code:text-theme-primary prose-code:before:content-none prose-code:after:content-none prose-pre:rounded-2xl prose-pre:px-4 prose-pre:py-2 prose-pre:font-mono prose-pre:text-theme-primary prose-ol:text-theme-primary prose-ul:text-theme-primary prose-li:text-theme-primary [&_blockquote_p]:before:content-none [&_blockquote_p]:after:content-none"
      // Sanitized server-side (sanitizePageContent) before ever being
      // persisted — see lib/server/sanitize.ts.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
