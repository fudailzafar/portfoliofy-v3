'use client';

import { useEffect, useRef } from 'react';
import {
  attachGalleryDrag,
  attachMediaZoom,
} from '@/components/composite/postMediaInteractions';
import hljs from 'highlight.js/lib/core';

import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import rust from 'highlight.js/lib/languages/rust';
import go from 'highlight.js/lib/languages/go';
import java from 'highlight.js/lib/languages/java';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import ruby from 'highlight.js/lib/languages/ruby';
import php from 'highlight.js/lib/languages/php';
import swift from 'highlight.js/lib/languages/swift';
import kotlin from 'highlight.js/lib/languages/kotlin';
import sql from 'highlight.js/lib/languages/sql';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('go', go);
hljs.registerLanguage('java', java);
hljs.registerLanguage('c', c);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('php', php);
hljs.registerLanguage('swift', swift);
hljs.registerLanguage('kotlin', kotlin);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('json', json);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('css', css);

export function PageContent({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  // Code blocks have no language set, so highlight.js auto-detects per view.
  // dataset.highlighted guards against StrictMode's double effect.
  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    container.querySelectorAll<HTMLElement>('pre code').forEach((block) => {
      if (!block.dataset.highlighted) {
        hljs.highlightElement(block);
      }
    });
  }, [html]);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const cleanups: (() => void)[] = [];

    // Drop the grey placeholder once each image or video has loaded.
    container
      .querySelectorAll<
        HTMLImageElement | HTMLVideoElement
      >('.content-image, .content-gallery-media')
      .forEach((media) => {
        const markLoaded = () => {
          media.dataset.loaded = 'true';
        };
        const isImage = media instanceof HTMLImageElement;
        const ready = isImage
          ? media.complete && media.naturalWidth > 0
          : media.readyState >= 2;
        if (ready) return markLoaded();
        const event = isImage ? 'load' : 'loadeddata';
        media.addEventListener(event, markLoaded, { once: true });
        cleanups.push(() => media.removeEventListener(event, markLoaded));
      });

    // Galleries scroll by mouse drag everywhere; zoom only on the published
    // post page, not in the editor preview.
    cleanups.push(attachGalleryDrag(container));
    if (container.closest('[data-post-page]')) {
      cleanups.push(attachMediaZoom(container));
    }

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [html]);

  return (
    <div
      ref={ref}
      data-page-content
      className="blog-prose prose prose-sm max-w-none text-theme-primary [--tw-prose-bullets:var(--theme-primary)] [--tw-prose-counters:var(--theme-primary)] prose-headings:font-normal prose-headings:text-theme-primary prose-h2:mb-4 prose-h2:mt-8 prose-h2:text-[20px] prose-h3:mb-4 prose-h3:mt-8 prose-h3:text-[16px] prose-p:text-[14px] prose-p:text-theme-primary prose-a:border-b prose-a:border-theme-muted prose-a:font-normal prose-a:text-theme-primary prose-a:no-underline prose-blockquote:mx-0 prose-blockquote:my-6 prose-blockquote:border-l-2 prose-blockquote:border-theme-primary prose-blockquote:pl-[1em] prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-theme-primary prose-strong:font-medium prose-strong:text-theme-primary prose-code:mx-[2px] prose-code:rounded-[2px] prose-code:bg-[var(--theme-wash)] prose-code:px-[2px] prose-code:font-mono prose-code:text-[14px] prose-code:font-normal prose-code:text-theme-primary prose-code:before:content-none prose-code:after:content-none prose-pre:rounded-2xl prose-pre:bg-[var(--theme-code-bg)] prose-pre:px-4 prose-pre:py-2 prose-pre:font-mono prose-pre:text-[14px] prose-pre:text-[color:var(--theme-code-text)] prose-ol:my-4 prose-ol:pl-[2em] prose-ol:text-theme-primary prose-ul:my-4 prose-ul:pl-[2em] prose-ul:text-theme-primary prose-li:my-0 prose-li:pl-0 prose-li:leading-[1.6] prose-li:text-theme-primary prose-hr:my-12 prose-hr:border-theme-border [&_blockquote_p]:before:content-none [&_blockquote_p]:after:content-none [&_h2_code]:text-[20px] [&_h3_code]:text-[16px] [&_li_p]:my-1 [&_pre_code]:m-0 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit"
      // Sanitized on save (lib/server/sanitize.ts).
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
