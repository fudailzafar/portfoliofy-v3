'use client';

import React from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import dynamic from 'next/dynamic';
const RichTextEditor = dynamic(
  () =>
    import('@/components/composite/RichTextEditor').then(
      (mod) => mod.RichTextEditor,
    ),
  { ssr: false },
);
import { CheckIcon, XIcon, CameraIcon } from '@phosphor-icons/react/ssr';
import { isValidWebsite, normalizeWebsite } from '@/lib/validation/url';

export function GeneralTab({
  initialUsername,
  localPicture,
  isUploadingPicture,
  handlePictureUpload,
  removePicture,
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
  // EditProfileDialog owns the availability check (Save needs it too).
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
          aria-label="Upload profile picture"
          className="peer sr-only"
          onChange={(e) => {
            handlePictureUpload(e);
            e.target.value = '';
          }}
        />

        {localPicture && !isUploadingPicture ? (
          /* ── Has image and not uploading: static avatar (not clickable) ── */
          <div className="relative size-20 shrink-0 overflow-hidden rounded-full">
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
            className="group relative flex size-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-surface-2 peer-focus-visible:ring-2 peer-focus-visible:ring-ring"
          >
            {isUploadingPicture ? (
              <Spinner size={20} className="text-content-secondary" />
            ) : (
              <>
                <CameraIcon className="size-8 text-content-muted transition-colors group-hover:text-content-muted" />
                {/* Subtle ring on hover */}
                <div className="absolute inset-0 rounded-full opacity-0 ring-2 ring-inset ring-border-strong transition-opacity group-hover:opacity-100" />
              </>
            )}
          </label>
        )}

        <button
          className="h-8 cursor-pointer rounded-md border border-border-strong bg-surface-1 px-4 text-[13px] text-content-primary shadow-sm transition-all active:bg-surface-2 disabled:cursor-not-allowed disabled:text-content-muted disabled:shadow-none dark:border-none dark:bg-border-subtle dark:active:bg-border-strong"
          onClick={removePicture}
          disabled={!localPicture || isUploadingPicture}
        >
          Remove image
        </button>
      </div>

      <div className="w-full min-w-0 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="uname" className="text-xs text-content-secondary">
            Username*
          </Label>
          <div className="relative flex items-center overflow-hidden rounded-md bg-surface-3 dark:border-none dark:bg-border-subtle">
            <Input
              id="uname"
              placeholder="your-username"
              value={uname}
              onChange={(e) =>
                setUname(
                  e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                )
              }
              className="h-10 rounded-none border-none bg-transparent shadow-none focus-visible:ring-0"
            />
            <div className="flex items-center pr-3">
              {isInitialUsername ? null : isCheckingUsername ? (
                <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center">
                  <Spinner size={16} className="text-content-muted" />
                </div>
              ) : isValidUsername ? (
                <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-green-500 p-0.5">
                  <CheckIcon className="h-3 w-3 text-surface-1" weight="bold" />
                </div>
              ) : (
                <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-red-500 p-0.5">
                  <XIcon className="h-3 w-3 text-surface-1" weight="bold" />
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
              {(header?.shortAbout || '').length} of 36
            </span>
          </div>
          <Input
            id="shortAbout"
            placeholder="Architect, painter, etc"
            maxLength={36}
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
              {(header?.location || '').length} of 24
            </span>
          </div>
          <Input
            id="location"
            placeholder="Where you're based"
            maxLength={24}
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
            placeholder="He/him, etc"
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
              {(header?.website || '').length} of 96
            </span>
          </div>
          <Input
            id="website"
            placeholder="https://example.com"
            maxLength={96}
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
