'use client';

import React from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export function PrintTab() {
  const printHiddenSections = useResumeStore((state) => state.printHiddenSections);
  const togglePrintSection = useResumeStore((state) => state.togglePrintSection);
  const setIsEditingTab = useResumeStore((state) => state.setIsEditingTab);

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
      <div className="mb-8 flex items-center justify-between border-b border-border-subtle pb-4">
        <h2 className="text-2xl font-bold">Print</h2>
      </div>

      <div className="mb-8 rounded-lg bg-surface-2 p-4 text-sm text-content-primary">
        <span className="font-medium">Tip ✨</span> For best results we suggest
        turning off &quot;Headers and footers&quot; in your browser print
        settings.
      </div>

      <h3 className="mb-6 border-b border-border-subtle pb-2 text-xs text-content-muted dark:text-content-muted">
        Toggle printed sections
      </h3>

      <div className="flex-1 space-y-6">
        {SECTIONS.map((section) => {
          const isHidden = printHiddenSections.includes(section.id);
          const isOn = !isHidden;

          return (
            <div key={section.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-content-primary">{section.label}</p>
                <p className="mt-0.5 text-xs text-content-muted dark:text-content-muted">
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

      <div className="fixed bottom-0 left-0 right-0 z-10 flex flex-none justify-end gap-3 border-t border-border-subtle bg-surface-1 p-4 md:left-64 md:px-8">
        <Button
          onClick={() => window.print()}
          className="h-9 rounded-md border-none bg-[#2A2A2A] px-6 font-medium text-surface-1 shadow-sm hover:bg-[#1A1A1A]"
        >
          Print
        </Button>
      </div>
    </div>
  );
}
