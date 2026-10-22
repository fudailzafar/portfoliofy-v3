'use client';

import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { PrintResume } from './PrintResume';
import { useResumeStore } from '@/store/useResumeStore';
import { ResumeData } from '@/lib/server/dbActions';
import { cn } from '@/lib/utils';

export function PrintResumeWrapper({
  resume,
  isOwner,
}: {
  resume?: ResumeData | null;
  isOwner?: boolean;
}) {
  const storeResume = useResumeStore((state) => state.resume);
  const { printHiddenSections } = useResumeStore();
  // Rendered only while printing, so crawlers and agents reading the HTML
  // don't get every section twice. flushSync commits before the browser
  // lays out the print copy.
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    const start = () => flushSync(() => setPrinting(true));
    const stop = () => setPrinting(false);
    const media = window.matchMedia('print');
    const onMediaChange = (e: MediaQueryListEvent) =>
      e.matches ? start() : stop();
    window.addEventListener('beforeprint', start);
    window.addEventListener('afterprint', stop);
    media.addEventListener('change', onMediaChange);
    return () => {
      window.removeEventListener('beforeprint', start);
      window.removeEventListener('afterprint', stop);
      media.removeEventListener('change', onMediaChange);
    };
  }, []);

  if (!printing) return null;

  const displayResume = isOwner && storeResume ? storeResume : resume;
  const typography = displayResume?.design?.typography || 'sans';
  const fontClass =
    typography === 'serif'
      ? 'font-serif'
      : typography === 'mono'
        ? 'font-mono'
        : 'font-sans';
  const typographyClass = `typography-${typography}`;

  return (
    // Print-only copy of the resume; aria-hidden so screen readers don't hear
    // every heading twice.
    <div aria-hidden="true">
      <PrintResume
        resume={displayResume}
        printHiddenSections={printHiddenSections}
        className={cn(
          'hidden print:block print:bg-surface-1',
          fontClass,
          typographyClass,
        )}
      />
    </div>
  );
}
