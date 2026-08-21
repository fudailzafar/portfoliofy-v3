'use client';

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
    // aria-hidden: this tree duplicates the on-screen resume (name, headings,
    // etc.) and is only ever visually shown via the print stylesheet — left
    // exposed to the accessibility tree it doubles up headings for screen
    // reader users on every normal page visit.
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
