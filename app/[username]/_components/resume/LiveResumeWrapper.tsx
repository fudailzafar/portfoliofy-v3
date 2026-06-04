'use client';

import { useResumeStore } from '@/store/useResumeStore';
import { FullResume } from './FullResume';
import { ResumeData } from '@/lib/server/dbActions';

export function LiveResumeWrapper({
  initialResume,
  profilePicture,
}: {
  initialResume?: ResumeData | null;
  profilePicture?: string;
}) {
  const storeResume = useResumeStore((state) => state.resume);

  // If the user is actively editing (storeResume exists), display it instantly!
  // Otherwise, fallback to the server-fetched initial resume.
  const displayResume = storeResume || initialResume;

  const typography = displayResume?.design?.typography || 'sans';
  const theme = displayResume?.design?.theme || 'default';
  const fontClass =
    typography === 'serif'
      ? 'font-serif'
      : typography === 'mono'
        ? 'font-mono'
        : 'font-sans';
  const themeClass = `theme-${theme}`;

  return (
    <div
      className={`flex flex-1 flex-col bg-theme-bg ${fontClass} ${themeClass}`}
    >
      <FullResume resume={displayResume} profilePicture={profilePicture} />
    </div>
  );
}
