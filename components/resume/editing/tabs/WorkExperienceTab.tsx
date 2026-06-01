import React, { useState, useEffect } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Briefcase, ArrowUpRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sortByDateDesc } from '@/lib/resume';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function WorkExperienceTab({ 
  years, 
  setProjectToDelete 
}: { 
  years: number[], 
  setProjectToDelete: (id: string) => void 
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

  const currentYear = new Date().getFullYear();

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
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
                end: 'Now',
                location: '',
                link: '',
                contract: '',
                description: '',
              });
              setWorkView('form');
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none h-8 text-xs px-4 rounded-md"
          >
            Add work experience
          </Button>
        )}

      </div>

      {workView === 'list' && work.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-80 mt-12">
          <div className="p-8 bg-gray-50 rounded-full">
            <Briefcase
              className="w-16 h-16 text-gray-400"
              strokeWidth={1}
            />
          </div>
          <Button
            variant="secondary"
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none rounded-md px-6 py-5 h-auto text-sm"
            onClick={() => {
              setCurrentWork({
                company: '',
                title: '',
                startMonth: '',
                start: currentYear.toString(),
                endMonth: '',
                end: 'Now',
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
          {sortByDateDesc(work).map((w: any) => (
            <div
              key={w.id || w.company}
              className="flex flex-col sm:flex-row gap-4 sm:gap-12"
            >
              <div className="sm:w-32 shrink-0 text-gray-400 text-sm pt-0.5">
                {w.start} — {w.end}
              </div>

              <div className="flex-1 flex flex-col justify-start items-start">
                {w.link ? (
                  <a
                    href={
                      w.link.startsWith('http')
                        ? w.link
                        : `https://${w.link}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline inline-block"
                  >
                    <span className="text-base font-semibold text-gray-900">
                      {w.title} at {w.company}
                      <ArrowUpRight className="inline-block ml-1 w-4 h-4 text-gray-900 relative -top-0.5" />
                    </span>
                  </a>
                ) : (
                  <p className="text-base font-semibold text-gray-900">
                    {w.title} at {w.company}
                  </p>
                )}
                {w.location && (
                  <p className="text-sm text-gray-500 mt-1">
                    {w.location}
                  </p>
                )}

                {w.description && w.description !== '<p></p>' && (
                  <div
                    className="mt-1 text-sm text-gray-500 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: w.description,
                    }}
                  />
                )}

                <div className="flex items-center gap-4 mt-3 text-xs font-medium text-gray-400">
                  <button
                    onClick={() => {
                      setCurrentWork(w);
                      setWorkView('form');
                    }}
                    className="hover:text-gray-900 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setProjectToDelete(w.id)}
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

      {workView === 'form' && currentWork && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-600 text-xs">
                Company*
              </Label>
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
              <Label className="text-gray-600 text-xs">
                Position*
              </Label>
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
              <Label className="text-gray-600 text-xs">
                Start Date*
              </Label>
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
                      <SelectItem key={y} value={y as unknown as string}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-600 text-xs">
                End Date*
              </Label>
              <div className="flex gap-2">
                {currentWork.end !== 'Now' && (
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
                    <SelectItem value="Now">Now</SelectItem>
                    {years.map((y) => (
                      <SelectItem key={y} value={y as unknown as string}>
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
              <Label className="text-gray-600 text-xs">
                Location
              </Label>
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
              <Label className="text-gray-600 text-xs">Link</Label>
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
            <Label className="text-gray-600 text-xs">
              Description
            </Label>
            <RichTextEditor
              content={currentWork.description || ''}
              onChange={(val) =>
                setCurrentWork({ ...currentWork, description: val })
              }
            />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 md:px-8 border-t border-gray-100 bg-white flex justify-end z-10">
            <Button
              onClick={handleSave}
              disabled={!currentWork?.title || !currentWork?.company}
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
