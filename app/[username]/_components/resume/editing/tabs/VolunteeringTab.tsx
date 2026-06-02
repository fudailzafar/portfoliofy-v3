import React, { useState, useEffect } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Download, HeartHandshake } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { sortByDateDesc } from '@/lib/resume';

export function VolunteeringTab({
  years,
  setProjectToDelete,
}: {
  years: number[];
  setProjectToDelete: (id: string) => void;
}) {
  const { resume, updateResume, setIsEditingTab } = useResumeStore();
  const [volunteeringView, setVolunteeringView] = useState<'list' | 'form'>(
    'list',
  );

  useEffect(() => {
    setIsEditingTab(volunteeringView === 'form');
    return () => setIsEditingTab(false);
  }, [volunteeringView, setIsEditingTab]);
  const [currentVolunteering, setCurrentVolunteering] = useState<any>(null);

  if (!resume) return null;
  const volunteering = resume.volunteering || [];

  const handleSave = () => {
    if (!currentVolunteering?.role || !currentVolunteering?.organization)
      return;

    const isEdit = !!currentVolunteering.id;
    const newItem = isEdit
      ? currentVolunteering
      : { ...currentVolunteering, id: Date.now().toString() };

    const newItems = isEdit
      ? volunteering.map((p: any) =>
          p.id === currentVolunteering.id ? newItem : p,
        )
      : [...volunteering, newItem];

    updateResume({ volunteering: newItems });
    setVolunteeringView('list');
    setCurrentVolunteering(null);
  };

  const handleMoveUp = (currentItem: any, prevItem: any) => {
    const newItems = [...volunteering];
    const idx1 = newItems.findIndex((i: any) => i.id === currentItem.id);
    const idx2 = newItems.findIndex((i: any) => i.id === prevItem.id);

    if (idx1 !== -1 && idx2 !== -1) {
      [newItems[idx1], newItems[idx2]] = [newItems[idx2], newItems[idx1]];
      updateResume({ volunteering: newItems });
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-bold">Volunteering</h2>
        {volunteeringView === 'list' && (
          <Button
            variant="secondary"
            onClick={() => {
              setCurrentVolunteering({
                role: '',
                organization: '',
                startYear: '',
                endYear: '',
                location: '',
                link: '',
              });
              setVolunteeringView('form');
            }}
            className="h-8 rounded-md border-none bg-gray-100 px-4 text-xs text-gray-900 hover:bg-gray-200"
          >
            Add volunteering
          </Button>
        )}
      </div>

      {volunteeringView === 'list' && volunteering.length === 0 && (
        <div className="mt-12 flex flex-1 flex-col items-center justify-center space-y-6 text-center opacity-80">
          <div className="rounded-full bg-gray-50 p-8">
            <HeartHandshake
              className="h-16 w-16 text-gray-400"
              strokeWidth={1}
            />
          </div>
          <Button
            variant="secondary"
            className="h-auto rounded-md border-none bg-gray-100 px-6 py-5 text-sm text-gray-900 hover:bg-gray-200"
            onClick={() => {
              setCurrentVolunteering({
                role: '',
                organization: '',
                startYear: '',
                endYear: '',
                location: '',
                link: '',
              });
              setVolunteeringView('form');
            }}
          >
            Add volunteering
          </Button>
        </div>
      )}

      {volunteeringView === 'list' && volunteering.length > 0 && (
        <div className="space-y-8">
          {sortByDateDesc(volunteering).map(
            (v: any, index: number, sortedArray: any[]) => {
              const prevItem = index > 0 ? sortedArray[index - 1] : null;
              const canMoveUp =
                prevItem &&
                parseInt(v.startYear || '0') ===
                  parseInt(prevItem.startYear || '0');
              const nextItem =
                index < sortedArray.length - 1 ? sortedArray[index + 1] : null;
              const canMoveDown =
                nextItem &&
                parseInt(v.startYear || '0') ===
                  parseInt(nextItem.startYear || '0');

              return (
                <div
                  key={v.id}
                  className="flex flex-col gap-4 sm:flex-row sm:gap-12"
                >
                  <div className="shrink-0 pt-0.5 text-sm text-gray-400 sm:w-24">
                    {v.startYear} — {v.endYear}
                  </div>

                  <div className="flex flex-1 flex-col items-start justify-start">
                    <p className="text-base font-semibold text-gray-900">
                      {v.role} at {v.organization}
                    </p>
                    {v.location && (
                      <p className="mt-0.5 text-sm text-gray-500">
                        {v.location}
                      </p>
                    )}

                    <div className="mt-3 flex items-center gap-4 text-xs font-medium text-gray-400">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentVolunteering(v);
                          setVolunteeringView('form');
                        }}
                        className="transition-colors hover:text-gray-900"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setProjectToDelete(v.id)}
                        className="transition-colors hover:text-red-600"
                      >
                        Delete
                      </button>
                      {canMoveUp && (
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleMoveUp(v, prevItem)}
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
                                onClick={() => handleMoveUp(v, nextItem)}
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

      {volunteeringView === 'form' && currentVolunteering && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Role *</Label>
              <Input
                required
                value={currentVolunteering.role}
                onChange={(e) =>
                  setCurrentVolunteering({
                    ...currentVolunteering,
                    role: e.target.value,
                  })
                }
                placeholder="e.g. Contributor"
              />
            </div>
            <div className="space-y-2">
              <Label>Organization *</Label>
              <Input
                required
                value={currentVolunteering.organization}
                onChange={(e) =>
                  setCurrentVolunteering({
                    ...currentVolunteering,
                    organization: e.target.value,
                  })
                }
                placeholder="e.g. The Internet Archive"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Year *</Label>
              <Select
                value={currentVolunteering.startYear}
                onValueChange={(val) =>
                  setCurrentVolunteering({
                    ...currentVolunteering,
                    startYear: val,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    { length: 50 },
                    (_, i) => new Date().getFullYear() - i,
                  ).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>End Year *</Label>
              <Select
                value={currentVolunteering.endYear}
                onValueChange={(val) =>
                  setCurrentVolunteering({
                    ...currentVolunteering,
                    endYear: val,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Now">Now</SelectItem>
                  <SelectItem value="Ongoing">Ongoing</SelectItem>
                  {Array.from(
                    { length: 50 },
                    (_, i) => new Date().getFullYear() - i,
                  ).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={currentVolunteering.location}
                onChange={(e) =>
                  setCurrentVolunteering({
                    ...currentVolunteering,
                    location: e.target.value,
                  })
                }
                placeholder="e.g. San Francisco, CA"
              />
            </div>
            <div className="space-y-2">
              <Label>Link to Volunteering</Label>
              <Input
                value={currentVolunteering.link || ''}
                onChange={(e) =>
                  setCurrentVolunteering({
                    ...currentVolunteering,
                    link: e.target.value,
                  })
                }
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-end border-t border-gray-100 bg-white p-4 md:px-8">
            <Button
              onClick={handleSave}
              disabled={
                !currentVolunteering?.role || !currentVolunteering?.organization
              }
              className="h-9 rounded-md border-none bg-[#2A2A2A] px-6 font-medium text-white shadow-sm hover:bg-[#1A1A1A]"
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
