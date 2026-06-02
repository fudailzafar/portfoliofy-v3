'use client';

import React, { useState, useEffect } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GraduationCap, Upload, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { sortByDateDesc } from '@/lib/resume';

export function EducationTab({
  years,
  setProjectToDelete,
}: {
  years: number[];
  setProjectToDelete: (id: string) => void;
}) {
  const { resume, updateResume, setIsEditingTab } = useResumeStore();
  const [eduView, setEduView] = useState<'list' | 'form'>('list');

  useEffect(() => {
    setIsEditingTab(eduView === 'form');
    return () => setIsEditingTab(false);
  }, [eduView, setIsEditingTab]);
  const [currentEdu, setCurrentEdu] = useState<any>(null);

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
    <div className="max-w-3xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
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
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none h-8 text-xs px-4 rounded-md"
          >
            Add education
          </Button>
        )}

      </div>

      {eduView === 'list' && education.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-80 mt-12">
          <div className="p-8 bg-gray-50 rounded-full">
            <GraduationCap className="w-16 h-16 text-gray-400" strokeWidth={1} />
          </div>
          <Button
            variant="secondary"
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none rounded-md px-6 py-5 h-auto text-sm"
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
          {sortByDateDesc(education).map((edu: any, index: number, sortedArray: any[]) => {
            const prevItem = index > 0 ? sortedArray[index - 1] : null;
            const canMoveUp = prevItem && parseInt(edu.start || '0') === parseInt(prevItem.start || '0');
            const nextItem = index < sortedArray.length - 1 ? sortedArray[index + 1] : null;
            const canMoveDown = nextItem && parseInt(edu.start || '0') === parseInt(nextItem.start || '0');
            
            return (
            <div
              key={edu.id || edu.school}
              className="flex flex-col sm:flex-row gap-4 sm:gap-12"
            >
              <div className="sm:w-32 shrink-0 text-gray-400 text-sm pt-0.5">
                {edu.start ? `${edu.start} — ${edu.end}` : edu.end}
              </div>
              <div className="flex-1 flex flex-col justify-start items-start">
                <p className="text-base font-semibold text-gray-900">
                  {edu.degree} at {edu.school}
                </p>
                {edu.location && (
                  <p className="text-sm text-gray-500 mt-1">
                    {edu.location}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-3 text-xs font-medium text-gray-400">
                  <button
                    onClick={() => {
                      setCurrentEdu(edu);
                      setEduView('form');
                    }}
                    className="hover:text-gray-900 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setProjectToDelete(edu.id)}
                    className="hover:text-red-600 transition-colors"
                  >
                    Delete
                  </button>
                  {canMoveUp && (
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleMoveUp(edu, prevItem)}
                            className="hover:text-gray-900 transition-colors"
                          >
                            <Upload className="w-[15px] h-[15px]" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-[#111] text-white text-xs px-2.5 py-1.5 rounded-md border-none font-medium mb-1">
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
                            onClick={() => handleMoveUp(edu, nextItem)}
                            className="hover:text-gray-900 transition-colors"
                          >
                            <Download className="w-[15px] h-[15px]" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-[#111] text-white text-xs px-2.5 py-1.5 rounded-md border-none font-medium mb-1">
                          Move down
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </div>
          )})}
        </div>
      )}

      {eduView === 'form' && currentEdu && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-600 text-xs">School*</Label>
              <Input
                value={currentEdu.school}
                onChange={(e) => setCurrentEdu({ ...currentEdu, school: e.target.value })}
                placeholder="Rhode Island School of Design"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600 text-xs">Degree*</Label>
              <Input
                value={currentEdu.degree}
                onChange={(e) => setCurrentEdu({ ...currentEdu, degree: e.target.value })}
                placeholder="Bachelor's in Graphic Design"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-600 text-xs">Start Year</Label>
              <Select
                value={currentEdu.start || ''}
                onValueChange={(val) =>
                  setCurrentEdu({ ...currentEdu, start: val === 'none' ? '' : val })
                }
              >
                <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600 text-xs">End Year*</Label>
              <Select
                value={currentEdu.end || ''}
                onValueChange={(val) => setCurrentEdu({ ...currentEdu, end: val })}
              >
                <SelectTrigger><SelectValue placeholder="Year" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Present">Present</SelectItem>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-600 text-xs">Location</Label>
              <Input
                value={currentEdu.location || ''}
                onChange={(e) => setCurrentEdu({ ...currentEdu, location: e.target.value })}
                placeholder="Providence, RI"
              />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 md:px-8 border-t border-gray-100 bg-white flex justify-end z-10">
            <Button
              onClick={handleSave}
              disabled={!currentEdu?.school || !currentEdu?.degree}
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
