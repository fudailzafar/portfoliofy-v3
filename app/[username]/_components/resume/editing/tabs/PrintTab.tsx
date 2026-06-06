'use client';

import React from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export function PrintTab() {
  const {
    printHiddenSections,
    togglePrintSection,
    setIsEditingTab,
    setActiveTab,
  } = useResumeStore();

  React.useEffect(() => {
    setIsEditingTab(true);
    return () => setIsEditingTab(false);
  }, [setIsEditingTab]);

  const SECTIONS = [
    { id: 'summary', label: 'About' },
    { id: 'work', label: 'Work Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'side_projects', label: 'Side Projects' },
    { id: 'features', label: 'Features' },
    { id: 'volunteering', label: 'Volunteering' },
    { id: 'speaking', label: 'Speaking' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills' },
  ];

  return (
    <div className="mx-auto flex max-w-2xl flex-col pb-24">
      <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-4 dark:border-[#333]">
        <h2 className="text-2xl font-bold dark:text-gray-100">Print</h2>
      </div>

      <div className="mb-8 rounded-lg bg-gray-50 p-4 text-sm text-gray-800 dark:bg-[#1f1f1f] dark:text-gray-200">
        <span className="font-medium">Tip ✨</span> For best results we suggest
        turning off &quot;Headers and footers&quot; in your browser print
        settings.
      </div>

      <h3 className="mb-6 border-b border-gray-100 pb-2 text-xs text-gray-400 dark:border-[#333] dark:text-gray-500">
        Toggle printed sections
      </h3>

      <div className="flex-1 space-y-6">
        {SECTIONS.map((section) => {
          const isHidden = printHiddenSections.includes(section.id);
          const isOn = !isHidden;

          return (
            <div key={section.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900 dark:text-gray-100">{section.label}</p>
                <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                  {isOn ? 'On' : 'Off'}
                </p>
              </div>
              <Switch
                checked={isOn}
                onCheckedChange={() => togglePrintSection(section.id)}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-10 flex flex-none justify-end gap-3 border-t border-gray-100 bg-white p-4 md:left-64 md:px-8 dark:border-[#333] dark:bg-[#121212]">
        <Button
          onClick={() => window.print()}
          className="h-9 rounded-md border-none bg-[#2A2A2A] px-6 font-medium text-white shadow-sm hover:bg-[#1A1A1A]"
        >
          Print
        </Button>
      </div>
    </div>
  );
}
