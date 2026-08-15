'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarPlaceholderIcon } from '@/components/composite/AvatarPlaceholderIcon';
import { ResumeDataSchemaType } from '@/lib/resume';
import { UserProfile } from '@/lib/server/cachedFunctions';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Twemoji from 'react-twemoji';
import dynamic from 'next/dynamic';

const StatusEditor = dynamic(
  () => import('./StatusEditor').then((mod) => mod.StatusEditor),
  { ssr: false },
);
import { AnimatePresence } from 'framer-motion';
import { SmilePlus } from 'lucide-react';

function getRelativeTime(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'A few seconds ago';

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return rtf.format(-diffInMinutes, 'minute');

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return rtf.format(-diffInHours, 'hour');

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return rtf.format(-diffInDays, 'day');

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return rtf.format(-diffInMonths, 'month');

  const diffInYears = Math.floor(diffInMonths / 12);
  return rtf.format(-diffInYears, 'year');
}

/**
 * Header component displaying personal information and contact details
 */
export function Header({
  header,
  picture,
  isOwner,
  userProfile,
  hideSocialFeatures = false,
}: {
  header: ResumeDataSchemaType['header'];
  picture?: string;
  isOwner?: boolean;
  userProfile?: UserProfile;
  hideSocialFeatures?: boolean;
}) {
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [currentStatus, setCurrentStatus] = useState({
    emoji: userProfile?.statusEmoji || null,
    text: userProfile?.statusText || null,
    updatedAt: userProfile?.statusUpdatedAt || null,
  });

  return (
    <div className="mb-8">
      <header className="flex items-center gap-4 md:gap-6">
        {!hideSocialFeatures && (
          <div className="relative">
            <Avatar className="size-[92px] shrink-0" aria-hidden="true">
              <AvatarImage
                src={picture}
                alt={`${header.name}'s profile picture`}
              />
              <AvatarFallback className="bg-theme-bg">
                <AvatarPlaceholderIcon className="text-theme-border" />
              </AvatarFallback>
            </Avatar>

            {isOwner && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      id="status-toggle-btn"
                      onClick={() => setIsEditingStatus((prev) => !prev)}
                      aria-label="Set status"
                      className="absolute -bottom-1 -right-1 flex h-6 w-8 items-center justify-center rounded-full border border-theme-bg bg-theme-border text-sm text-theme-primary shadow-md transition-transform hover:scale-105"
                    >
                      <Twemoji
                        tag="span"
                        className="flex items-center justify-center leading-none"
                        options={{ className: 'h-[1em] w-[1em]' }}
                      >
                        {currentStatus.emoji || <SmilePlus size={14} />}
                      </Twemoji>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Set status</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {!isOwner && currentStatus.emoji && (
              <div className="absolute -bottom-1 -right-1 flex h-6 w-8 items-center justify-center rounded-full border border-theme-bg bg-theme-border text-sm text-theme-primary shadow-md">
                <Twemoji
                  tag="span"
                  className="flex items-center justify-center leading-none"
                  options={{ className: 'h-[1em] w-[1em]' }}
                >
                  {currentStatus.emoji}
                </Twemoji>
              </div>
            )}
          </div>
        )}

        <div className="flex-1 space-y-1">
          <h1
            className="text-xl font-semibold leading-[26px] text-theme-primary"
            id="resume-name"
          >
            {header.name}
          </h1>

          {/* Subtitle: {Role} in {Location}, {Pronouns} */}
          {(header.shortAbout || header.location || header.pronouns) && (
            <p
              className="text-pretty text-sm text-theme-secondary"
              aria-labelledby="resume-name"
            >
              {[
                header.shortAbout,
                header.location ? `in ${header.location}` : '',
              ]
                .filter(Boolean)
                .join(' ')}
              {header.pronouns ? `, ${header.pronouns}` : ''}
            </p>
          )}

          {/* Website Link */}
          {header.website && (
            <a
              href={
                header.website.startsWith('http')
                  ? header.website
                  : `https://${header.website}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-sm text-theme-secondary transition-colors hover:text-theme-primary"
            >
              {header.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </a>
          )}
        </div>
      </header>

      {/* Status Editor Dialog */}
      <AnimatePresence>
        {isEditingStatus && !hideSocialFeatures && (
          <StatusEditor
            initialEmoji={currentStatus.emoji}
            initialText={currentStatus.text}
            onClose={() => setIsEditingStatus(false)}
            onSave={(emoji, text, date) =>
              setCurrentStatus({ emoji, text, updatedAt: date })
            }
          />
        )}
      </AnimatePresence>

      {/* Status Display Bubble */}
      {!isEditingStatus && !hideSocialFeatures && currentStatus.text && (
        <div className="relative mt-4 flex w-full flex-col gap-1 rounded-3xl bg-theme-border px-6 py-[18px] shadow-sm">
          {/* Speech Bubble Tail — centered under the status toggle button */}
          <svg
            width="48"
            height="12"
            viewBox="0 0 48 12"
            fill="none"
            className="absolute -top-[10px] left-[56px]"
            aria-hidden="true"
          >
            <path
              d="M0 12V11H6C13 11 17 1 24 1C31 1 35 11 42 11H48V12H0Z"
              className="fill-theme-border"
            />
          </svg>
          <span className="text-sm text-theme-primary">
            {currentStatus.text}
          </span>
          <span className="text-xs text-theme-secondary">
            {getRelativeTime(currentStatus.updatedAt)}
          </span>
        </div>
      )}
    </div>
  );
}
