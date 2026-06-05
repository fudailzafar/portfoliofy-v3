import React, { useState, useEffect } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { useTabEditor } from '@/hooks/useTabEditor';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';
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
import { SortButtons } from '../SortButtons';

export function SpeakingTab({
  years,
  setProjectToDelete,
}: {
  years: number[];
  setProjectToDelete: (id: string) => void;
}) {
  const { resume, updateResume } = useResumeStore();
  const {
    view: speakingView,
    setView: setSpeakingView,
    current: currentSpeaking,
    setCurrent: setCurrentSpeaking,
  } = useTabEditor<any>();

  if (!resume) return null;
  const speaking = resume.speaking || [];

  const handleSave = () => {
    if (!currentSpeaking?.title || !currentSpeaking?.year) return;

    const isEdit = !!currentSpeaking.id;
    const newItem = isEdit
      ? currentSpeaking
      : { ...currentSpeaking, id: Date.now().toString() };

    const newItems = isEdit
      ? speaking.map((p: any) => (p.id === currentSpeaking.id ? newItem : p))
      : [...speaking, newItem];

    updateResume({ speaking: newItems });
    setSpeakingView('list');
    setCurrentSpeaking(null);
  };

  const handleMoveUp = (currentItem: any, prevItem: any) => {
    const newItems = [...speaking];
    const idx1 = newItems.findIndex((i: any) => i.id === currentItem.id);
    const idx2 = newItems.findIndex((i: any) => i.id === prevItem.id);

    if (idx1 !== -1 && idx2 !== -1) {
      [newItems[idx1], newItems[idx2]] = [newItems[idx2], newItems[idx1]];
      updateResume({ speaking: newItems });
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-bold">Speaking</h2>
        {speakingView === 'list' && (
          <Button
            variant="secondary"
            onClick={() => {
              setCurrentSpeaking({
                title: '',
                year: currentYear.toString(),
                link: '',
                location: '',
              });
              setSpeakingView('form');
            }}
            className="h-8 rounded-md border-none bg-gray-100 px-4 text-xs text-gray-900 hover:bg-gray-200"
          >
            Add engagement
          </Button>
        )}
      </div>

      {speakingView === 'list' && speaking.length === 0 && (
        <div className="mt-12 flex flex-1 flex-col items-center justify-center space-y-6 text-center opacity-80">
          <div className="rounded-full bg-gray-50 p-8">
            <Mic className="h-16 w-16 text-gray-400" strokeWidth={1} />
          </div>
          <Button
            variant="secondary"
            className="h-auto rounded-md border-none bg-gray-100 px-6 py-5 text-sm text-gray-900 hover:bg-gray-200"
            onClick={() => {
              setCurrentSpeaking({
                title: '',
                year: currentYear.toString(),
                link: '',
                location: '',
              });
              setSpeakingView('form');
            }}
          >
            Add a talk you've given
          </Button>
        </div>
      )}

      {speakingView === 'list' && speaking.length > 0 && (
        <div className="space-y-8">
          {sortByDateDesc(speaking).map(
            (engagement: any, index: number, sortedArray: any[]) => {
              const prevItem = index > 0 ? sortedArray[index - 1] : null;
              const canMoveUp =
                prevItem &&
                parseInt(engagement.year || '0') ===
                  parseInt(prevItem.year || '0');
              const nextItem =
                index < sortedArray.length - 1 ? sortedArray[index + 1] : null;
              const canMoveDown =
                nextItem &&
                parseInt(engagement.year || '0') ===
                  parseInt(nextItem.year || '0');

              return (
                <div
                  key={engagement.id}
                  className="flex flex-col gap-4 sm:flex-row sm:gap-12"
                >
                  <div className="shrink-0 pt-0.5 text-sm text-gray-400 sm:w-16">
                    {engagement.year}
                  </div>

                  <div className="flex flex-1 flex-col items-start justify-start">
                    <p className="text-base font-semibold text-gray-900">
                      {engagement.title}
                    </p>

                    {engagement.location && (
                      <div className="mt-1 line-clamp-2 text-sm text-gray-500">
                        {engagement.location}
                      </div>
                    )}

                    <div className="mt-3 flex items-center gap-4 text-xs font-medium text-gray-400">
                      <button
                        onClick={() => {
                          setCurrentSpeaking(engagement);
                          setSpeakingView('form');
                        }}
                        className="transition-colors hover:text-gray-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setProjectToDelete(engagement.id)}
                        className="transition-colors hover:text-red-600"
                      >
                        Delete
                      </button>
                      <SortButtons
                        canMoveUp={canMoveUp}
                        canMoveDown={canMoveDown}
                        onMoveUp={() => handleMoveUp(engagement, prevItem)}
                        onMoveDown={() => handleMoveUp(engagement, nextItem)}
                      />
                    </div>
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}

      {speakingView === 'form' && currentSpeaking && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Title*</Label>
              <Input
                value={currentSpeaking.title}
                onChange={(e) =>
                  setCurrentSpeaking({
                    ...currentSpeaking,
                    title: e.target.value,
                  })
                }
                placeholder="React Conf 2024"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Year*</Label>
              <Select
                value={currentSpeaking.year}
                onValueChange={(val) =>
                  setCurrentSpeaking({
                    ...currentSpeaking,
                    year: val,
                  })
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

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Location</Label>
              <Input
                value={currentSpeaking.location || ''}
                onChange={(e) =>
                  setCurrentSpeaking({
                    ...currentSpeaking,
                    location: e.target.value,
                  })
                }
                placeholder="Las Vegas, NV"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Link</Label>
              <Input
                value={currentSpeaking.link || ''}
                onChange={(e) =>
                  setCurrentSpeaking({
                    ...currentSpeaking,
                    link: e.target.value,
                  })
                }
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-end gap-3 border-t border-gray-100 bg-white p-4 md:px-8">
            <button
              onClick={() => setSpeakingView('list')}
              className="px-4 text-[14px] font-medium text-black hover:underline hover:underline-offset-2"
            >
              Cancel
            </button>
            <Button
              onClick={handleSave}
              disabled={!currentSpeaking?.title || !currentSpeaking?.year}
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
