import React, { useState } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function SkillsTab() {
  const resume = useResumeStore((state) => state.resume);
  const updateHeader = useResumeStore((state) => state.updateHeader);
  const [skillInput, setSkillInput] = useState('');

  if (!resume) return null;
  const skills = resume.header?.skills || [];

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      updateHeader({ skills: [...skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (indexToRemove: number) => {
    updateHeader({ skills: skills.filter((_, i) => i !== indexToRemove) });
  };

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <div className="mb-8 flex items-center justify-between border-b border-border-subtle pb-4">
        <h2 className="text-2xl font-bold">Skills</h2>
      </div>

      <div className="space-y-6">
        <div className="flex gap-3">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSkill();
              }
            }}
            placeholder="e.g. Software Development"
            className="flex-1"
          />
          <Button
            onClick={handleAddSkill}
            variant="secondary"
            className="border-none bg-surface-2 px-6 text-content-primary hover:bg-surface-3"
          >
            Add
          </Button>
        </div>

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="bg-surface-2/80 flex items-center rounded-full px-3 py-1.5 text-sm text-content-primary"
              >
                <span className="mr-2">{skill}</span>
                <button
                  onClick={() => handleRemoveSkill(index)}
                  className="flex items-center justify-center rounded-full text-content-muted transition-colors hover:text-content-secondary focus:outline-none"
                  aria-label={`Remove ${skill}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
