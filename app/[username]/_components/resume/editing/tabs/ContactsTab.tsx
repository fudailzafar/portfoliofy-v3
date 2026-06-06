'use client';

import React, { useState, useEffect } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { useTabEditor } from '@/hooks/useTabEditor';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageCircle, ArrowUpRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { buildContactUrl, extractUsername } from '@/utils/extractUsername';
import { EditDeleteButtons } from '../EditDeleteButtons';

export function ContactsTab({
  setProjectToDelete,
}: {
  setProjectToDelete: (id: string) => void;
}) {
  const { resume, updateResume } = useResumeStore();
  const {
    view: view,
    setView: setView,
    current: current,
    setCurrent: setCurrent,
  } = useTabEditor<any>();

  if (!resume) return null;
  const items = resume.contacts || [];

  const handleSave = () => {
    if (!current?.platform || !current?.link) return;

    const isEdit = !!current.id;
    const newItem = isEdit
      ? current
      : { ...current, id: Date.now().toString() };

    const newItems = isEdit
      ? items.map((c: any) => (c.id === newItem.id ? newItem : c))
      : [...items, newItem];

    updateResume({ contacts: newItems });
    setView('list');
    setCurrent(null);
  };

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-bold">Contact</h2>
        {view === 'list' && (
          <Button
            variant="secondary"
            onClick={() => {
              setCurrent({
                platform: '',
                link: '',
                type: 'Custom',
                username: '',
              });
              setView('form');
            }}
            className="h-8 rounded-md border-none bg-gray-100 px-4 text-xs text-gray-900 hover:bg-gray-200"
          >
            Add link
          </Button>
        )}
      </div>

      {view === 'list' && items.length === 0 && (
        <div className="mt-12 flex flex-1 flex-col items-center justify-center space-y-6 text-center opacity-80">
          <div className="rounded-full bg-gray-50 p-8">
            <MessageCircle
              className="h-16 w-16 text-gray-400"
              strokeWidth={1}
            />
          </div>
          <Button
            variant="secondary"
            className="h-auto rounded-md border-none bg-gray-100 px-6 py-5 text-sm text-gray-900 hover:bg-gray-200"
            onClick={() => {
              setCurrent({
                platform: '',
                link: '',
                type: 'Custom',
                username: '',
              });
              setView('form');
            }}
          >
            Let others know how to reach you
          </Button>
        </div>
      )}

      {view === 'list' && items.length > 0 && (
        <div className="space-y-8">
          {items.map((c: any) => (
            <div
              key={c.id || c.platform}
              className="flex flex-col gap-4 sm:flex-row sm:gap-12"
            >
              <div className="shrink-0 pt-0.5 text-sm text-gray-400 sm:w-32">
                {c.platform}
              </div>

              <div className="flex flex-1 flex-col items-start justify-start">
                <a
                  href={buildContactUrl(c.link, c.platform)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block hover:underline"
                >
                  <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    {extractUsername(c.link, c.platform)}
                    <ArrowUpRight className="relative -top-0.5 ml-1 inline-block h-4 w-4 text-gray-900" />
                  </span>
                </a>

                <EditDeleteButtons
                  onEdit={() => {
                    setCurrent({
                      ...c,
                      type: [
                        'Website',
                        'Email',
                        'LinkedIn',
                        'GitHub',
                        'X',
                        'Threads',
                        'Figma',
                        'Instagram',
                        'Bluesky',
                        'Mastodon',
                      ].includes(c.platform)
                        ? c.platform
                        : 'Custom',
                      username: extractUsername(c.link, c.platform),
                    });
                    setView('form');
                  }}
                  onDelete={() => setProjectToDelete(c.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'form' && current && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[13px] text-gray-500">Type*</Label>
              <Select
                value={current.type || 'Custom'}
                onValueChange={(val) => {
                  const isCustom = val === 'Custom';
                  setCurrent({
                    ...current,
                    type: val,
                    platform: isCustom ? current.platform : val,
                    link: !isCustom
                      ? buildContactUrl(current.username || '', val)
                      : current.link,
                  });
                }}
              >
                <SelectTrigger className="h-10 border-0 bg-[#f4f4f4] text-[14px] shadow-none dark:bg-[#1f1f1f] dark:text-gray-200">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    'Custom',
                    'Website',
                    'Email',
                    'LinkedIn',
                    'GitHub',
                    'X',
                    'Threads',
                    'Figma',
                    'Instagram',
                    'Bluesky',
                    'Mastodon',
                  ].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {current.type === 'Custom' && (
              <div className="space-y-2">
                <Label className="text-[13px] text-gray-500">
                  Name of platform*
                </Label>
                <Input
                  value={current.platform || ''}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      platform: e.target.value,
                    })
                  }
                  className="h-10 border-0 bg-[#f4f4f4] text-[14px] shadow-none dark:bg-[#1f1f1f] dark:text-gray-200"
                />
              </div>
            )}

            {current.type === 'Custom' ? (
              <>
                <div className="space-y-2">
                  <Label className="text-[13px] text-gray-500">Username*</Label>
                  <Input
                    value={current.username || ''}
                    onChange={(e) => {
                      const newUsername = e.target.value;
                      setCurrent({
                        ...current,
                        username: newUsername,
                      });
                    }}
                    className="h-10 border-0 bg-[#f4f4f4] text-[14px] shadow-none dark:bg-[#1f1f1f] dark:text-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] text-gray-500">URL*</Label>
                  <Input
                    value={current.link || ''}
                    onChange={(e) => {
                      const newUrl = e.target.value;
                      setCurrent({
                        ...current,
                        link: newUrl,
                      });
                    }}
                    className="h-10 border-0 bg-[#f4f4f4] text-[14px] shadow-none dark:bg-[#1f1f1f] dark:text-gray-200"
                  />
                </div>
              </>
            ) : current.type === 'Website' ? (
              <div className="space-y-2">
                <Label className="text-[13px] text-gray-500">
                  Website URL*
                </Label>
                <Input
                  value={current.link || ''}
                  onChange={(e) => {
                    const newUrl = e.target.value;
                    setCurrent({
                      ...current,
                      link: newUrl,
                      username: extractUsername(newUrl, current.platform || ''),
                    });
                  }}
                  className="h-10 border-0 bg-[#f4f4f4] text-[14px] shadow-none dark:bg-[#1f1f1f] dark:text-gray-200"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-[13px] text-gray-500">
                  Username or Profile URL*
                </Label>
                <Input
                  value={current.username || ''}
                  onChange={(e) => {
                    const newUsername = e.target.value;
                    setCurrent({
                      ...current,
                      username: newUsername,
                      link: buildContactUrl(
                        newUsername,
                        current.platform || '',
                      ),
                    });
                  }}
                  className="h-10 border-0 bg-[#f4f4f4] text-[14px] shadow-none dark:bg-[#1f1f1f] dark:text-gray-200"
                />
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-end gap-3 border-t border-gray-100 bg-white p-4 md:px-8 dark:border-[#333] dark:bg-[#121212]">
            <button
              onClick={() => setView('list')}
              className="px-4 text-[14px] font-medium text-black hover:underline hover:underline-offset-2 dark:text-gray-200"
            >
              Cancel
            </button>
            <Button
              onClick={handleSave}
              disabled={!current.platform || !current.link}
              variant="outline"
              className="h-9 rounded-md border border-gray-200 bg-white px-6 font-medium text-black shadow-sm dark:border-[#333] dark:bg-[#1f1f1f] dark:text-gray-200 dark:hover:bg-[#2c2c2c]"
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
