'use client';

import React from 'react';
import { PrintResume } from './PrintResume';
import { useResumeStore } from '@/store/useResumeStore';
import { ResumeData } from '@/lib/server/dbActions';
import { cn } from '@/lib/utils';

export function PrintResumeWrapper({ resume }: { resume?: ResumeData | null }) {
  const { printHiddenSections } = useResumeStore();
  const typography = resume?.design?.typography || 'sans';
  const fontClass =
    typography === 'serif'
      ? 'font-serif'
      : typography === 'mono'
        ? 'font-mono'
        : 'font-sans';

  return (
    <PrintResume
      resume={resume}
      printHiddenSections={printHiddenSections}
      className={cn('hidden print:block print:bg-surface-1', fontClass)}
    />
  );
}
