'use client';

import { SortButtons } from '../SortButtons';
import { EditDeleteButtons } from '../EditDeleteButtons';
import React, { useState, useEffect } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { useTabEditor } from '@/hooks/useTabEditor';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GraduationCap, Upload, Download } from 'lucide-react';
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

export function EducationTab({
  years,
  setProjectToDelete,
}: {
  years: number[];
  setProjectToDelete: (id: string) => void;
}) {
  const { resume, updateResume } = useResumeStore();
  const {
    view: eduView,
    setView: setEduView,
    current: currentEdu,
    setCurrent: setCurrentEdu,
  } = useTabEditor<any>();

  if (!resume) return null;
  const education = resume.education || [];

  const handleSave = () => {
    if (!currentEdu?.school || !currentEdu?.degree) return;

    const isEdit = !!currentEdu.id;
    const newItem = isEdit
      ? currentEdu
      : { ...currentEdu, id: Date.now().toString() };

    const newItems = isEdit
      ? education.map((p: any) => (p.id === currentEdu.id ? newItem : p))
      : [...education, newItem];

    updateResume({ education: newItems });
    setEduView('list');
    setCurrentEdu(null);
  };

  const handleMoveUp = (currentItem: any, prevItem: any) => {
    const newItems = [...education];
    const idx1 = newItems.findIndex((i: any) => i.id === currentItem.id);
    const idx2 = newItems.findIndex((i: any) => i.id === prevItem.id);

    if (idx1 !== -1 && idx2 !== -1) {
      [newItems[idx1], newItems[idx2]] = [newItems[idx2], newItems[idx1]];
      updateResume({ education: newItems });
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-bold">Education</h2>
        {eduView === 'list' && (
          <Button
            variant="secondary"
            onClick={() => {
              setCurrentEdu({
                school: '',
                degree: '',
                start: currentYear.toString(),
                end: 'Now',
                location: '',
              });
              setEduView('form');
            }}
            className="h-8 rounded-md border-none bg-gray-100 px-4 text-xs text-gray-900 hover:bg-gray-200"
          >
            Add education
          </Button>
        )}
      </div>

      {eduView === 'list' && education.length === 0 && (
        <div className="mt-12 flex flex-1 flex-col items-center justify-center space-y-6 text-center opacity-80">
          <div className="rounded-full bg-gray-50 p-8">
            <GraduationCap
              className="h-16 w-16 text-gray-400"
              strokeWidth={1}
            />
          </div>
          <Button
            variant="secondary"
            className="h-auto rounded-md border-none bg-gray-100 px-6 py-5 text-sm text-gray-900 hover:bg-gray-200"
            onClick={() => {
              setCurrentEdu({
                school: '',
                degree: '',
                start: currentYear.toString(),
                end: 'Now',
                location: '',
              });
              setEduView('form');
            }}
          >
            Add a school you attended
          </Button>
        </div>
      )}

      {eduView === 'list' && education.length > 0 && (
        <div className="space-y-8">
          {sortByDateDesc(education).map(
            (edu: any, index: number, sortedArray: any[]) => {
              const prevItem = index > 0 ? sortedArray[index - 1] : null;
              const canMoveUp =
                prevItem &&
                parseInt(edu.start || '0') === parseInt(prevItem.start || '0');
              const nextItem =
                index < sortedArray.length - 1 ? sortedArray[index + 1] : null;
              const canMoveDown =
                nextItem &&
                parseInt(edu.start || '0') === parseInt(nextItem.start || '0');

              return (
                <div
                  key={edu.id || edu.school}
                  className="flex flex-col gap-4 sm:flex-row sm:gap-12"
                >
                  <div className="shrink-0 pt-0.5 text-sm text-gray-400 sm:w-32">
                    {edu.start ? `${edu.start} — ${edu.end}` : edu.end}
                  </div>
                  <div className="flex flex-1 flex-col items-start justify-start">
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {edu.degree} at {edu.school}
                    </p>
                    {edu.location && (
                      <p className="mt-1 text-sm text-gray-500">
                        {edu.location}
                      </p>
                    )}
                    <EditDeleteButtons
                      onEdit={() => {
                        setCurrentEdu(edu);
                        setEduView('form');
                      }}
                      onDelete={() => setProjectToDelete(edu.id)}
                    >
                      <SortButtons
                        canMoveUp={canMoveUp}
                        canMoveDown={canMoveDown}
                        onMoveUp={() => handleMoveUp(edu, prevItem)}
                        onMoveDown={() => handleMoveUp(edu, nextItem)}
                      />
                    </EditDeleteButtons>
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}

      {eduView === 'form' && currentEdu && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">School*</Label>
              <Input
                value={currentEdu.school}
                onChange={(e) =>
                  setCurrentEdu({ ...currentEdu, school: e.target.value })
                }
                placeholder="Rhode Island School of Design"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Degree*</Label>
              <Input
                value={currentEdu.degree}
                onChange={(e) =>
                  setCurrentEdu({ ...currentEdu, degree: e.target.value })
                }
                placeholder="Bachelor's in Graphic Design"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Start Year</Label>
              <Select
                value={currentEdu.start || ''}
                onValueChange={(val) =>
                  setCurrentEdu({
                    ...currentEdu,
                    start: val === 'none' ? '' : val,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">End Year*</Label>
              <Select
                value={currentEdu.end || ''}
                onValueChange={(val) =>
                  setCurrentEdu({ ...currentEdu, end: val })
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

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Location</Label>
              <Input
                value={currentEdu.location || ''}
                onChange={(e) =>
                  setCurrentEdu({ ...currentEdu, location: e.target.value })
                }
                placeholder="Providence, RI"
              />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-end gap-3 border-t border-gray-100 bg-white p-4 md:px-8 dark:border-[#333] dark:bg-[#121212]">
            <button
              onClick={() => setEduView('list')}
              className="px-4 text-[14px] font-medium text-black hover:underline hover:underline-offset-2 dark:text-gray-200"
            >
              Cancel
            </button>
            <Button
              onClick={handleSave}
              disabled={!currentEdu?.school || !currentEdu?.degree}
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
