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
    { id: 'volunteering', label: 'Exhibitions' },
    { id: 'speaking', label: 'Speaking' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills' },
  ];

  return (
    <div className="mx-auto flex max-w-2xl flex-col pb-24">
      <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-bold">Print</h2>
      </div>

      <div className="mb-8 rounded-lg bg-gray-50 p-4 text-sm text-gray-800">
        <span className="font-medium">Tip ✨</span> For best results we suggest
        turning off &quot;Headers and footers&quot; in your browser print
        settings.
      </div>

      <h3 className="mb-6 border-b border-gray-100 pb-2 text-xs text-gray-400">
        Toggle printed sections
      </h3>

      <div className="flex-1 space-y-6">
        {SECTIONS.map((section) => {
          const isHidden = printHiddenSections.includes(section.id);
          const isOn = !isHidden;

          return (
            <div key={section.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-900">{section.label}</p>
                <p className="mt-0.5 text-xs text-gray-400">
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

      <div className="fixed bottom-0 left-0 right-0 z-10 flex justify-end gap-3 border-t border-gray-100 bg-white p-4 md:left-64">
        <Button variant="ghost" onClick={() => setActiveTab('general')}>
          Cancel
        </Button>
        <Button
          onClick={() => window.print()}
          className="border border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
        >
          Print
        </Button>
      </div>
    </div>
  );
}
