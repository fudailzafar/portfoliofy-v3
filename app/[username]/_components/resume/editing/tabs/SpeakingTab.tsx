import React, { useState, useEffect, useMemo } from 'react';
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
import { EditDeleteButtons } from '../EditDeleteButtons';
import { TabHeader } from '../TabHeader';
import { EmptyState } from '../EmptyState';

export function SpeakingTab({
  years,
  setProjectToDelete,
}: {
  years: number[];
  setProjectToDelete: (id: string) => void;
}) {
  const resume = useResumeStore((state) => state.resume);
  const updateResume = useResumeStore((state) => state.updateResume);
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
  const sortedSpeaking = useMemo(() => sortByDateDesc(speaking), [speaking]);

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <TabHeader
        title="Speaking"
        showAddButton={speakingView === 'list'}
        onAdd={() => {
          setCurrentSpeaking({
            title: '',
            year: currentYear.toString(),
            link: '',
            location: '',
          });
          setSpeakingView('form');
        }}
        addButtonText="Add engagement"
      />

      {speakingView === 'list' && speaking.length === 0 && (
        <EmptyState
          icon={Mic}
          buttonText="Add a talk you've given"
          onClick={() => {
            setCurrentSpeaking({
              title: '',
              year: currentYear.toString(),
              link: '',
              location: '',
            });
            setSpeakingView('form');
          }}
        />
      )}

      {speakingView === 'list' && speaking.length > 0 && (
        <div className="space-y-8">
          {sortedSpeaking.map(
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
                  <div className="shrink-0 pt-0.5 text-sm text-content-muted sm:w-16">
                    {engagement.year}
                  </div>

                  <div className="flex flex-1 flex-col items-start justify-start">
                    <p className="text-base font-semibold text-content-primary">
                      {engagement.title}
                    </p>

                    {engagement.location && (
                      <div className="mt-1 line-clamp-2 text-sm text-content-muted">
                        {engagement.location}
                      </div>
                    )}

                    <EditDeleteButtons
                      onEdit={() => {
                        setCurrentSpeaking(engagement);
                        setSpeakingView('form');
                      }}
                      onDelete={() => setProjectToDelete(engagement.id)}
                    >
                      <SortButtons
                        canMoveUp={canMoveUp}
                        canMoveDown={canMoveDown}
                        onMoveUp={() => handleMoveUp(engagement, prevItem)}
                        onMoveDown={() => handleMoveUp(engagement, nextItem)}
                      />
                    </EditDeleteButtons>
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
              <Label className="text-xs text-content-secondary">Title*</Label>
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
              <Label className="text-xs text-content-secondary">Year*</Label>
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
              <Label className="text-xs text-content-secondary">Location</Label>
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
              <Label className="text-xs text-content-secondary">Link</Label>
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

          <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-end gap-3 border-t border-border-subtle bg-surface-1 p-4 md:px-8">
            <button
              onClick={() => setSpeakingView('list')}
              className="px-4 text-[14px] font-medium text-content-primary hover:underline hover:underline-offset-2"
            >
              Cancel
            </button>
            <Button
              onClick={handleSave}
              disabled={!currentSpeaking?.title || !currentSpeaking?.year}
              variant="outline"
              className="h-9 rounded-md border border-border-strong bg-surface-card px-6 font-medium text-content-primary shadow-sm"
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
