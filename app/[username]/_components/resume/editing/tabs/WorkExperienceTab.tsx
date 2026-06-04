import React, { useState, useEffect } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
const RichTextEditor = dynamic(
  () =>
    import('@/components/composite/rich-text-editor').then(
      (mod) => mod.RichTextEditor,
    ),
  { ssr: false },
);
import { Briefcase, ArrowUpRight, Upload, Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { sortByDateDesc } from '@/lib/resume';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function WorkExperienceTab({
  years,
  setProjectToDelete,
}: {
  years: number[];
  setProjectToDelete: (id: string) => void;
}) {
  const { resume, updateResume, setIsEditingTab } = useResumeStore();
  const [workView, setWorkView] = useState<'list' | 'form'>('list');

  useEffect(() => {
    setIsEditingTab(workView === 'form');
    return () => setIsEditingTab(false);
  }, [workView, setIsEditingTab]);
  const [currentWork, setCurrentWork] = useState<any>(null);

  if (!resume) return null;
  const work = resume.workExperience || [];

  const handleSave = () => {
    if (!currentWork?.title || !currentWork?.company) return;

    const isEdit = !!currentWork.id;
    const newItem = isEdit
      ? currentWork
      : { ...currentWork, id: Date.now().toString() };

    const newItems = isEdit
      ? work.map((p: any) => (p.id === currentWork.id ? newItem : p))
      : [...work, newItem];

    updateResume({ workExperience: newItems });
    setWorkView('list');
    setCurrentWork(null);
  };

  const handleMoveUp = (currentItem: any, prevItem: any) => {
    const newItems = [...work];
    const idx1 = newItems.findIndex((i: any) => i.id === currentItem.id);
    const idx2 = newItems.findIndex((i: any) => i.id === prevItem.id);

    if (idx1 !== -1 && idx2 !== -1) {
      [newItems[idx1], newItems[idx2]] = [newItems[idx2], newItems[idx1]];
      updateResume({ workExperience: newItems });
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="mx-auto flex max-w-3xl flex-col pb-24">
      <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-bold">Work Experience</h2>
        {workView === 'list' && (
          <Button
            variant="secondary"
            onClick={() => {
              setCurrentWork({
                company: '',
                title: '',
                startMonth: '',
                start: currentYear.toString(),
                endMonth: '',
                end: 'Present',
                location: '',
                link: '',
                contract: '',
                description: '',
              });
              setWorkView('form');
            }}
            className="h-8 rounded-md border-none bg-gray-100 px-4 text-xs text-gray-900 hover:bg-gray-200"
          >
            Add work experience
          </Button>
        )}
      </div>

      {workView === 'list' && work.length === 0 && (
        <div className="mt-12 flex flex-1 flex-col items-center justify-center space-y-6 text-center opacity-80">
          <div className="rounded-full bg-gray-50 p-8">
            <Briefcase className="h-16 w-16 text-gray-400" strokeWidth={1} />
          </div>
          <Button
            variant="secondary"
            className="h-auto rounded-md border-none bg-gray-100 px-6 py-5 text-sm text-gray-900 hover:bg-gray-200"
            onClick={() => {
              setCurrentWork({
                company: '',
                title: '',
                startMonth: '',
                start: currentYear.toString(),
                endMonth: '',
                end: 'Present',
                location: '',
                link: '',
                contract: '',
                description: '',
              });
              setWorkView('form');
            }}
          >
            Add a role
          </Button>
        </div>
      )}

      {workView === 'list' && work.length > 0 && (
        <div className="space-y-8">
          {sortByDateDesc(work).map(
            (w: any, index: number, sortedArray: any[]) => {
              const prevItem = index > 0 ? sortedArray[index - 1] : null;
              const canMoveUp =
                prevItem &&
                parseInt(w.start || '0') === parseInt(prevItem.start || '0');
              const nextItem =
                index < sortedArray.length - 1 ? sortedArray[index + 1] : null;
              const canMoveDown =
                nextItem &&
                parseInt(w.start || '0') === parseInt(nextItem.start || '0');
              return (
                <div
                  key={w.id || w.company}
                  className="flex flex-col gap-4 sm:flex-row sm:gap-12"
                >
                  <div className="shrink-0 pt-0.5 text-sm text-gray-400 sm:w-32">
                    {w.start} — {w.end}
                  </div>

                  <div className="flex flex-1 flex-col items-start justify-start">
                    {w.link ? (
                      <a
                        href={
                          w.link.startsWith('http')
                            ? w.link
                            : `https://${w.link}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block hover:underline"
                      >
                        <span className="text-base font-semibold text-gray-900">
                          {w.title} at {w.company}
                          <ArrowUpRight className="relative -top-0.5 ml-1 inline-block h-4 w-4 text-gray-900" />
                        </span>
                      </a>
                    ) : (
                      <p className="text-base font-semibold text-gray-900">
                        {w.title} at {w.company}
                      </p>
                    )}
                    {w.location && (
                      <p className="mt-1 text-sm text-gray-500">{w.location}</p>
                    )}

                    {w.description && w.description !== '<p></p>' && (
                      <div
                        className="prose prose-sm mt-1 max-w-none text-sm text-gray-500"
                        dangerouslySetInnerHTML={{
                          __html: w.description,
                        }}
                      />
                    )}

                    <div className="mt-3 flex items-center gap-4 text-xs font-medium text-gray-400">
                      <button
                        onClick={() => {
                          setCurrentWork(w);
                          setWorkView('form');
                        }}
                        className="transition-colors hover:text-gray-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setProjectToDelete(w.id)}
                        className="transition-colors hover:text-red-600"
                      >
                        Delete
                      </button>
                      {canMoveUp && (
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleMoveUp(w, prevItem)}
                                className="transition-colors hover:text-gray-900"
                              >
                                <Upload className="h-[15px] w-[15px]" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="mb-1 rounded-md border-none bg-[#111] px-2.5 py-1.5 text-xs font-medium text-white"
                            >
                              Move up
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {canMoveDown && (
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleMoveUp(w, nextItem)}
                                className="transition-colors hover:text-gray-900"
                              >
                                <Download className="h-[15px] w-[15px]" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="mb-1 rounded-md border-none bg-[#111] px-2.5 py-1.5 text-xs font-medium text-white"
                            >
                              Move down
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}

      {workView === 'form' && currentWork && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Company*</Label>
              <Input
                value={currentWork.company}
                onChange={(e) =>
                  setCurrentWork({
                    ...currentWork,
                    company: e.target.value,
                  })
                }
                placeholder="Acme Design Studio"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Position*</Label>
              <Input
                value={currentWork.title}
                onChange={(e) =>
                  setCurrentWork({
                    ...currentWork,
                    title: e.target.value,
                  })
                }
                placeholder="Senior Product Designer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Start Date*</Label>
              <div className="flex gap-2">
                <Select
                  value={currentWork.startMonth || ''}
                  onValueChange={(val) =>
                    setCurrentWork({
                      ...currentWork,
                      startMonth: val,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={currentWork.start || ''}
                  onValueChange={(val) =>
                    setCurrentWork({ ...currentWork, start: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-gray-600">End Date*</Label>
              <div className="flex gap-2">
                {currentWork.end !== 'Present' && (
                  <Select
                    value={currentWork.endMonth || ''}
                    onValueChange={(val) =>
                      setCurrentWork({
                        ...currentWork,
                        endMonth: val,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Select
                  value={currentWork.end || ''}
                  onValueChange={(val) =>
                    setCurrentWork({ ...currentWork, end: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Present">Present</SelectItem>
                    {years.map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Location</Label>
              <Input
                value={currentWork.location || ''}
                onChange={(e) =>
                  setCurrentWork({
                    ...currentWork,
                    location: e.target.value,
                  })
                }
                placeholder="San Francisco, CA"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Link</Label>
              <Input
                value={currentWork.link || ''}
                onChange={(e) =>
                  setCurrentWork({
                    ...currentWork,
                    link: e.target.value,
                  })
                }
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label className="text-xs text-gray-600">Description</Label>
            <RichTextEditor
              content={currentWork.description || ''}
              onChange={(val) =>
                setCurrentWork({ ...currentWork, description: val })
              }
            />
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-end gap-3 border-t border-gray-100 bg-white p-4 md:px-8">
            <button
              onClick={() => setWorkView('list')}
              className="px-4 text-[14px] font-medium text-black hover:underline hover:underline-offset-2"
            >
              Cancel
            </button>
            <Button
              onClick={handleSave}
              disabled={!currentWork?.title || !currentWork?.company}
              variant="outline"
              className="h-9 rounded-md border border-gray-200 bg-white px-6 font-medium text-black shadow-sm"
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
