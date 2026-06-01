'use client';

import React, { useEffect, useRef } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { useUserActions } from '@/hooks/useUserActions';

export function GeneralTab({ 
  initialUsername,
  localPicture,
  isUploadingPicture,
  handlePictureUpload,
  removePicture,
  onAvatarUpload,
}: {
  initialUsername: string;
  localPicture?: string;
  isUploadingPicture: boolean;
  handlePictureUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  removePicture: () => Promise<void>;
  onAvatarUpload?: () => void;
}) {
  const { resume, uname, setUname, updateHeader, updateResume } = useResumeStore();
  const { checkUsernameMutation } = useUserActions();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isInitialUsername = uname === initialUsername;

  useEffect(() => {
    if (!isInitialUsername && uname) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        checkUsernameMutation.mutateAsync(uname);
      }, 500);
    }
  }, [uname, isInitialUsername, checkUsernameMutation]);

  if (!resume) return null;

  const isValidUname =
    /^[a-zA-Z0-9-]+$/.test(uname) &&
    uname.length > 0 &&
    ((isInitialUsername || checkUsernameMutation.data?.available) ?? false);

  const { header, summary } = resume;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
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
          <div className="size-20 rounded-full overflow-hidden shrink-0 relative">
            {isUploadingPicture && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full z-10">
                <svg
                  className="animate-spin size-5 text-white"
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
            className="size-20 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer shrink-0 relative group overflow-hidden"
          >
            {isUploadingPicture ? (
              <svg
                className="animate-spin size-6 text-gray-400"
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
                  className="size-8 text-gray-400 group-hover:text-gray-500 transition-colors"
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
                <div className="absolute inset-0 rounded-full ring-2 ring-inset ring-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </>
            )}
          </label>
        )}

        {/* Action buttons */}
        <div className="flex flex-col gap-2">
          {localPicture ? (
            /* Image exists: show Upload (replace) + Remove */
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs text-gray-600 hover:text-red-600 hover:border-red-200 transition-colors"
                onClick={removePicture}
                disabled={isUploadingPicture}
              >
                Remove image
              </Button>
            </>
          ) : (
            /* No image: show Upload image */
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => document.getElementById('avatar-upload')?.click()}
                disabled={isUploadingPicture}
              >
                {isUploadingPicture ? 'Removing…' : 'Upload image'}
              </Button>
              <p className="text-[11px] text-gray-400 leading-tight">
                JPG, PNG or GIF · max 5MB
              </p>
            </>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="uname" className="text-gray-600 text-xs">
            Username*
          </Label>
          <div className="relative flex items-center bg-white border border-gray-200 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-black">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 select-none text-sm z-10">
              portfoliofy-v3.vercel.app/
            </span>
            <Input
              id="uname"
              value={uname}
              onChange={(e) =>
                setUname(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9-]/g, ''),
                )
              }
              className="pl-[180px] border-none focus-visible:ring-0 shadow-none bg-transparent rounded-none h-10"
            />
            <div className="pr-3 flex items-center">
              {isInitialUsername ? null : checkUsernameMutation.isPending ? (
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-black animate-spin" />
              ) : isValidUname ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 6L9 17L4 12"
                    stroke="#009505"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-[#950000]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="displayName" className="text-gray-600 text-xs">
              Display name*
            </Label>
            <span className="text-xs text-gray-400">
              {(header?.name || '').length} of 48
            </span>
          </div>
          <Input
            id="displayName"
            maxLength={48}
            value={header?.name || ''}
            onChange={(e) => updateHeader({ name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="shortAbout" className="text-gray-600 text-xs">
              What do you do?
            </Label>
            <span className="text-xs text-gray-400">
              {(header?.shortAbout || '').length} of 32
            </span>
          </div>
          <Input
            id="shortAbout"
            maxLength={32}
            value={header?.shortAbout || ''}
            onChange={(e) => updateHeader({ shortAbout: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="location" className="text-gray-600 text-xs">
              Location
            </Label>
            <span className="text-xs text-gray-400">
              {(header?.location || '').length} of 32
            </span>
          </div>
          <Input
            id="location"
            maxLength={32}
            value={header?.location || ''}
            onChange={(e) => updateHeader({ location: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="pronouns" className="text-gray-600 text-xs">
              Pronouns
            </Label>
            <span className="text-xs text-gray-400">
              {(header?.pronouns || '').length} of 12
            </span>
          </div>
          <Input
            id="pronouns"
            maxLength={12}
            value={header?.pronouns || ''}
            onChange={(e) => updateHeader({ pronouns: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="website" className="text-gray-600 text-xs">
              Website
            </Label>
            <span className="text-xs text-gray-400">
              {(header?.website || '').length} of 96
            </span>
          </div>
          <Input
            id="website"
            placeholder="https://example.com"
            maxLength={96}
            value={header?.website || ''}
            onChange={(e) => updateHeader({ website: e.target.value })}
          />
        </div>

        <div className="space-y-2 pt-4 border-t border-gray-100">
          <Label className="text-gray-600 text-xs">About</Label>
          <RichTextEditor
            content={summary || ''}
            onChange={(val) => updateResume({ summary: val })}
          />
        </div>
      </div>
    </div>
  );
}
