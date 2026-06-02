'use client';

import React from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export function PrintTab() {
  const { printHiddenSections, togglePrintSection, setIsEditingTab } = useResumeStore();

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
    <div className="max-w-2xl mx-auto flex flex-col pb-24">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <h2 className="text-2xl font-bold">Print</h2>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-8 text-sm text-gray-800">
        <span className="font-semibold">Tip ✨</span> For best results we suggest turning off &quot;Headers and footers&quot; in your browser print settings.
      </div>

      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-6 pb-2 border-b border-gray-100">
        Toggle printed sections
      </h3>

      <div className="space-y-6 flex-1">
        {SECTIONS.map((section) => {
          const isHidden = printHiddenSections.includes(section.id);
          const isOn = !isHidden;

          return (
            <div key={section.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{section.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{isOn ? 'On' : 'Off'}</p>
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

      <div className="fixed bottom-0 right-0 left-0 md:left-64 p-4 bg-white border-t border-gray-100 flex justify-end gap-3 z-10">
        <Button variant="ghost" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button onClick={() => window.print()} className="bg-white text-gray-900 border border-gray-200 hover:bg-gray-50">
          Print
        </Button>
      </div>
    </div>
  );
}
