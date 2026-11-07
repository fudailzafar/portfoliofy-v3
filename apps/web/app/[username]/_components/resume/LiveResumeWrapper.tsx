'use client';

import { useResumeStore } from '@/store/useResumeStore';
import { FullResume } from './FullResume';
import { ResumeData } from '@/lib/server/dbActions';
import { UserProfile } from '@/lib/server/cachedFunctions';

export function LiveResumeWrapper({
  initialResume,
  profilePicture,
  isOwner,
  userProfile,
  applyTheme = false,
  username,
}: {
  initialResume?: ResumeData | null;
  profilePicture?: string;
  isOwner?: boolean;
  userProfile?: UserProfile;
  applyTheme?: boolean;
  username: string;
}) {
  const storeResume = useResumeStore((state) => state.resume);

  // If the user is actively editing (storeResume exists) AND they own the profile, display it instantly!
  // Otherwise, fallback to the server-fetched initial resume.
  const displayResume = isOwner && storeResume ? storeResume : initialResume;

  if (!displayResume) return null;

  const typography = displayResume.design?.typography || 'sans';
  const theme = displayResume.design?.theme || 'default';
  const fontClass = applyTheme
    ? typography === 'serif'
      ? 'font-serif'
      : typography === 'mono'
        ? 'font-mono'
        : 'font-sans'
    : 'font-sans';
  const themeClass = applyTheme ? `theme-${theme}` : 'theme-default';
  const typographyClass = applyTheme
    ? `typography-${typography}`
    : 'typography-sans';

  return (
    <div
      className={`flex flex-1 flex-col bg-theme-bg ${fontClass} ${themeClass} ${typographyClass}`}
    >
      <FullResume
        resume={displayResume}
        profilePicture={profilePicture}
        isOwner={isOwner}
        userProfile={userProfile}
        username={username}
        isPersonalDomainView={applyTheme}
      />
    </div>
  );
}
