'use client';

import React from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

export function PrintTab() {
  const printHiddenSections = useResumeStore(
    (state) => state.printHiddenSections,
  );
  const togglePrintSection = useResumeStore(
    (state) => state.togglePrintSection,
  );
  React.useEffect(() => {
    // No longer setting isEditingTab so the main ProfileContent action bar is used
  }, []);

  const SECTIONS = [
    { id: 'summary', label: 'About' },
    { id: 'work', label: 'Work Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'side_projects', label: 'Side Projects' },
    { id: 'features', label: 'Features' },
    { id: 'volunteering', label: 'Volunteering' },
    { id: 'speaking', label: 'Speaking' },
    { id: 'writing', label: 'Writing' },
    { id: 'exhibitions', label: 'Exhibitions' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills' },
    { id: 'awards', label: 'Awards' },
    { id: 'certifications', label: 'Certifications' },
  ];

  return (
    <div className="mx-auto flex max-w-2xl flex-col pb-24">
      <div className="mb-8 flex items-center justify-between border-b border-border-subtle pb-4">
        <h2 className="text-xl sm:text-2xl font-bold">Print</h2>
      </div>

      <div className="mb-4 rounded-lg bg-surface-2 p-4 text-sm text-content-primary">
        <span className="font-medium">Tip ✨</span> For best results we suggest
        turning off &quot;Headers and footers&quot; in your browser print
        settings.
      </div>

      <h3 className="border-b border-border-subtle pb-2 text-xs text-content-muted dark:text-content-muted">
        Toggle printed sections
      </h3>

      <div className="flex flex-1 flex-col">
        {SECTIONS.map((section) => {
          const isHidden = printHiddenSections.includes(section.id);
          const isOn = !isHidden;

          return (
            <div
              key={section.id}
              className="flex items-center justify-between border-b border-border-subtle py-4"
            >
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
    </div>
  );
}
