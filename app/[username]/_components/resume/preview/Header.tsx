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
import { ensureHttps } from '@/lib/utils';

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
                      className="absolute -bottom-1 -right-1 flex h-6 w-8 items-center justify-center rounded-full border border-theme-bg bg-theme-border text-sm text-theme-primary shadow-[0_0_0_1px_#0000000d,0_1px_4px_#0000000d] transition-transform active:scale-95 dark:shadow-none"
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
              <div className="absolute -bottom-1 -right-1 flex h-6 w-8 items-center justify-center rounded-full border border-theme-bg bg-theme-border text-sm text-theme-primary shadow-[0_0_0_1px_#0000000d,0_1px_4px_#0000000d] dark:shadow-none">
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
              href={ensureHttps(header.website)}
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
        <div className="relative mt-5 flex w-full flex-col gap-1 rounded-3xl bg-theme-border px-6 py-[18px] shadow-[0_0_0_1px_#0000000d,0_1px_4px_#0000000d] dark:shadow-none">
          {/* Speech Bubble Tail — centered under the status toggle button */}
          <svg
            width="26"
            height="12"
            viewBox="0 0 26 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute -top-[11px] left-[67px]"
            aria-hidden="true"
          >
            <mask
              id="header-tail-mask"
              style={{ maskType: 'alpha' }}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="26"
              height="10"
            >
              <rect width="26" height="10" fill="#C4C4C4" />
            </mask>
            <g mask="url(#header-tail-mask)" className="dark:hidden">
              <g filter="url(#header-tail-filter)">
                <path
                  d="M11.5858 3.41422C12.3668 2.63317 13.6332 2.63317 14.4142 3.41422L19.6569 8.65685C21.1571 10.1571 23.192 11 25.3137 11H26V12H0V11H0.686293C2.80802 11 4.84286 10.1571 6.34315 8.65685L11.5858 3.41422Z"
                  fill="#C4C4C4"
                />
                <path
                  d="M26.5 11V10.5H26H25.3137C23.3246 10.5 21.4169 9.70982 20.0104 8.3033L14.7678 3.06066C13.7915 2.08435 12.2085 2.08435 11.2322 3.06066L5.98959 8.3033C4.58307 9.70982 2.67542 10.5 0.686293 10.5H0H-0.5V11V12V12.5H0H26H26.5V12V11Z"
                  stroke="black"
                  strokeOpacity="0.05"
                />
              </g>
            </g>
            <path
              d="M11.5858 3.41422C12.3668 2.63317 13.6332 2.63317 14.4142 3.41422L19.6569 8.65685C21.1571 10.1571 23.192 11 25.3137 11H26V12H0V11H0.686293C2.80802 11 4.84286 10.1571 6.34315 8.65685L11.5858 3.41422Z"
              className="fill-theme-border"
            />
            <defs>
              <filter
                id="header-tail-filter"
                x="-5"
                y="-1.17157"
                width="36"
                height="19.1716"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                />
                <feOffset dy="1" />
                <feGaussianBlur stdDeviation="2" />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"
                />
                <feBlend
                  mode="normal"
                  in2="BackgroundImageFix"
                  result="effect1_dropShadow"
                />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="effect1_dropShadow"
                  result="shape"
                />
              </filter>
            </defs>
          </svg>
          <span className="text-sm text-theme-secondary">
            {currentStatus.text}
          </span>
          <span className="text-xs text-theme-muted">
            {getRelativeTime(currentStatus.updatedAt)}
          </span>
        </div>
      )}
    </div>
  );
}
