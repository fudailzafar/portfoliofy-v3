'use client';

import React, { useState, useEffect } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageCircle, ArrowUpRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { buildContactUrl, extractUsername } from '@/utils/extractUsername';

export function ContactsTab({ 
  setProjectToDelete 
}: { 
  setProjectToDelete: (id: string) => void 
}) {
  const { resume, updateResume, setIsEditingTab } = useResumeStore();
  const [view, setView] = useState<'list' | 'form'>('list');

  useEffect(() => {
    setIsEditingTab(view === 'form');
    return () => setIsEditingTab(false);
  }, [view, setIsEditingTab]);
  const [current, setCurrent] = useState<any>(null);

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
    <div className="max-w-3xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
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
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none h-8 text-xs px-4 rounded-md"
          >
            Add link
          </Button>
        )}
      </div>

      {view === 'list' && items.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-80 mt-12">
          <div className="p-8 bg-gray-50 rounded-full">
            <MessageCircle className="w-16 h-16 text-gray-400" strokeWidth={1} />
          </div>
          <Button
            variant="secondary"
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none rounded-md px-6 py-5 h-auto text-sm"
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
              className="flex flex-col sm:flex-row gap-4 sm:gap-12"
            >
              <div className="sm:w-32 shrink-0 text-gray-400 text-sm pt-0.5">
                {c.platform}
              </div>

              <div className="flex-1 flex flex-col justify-start items-start">
                <a
                  href={buildContactUrl(c.link, c.platform)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline inline-block"
                >
                  <span className="text-base font-semibold text-gray-900">
                    {extractUsername(c.link, c.platform)}
                    <ArrowUpRight className="inline-block ml-1 w-4 h-4 text-gray-900 relative -top-0.5" />
                  </span>
                </a>

                <div className="flex items-center gap-4 mt-3 text-xs font-medium text-gray-400">
                  <button
                    onClick={() => {
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
                    className="hover:text-gray-900 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setProjectToDelete(c.id)}
                    className="hover:text-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'form' && current && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-500 text-[13px]">Type*</Label>
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
                <SelectTrigger className="bg-[#f4f4f4] border-0 h-10 shadow-none text-[14px]">
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

            {current.type === 'Custom' ? (
              <div className="space-y-2">
                <Label className="text-gray-500 text-[13px]">
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
                  disabled={current.type !== 'Custom'}
                  className="bg-[#f4f4f4] border-0 h-10 shadow-none text-[14px] disabled:opacity-50"
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <Label className="text-gray-500 text-[13px]">Username*</Label>
              <Input
                value={current.username || ''}
                onChange={(e) => {
                  const newUsername = e.target.value;
                  setCurrent({
                    ...current,
                    username: newUsername,
                    link: buildContactUrl(newUsername, current.platform || ''),
                  });
                }}
                className="bg-[#f4f4f4] border-0 h-10 shadow-none text-[14px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-500 text-[13px]">URL*</Label>
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
                disabled={current.type !== 'Custom' && current.type !== 'Website'}
                className="bg-[#f4f4f4] border-0 h-10 shadow-none text-[14px] disabled:opacity-50"
              />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 md:px-8 border-t border-gray-100 bg-white flex justify-end z-10">
            <Button
              onClick={handleSave}
              disabled={!current.platform || !current.link}
              className="bg-[#2A2A2A] hover:bg-[#1A1A1A] text-white h-9 px-6 rounded-md shadow-sm border-none font-medium"
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
