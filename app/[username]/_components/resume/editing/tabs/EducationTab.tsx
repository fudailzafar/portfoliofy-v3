'use client';

import { SortButtons } from '../SortButtons';
import { EditDeleteButtons } from '../EditDeleteButtons';
import { TabHeader } from '../TabHeader';
import { TabFormActions } from '../TabFormActions';
import { EmptyState } from '../EmptyState';
import React, { useState, useEffect, useMemo } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { useTabEditor } from '@/hooks/useTabEditor';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sortByDateDesc } from '@/lib/resume';
import { RichTextEditor } from '@/components/composite/RichTextEditor';

export function EducationTab({
  years,
  setProjectToDelete,
}: {
  years: number[];
  setProjectToDelete: (id: string) => void;
}) {
  const resume = useResumeStore((state) => state.resume);
  const updateResume = useResumeStore((state) => state.updateResume);
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
  const sortedEducation = useMemo(() => sortByDateDesc(education), [education]);

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <TabHeader
        title="Education"
        showAddButton={eduView === 'list'}
        onAdd={() => {
          setCurrentEdu({
            school: '',
            degree: '',
            start: currentYear.toString(),
            end: 'Now',
            location: '',
            description: '',
          });
          setEduView('form');
        }}
        addButtonText="Add education"
      />

      {eduView === 'list' && education.length === 0 && (
        <EmptyState
          icon={GraduationCap}
          buttonText="Add education"
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
        />
      )}

      {eduView === 'list' && education.length > 0 && (
        <div className="space-y-8">
          {sortedEducation.map(
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
                  <div className="shrink-0 pt-0.5 text-sm text-content-muted sm:w-32">
                    {edu.start ? `${edu.start} — ${edu.end}` : edu.end}
                  </div>
                  <div className="flex flex-1 flex-col items-start justify-start">
                    <p className="text-sm font-semibold text-content-primary">
                      {edu.degree} at {edu.school}
                    </p>
                    {edu.location && (
                      <p className="mt-1 text-sm text-content-muted">
                        {edu.location}
                      </p>
                    )}
                    {edu.description && edu.description !== '<p></p>' && (
                      <div
                        className="prose prose-sm prose-p:my-1 prose-ul:my-1 prose-p:text-content-muted prose-ul:text-content-muted prose-li:text-content-muted prose-strong:text-content-primary mt-4 max-w-none text-sm leading-relaxed text-content-muted"
                        dangerouslySetInnerHTML={{
                          __html: edu.description,
                        }}
                      />
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
              <Label className="text-xs text-content-secondary">School*</Label>
              <Input
                value={currentEdu.school}
                onChange={(e) =>
                  setCurrentEdu({ ...currentEdu, school: e.target.value })
                }
                placeholder="Rhode Island School of Design"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">Degree*</Label>
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
              <Label className="text-xs text-content-secondary">Start Year</Label>
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
              <Label className="text-xs text-content-secondary">End Year*</Label>
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
              <Label className="text-xs text-content-secondary">Location</Label>
              <Input
                value={currentEdu.location || ''}
                onChange={(e) =>
                  setCurrentEdu({ ...currentEdu, location: e.target.value })
                }
                placeholder="Providence, RI"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-content-secondary">Description</Label>
            <RichTextEditor
              content={currentEdu.description || ''}
              onChange={(val) =>
                setCurrentEdu({
                  ...currentEdu,
                  description: val,
                })
              }
            />
          </div>

          <TabFormActions
            onCancel={() => setEduView('list')}
            onSave={handleSave}
            isSaveDisabled={!currentEdu?.school || !currentEdu?.degree || !currentEdu?.startYear || !currentEdu?.endYear}
          />
        </div>
      )}
    </div>
  );
}
