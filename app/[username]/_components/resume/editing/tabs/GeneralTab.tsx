'use client';

import React from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import dynamic from 'next/dynamic';
const RichTextEditor = dynamic(
  () =>
    import('@/components/composite/RichTextEditor').then(
      (mod) => mod.RichTextEditor,
    ),
  { ssr: false },
);
import { Check, X } from 'lucide-react';
import { isValidWebsite, normalizeWebsite } from '@/lib/validation/url';

export function GeneralTab({
  initialUsername,
  localPicture,
  isUploadingPicture,
  handlePictureUpload,
  removePicture,
  onAvatarUpload,
  isValidUsername,
  isCheckingUsername,
}: {
  initialUsername: string;
  localPicture?: string;
  isUploadingPicture: boolean;
  handlePictureUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => Promise<void>;
  removePicture: () => Promise<void>;
  onAvatarUpload?: () => void;
  // The debounced availability check is owned by EditProfileDialog (it needs
  // the result for the Save button too) — GeneralTab only renders it, so
  // there's exactly one check in flight per username, not two.
  isValidUsername: boolean;
  isCheckingUsername: boolean;
}) {
  const resume = useResumeStore((state) => state.resume);
  const uname = useResumeStore((state) => state.uname);
  const setUname = useResumeStore((state) => state.setUname);
  const updateHeader = useResumeStore((state) => state.updateHeader);
  const updateResume = useResumeStore((state) => state.updateResume);

  const isInitialUsername = uname === initialUsername;

  if (!resume) return null;

  const { header, summary } = resume;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="mb-8 flex items-center justify-between border-b border-border-subtle pb-4">
        <h2 className="text-xl font-bold text-content-primary sm:text-2xl">
          General
        </h2>
      </div>
      {/* Avatar Section */}
      <div className="flex items-center gap-6">
        {/* Hidden file input — always present */}
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            handlePictureUpload(e);
            e.target.value = '';
          }}
        />

        {localPicture ? (
          /* ── Has image: static avatar (not clickable) ── */
          <div className="relative size-20 shrink-0 overflow-hidden rounded-full">
            {isUploadingPicture && (
              <div className="bg-action-primary/40 absolute inset-0 z-10 flex items-center justify-center rounded-full">
                <svg
                  className="size-5 animate-spin text-surface-1"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              width={300}
              height={300}
              src={localPicture}
              alt="Profile picture"
              className="size-full object-cover"
            />
          </div>
        ) : (
          /* ── No image: clickable camera placeholder ── */
          <label
            htmlFor="avatar-upload"
            className="group relative flex size-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-surface-2"
          >
            {isUploadingPicture ? (
              <svg
                className="size-6 animate-spin text-content-muted"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-8 text-content-muted transition-colors group-hover:text-content-muted"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                  />
                </svg>
                {/* Subtle ring on hover */}
                <div className="absolute inset-0 rounded-full opacity-0 ring-2 ring-inset ring-border-strong transition-opacity group-hover:opacity-100" />
              </>
            )}
          </label>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          {localPicture ? (
            /* Image exists: show Upload (replace) + Remove */
            <>
              <button
                className="h-8 cursor-pointer rounded-md border border-border-strong bg-surface-1 px-4 text-[13px] text-content-primary shadow-sm transition-all active:bg-surface-2 dark:border-none dark:bg-border-subtle dark:active:bg-border-strong"
                onClick={removePicture}
                disabled={isUploadingPicture}
              >
                Remove image
              </button>
            </>
          ) : (
            /* No image: show Upload image */
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs dark:border-none dark:bg-border-subtle"
                onClick={() =>
                  document.getElementById('avatar-upload')?.click()
                }
                disabled={isUploadingPicture}
              >
                {isUploadingPicture ? 'Removing…' : 'Upload image'}
              </Button>
              <p className="text-[11px] leading-tight text-content-muted">
                JPG, PNG or GIF · max 5MB
              </p>
            </>
          )}
        </div>
      </div>

      <div className="w-full min-w-0 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="uname" className="text-xs text-content-secondary">
            Username*
          </Label>
          <div className="relative flex items-center overflow-hidden rounded-md bg-surface-3 dark:border-none dark:bg-border-subtle">
            <span className="absolute left-3 top-1/2 z-10 -translate-y-1/2 select-none text-sm text-content-muted">
              portfoliofy.me/
            </span>
            <Input
              id="uname"
              placeholder="your-username"
              value={uname}
              onChange={(e) =>
                setUname(
                  e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                )
              }
              className="h-10 rounded-none border-none bg-transparent pl-[110px] shadow-none focus-visible:ring-0"
            />
            <div className="flex items-center pr-3">
              {isInitialUsername ? null : isCheckingUsername ? (
                <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center">
                  <Spinner size={16} className="text-content-muted" />
                </div>
              ) : isValidUsername ? (
                <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-green-500 p-0.5">
                  <Check className="h-3 w-3 text-surface-1" strokeWidth={3} />
                </div>
              ) : (
                <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-red-500 p-0.5">
                  <X className="h-3 w-3 text-surface-1" strokeWidth={3} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label
              htmlFor="displayName"
              className="text-xs text-content-secondary"
            >
              Display name*
            </Label>
            <span className="text-xs text-content-muted">
              {(header?.name || '').length} of 48
            </span>
          </div>
          <Input
            id="displayName"
            placeholder="The name on your profile"
            maxLength={48}
            value={header?.name || ''}
            onChange={(e) => updateHeader({ name: e.target.value })}
            className="dark:border-none dark:bg-border-subtle"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label
              htmlFor="shortAbout"
              className="text-xs text-content-secondary"
            >
              What do you do?
            </Label>
            <span className="text-xs text-content-muted">
              {(header?.shortAbout || '').length} of 32
            </span>
          </div>
          <Input
            id="shortAbout"
            placeholder="Architect, painter, etc"
            maxLength={32}
            value={header?.shortAbout || ''}
            onChange={(e) => updateHeader({ shortAbout: e.target.value })}
            className="dark:border-none dark:bg-border-subtle"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label
              htmlFor="location"
              className="text-xs text-content-secondary"
            >
              Location
            </Label>
            <span className="text-xs text-content-muted">
              {(header?.location || '').length} of 32
            </span>
          </div>
          <Input
            id="location"
            placeholder="Where you're based"
            maxLength={32}
            value={header?.location || ''}
            onChange={(e) => updateHeader({ location: e.target.value })}
            className="dark:border-none dark:bg-border-subtle"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label
              htmlFor="pronouns"
              className="text-xs text-content-secondary"
            >
              Pronouns
            </Label>
            <span className="text-xs text-content-muted">
              {(header?.pronouns || '').length} of 12
            </span>
          </div>
          <Input
            id="pronouns"
            placeholder="He/Him, etc"
            maxLength={12}
            value={header?.pronouns || ''}
            onChange={(e) => updateHeader({ pronouns: e.target.value })}
            className="dark:border-none dark:bg-border-subtle"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="website" className="text-xs text-content-secondary">
              Website
            </Label>
            <span className="text-xs text-content-muted">
              {(header?.website || '').length} of 200
            </span>
          </div>
          <Input
            id="website"
            placeholder="https://example.com"
            maxLength={200}
            value={header?.website || ''}
            onChange={(e) => updateHeader({ website: e.target.value })}
            onBlur={(e) => {
              const normalized = normalizeWebsite(e.target.value);
              if (normalized !== e.target.value) {
                updateHeader({ website: normalized });
              }
            }}
            className={
              !isValidWebsite(header?.website || '')
                ? 'border-red-500 focus-visible:ring-red-500 dark:border-none dark:bg-border-subtle'
                : 'dark:border-none dark:bg-border-subtle'
            }
          />
          {!isValidWebsite(header?.website || '') && (
            <p className="text-xs text-red-500">
              Enter a valid web address, e.g. https://yoursite.com
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-content-secondary">About</Label>
          <RichTextEditor
            content={summary || ''}
            onChange={(val) => updateResume({ summary: val })}
          />
        </div>
      </div>
    </div>
  );
}
