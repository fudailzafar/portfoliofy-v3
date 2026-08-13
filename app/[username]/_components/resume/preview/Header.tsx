'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
            <Avatar className="size-20 shrink-0 md:size-24" aria-hidden="true">
              <AvatarImage
                src={picture}
                alt={`${header.name}'s profile picture`}
              />
              <AvatarFallback>
                {header.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
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
                      className="absolute -bottom-1 -right-2 flex h-7 w-10 items-center justify-center rounded-full border border-theme-border bg-theme-bg text-sm text-theme-primary shadow-sm transition-transform hover:scale-105"
                    >
                      <Twemoji
                        tag="span"
                        className="flex items-center justify-center leading-none"
                        options={{ className: 'h-[1.2em] w-[1.2em]' }}
                      >
                        {currentStatus.emoji || <SmilePlus size={16} />}
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
              <div className="absolute -bottom-1 -right-2 flex h-7 w-9 items-center justify-center rounded-full border border-theme-border bg-theme-bg text-sm text-theme-primary shadow-sm">
                <Twemoji
                  tag="span"
                  className="flex items-center justify-center leading-none"
                  options={{ className: 'h-[1.2em] w-[1.2em]' }}
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
        <div className="relative mt-4 flex w-full flex-col gap-1 rounded-3xl border border-theme-border bg-theme-bg px-6 py-[18px] shadow-sm">
          {/* Speech Bubble Tail */}
          <div className="absolute -top-[6px] left-[64px] h-3 w-3 rotate-45 rounded-tl-sm border-l border-t border-theme-border bg-theme-bg md:left-[80px]" />
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
