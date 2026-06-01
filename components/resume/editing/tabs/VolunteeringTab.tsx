import React, { useState, useEffect } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sortByDateDesc } from '@/lib/resume';

export function VolunteeringTab({ 
  years, 
  setProjectToDelete 
}: { 
  years: number[], 
  setProjectToDelete: (id: string) => void 
}) {
  const { resume, updateResume, setIsEditingTab } = useResumeStore();
  const [volunteeringView, setVolunteeringView] = useState<'list' | 'form'>('list');

  useEffect(() => {
    setIsEditingTab(volunteeringView === 'form');
    return () => setIsEditingTab(false);
  }, [volunteeringView, setIsEditingTab]);
  const [currentVolunteering, setCurrentVolunteering] = useState<any>(null);

  if (!resume) return null;
  const volunteering = resume.volunteering || [];

  const handleSave = () => {
    if (!currentVolunteering?.role || !currentVolunteering?.organization) return;
    
    const isEdit = !!currentVolunteering.id;
    const newItem = isEdit
      ? currentVolunteering
      : { ...currentVolunteering, id: Date.now().toString() };

    const newItems = isEdit
      ? volunteering.map((p: any) => (p.id === currentVolunteering.id ? newItem : p))
      : [...volunteering, newItem];

    updateResume({ volunteering: newItems });
    setVolunteeringView('list');
    setCurrentVolunteering(null);
  };

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <h2 className="text-2xl font-bold">Volunteering</h2>
        {volunteeringView === 'list' && (
          <Button
            variant="secondary"
            onClick={() => {
              setCurrentVolunteering({
                role: '',
                organization: '',
                startYear: '',
                endYear: '',
                location: '',
                link: '',
              });
              setVolunteeringView('form');
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none h-8 text-xs px-4 rounded-md"
          >
            Add volunteering
          </Button>
        )}

      </div>

      {volunteeringView === 'list' && volunteering.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            No volunteering entries added yet.
          </p>
          <Button
            type="button"
            onClick={() => {
              setCurrentVolunteering({
                role: '',
                organization: '',
                startYear: '',
                endYear: '',
                location: '',
                link: '',
              });
              setVolunteeringView('form');
            }}
          >
            Add volunteering
          </Button>
        </div>
      )}

      {volunteeringView === 'list' && volunteering.length > 0 && (
        <div className="space-y-8">
          {sortByDateDesc(volunteering).map((v: any) => (
            <div
              key={v.id}
              className="flex flex-col sm:flex-row gap-4 sm:gap-12"
            >
              <div className="sm:w-24 shrink-0 text-gray-400 text-sm pt-0.5">
                {v.startYear} — {v.endYear}
              </div>

              <div className="flex-1 flex flex-col justify-start items-start">
                <p className="text-base font-semibold text-gray-900">
                  {v.role} at {v.organization}
                </p>
                {v.location && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {v.location}
                  </p>
                )}

                <div className="flex items-center gap-4 mt-3 text-xs font-medium text-gray-400">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentVolunteering(v);
                      setVolunteeringView('form');
                    }}
                    className="hover:text-gray-900 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setProjectToDelete(v.id)}
                    className="hover:text-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {volunteeringView === 'form' && currentVolunteering && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Role *</Label>
              <Input
                required
                value={currentVolunteering.role}
                onChange={(e) =>
                  setCurrentVolunteering({
                    ...currentVolunteering,
                    role: e.target.value,
                  })
                }
                placeholder="e.g. Contributor"
              />
            </div>
            <div className="space-y-2">
              <Label>Organization *</Label>
              <Input
                required
                value={currentVolunteering.organization}
                onChange={(e) =>
                  setCurrentVolunteering({
                    ...currentVolunteering,
                    organization: e.target.value,
                  })
                }
                placeholder="e.g. The Internet Archive"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Year *</Label>
              <Select
                value={currentVolunteering.startYear}
                onValueChange={(val) =>
                  setCurrentVolunteering({
                    ...currentVolunteering,
                    startYear: val,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    { length: 50 },
                    (_, i) => new Date().getFullYear() - i,
                  ).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>End Year *</Label>
              <Select
                value={currentVolunteering.endYear}
                onValueChange={(val) =>
                  setCurrentVolunteering({
                    ...currentVolunteering,
                    endYear: val,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Now">Now</SelectItem>
                  <SelectItem value="Ongoing">Ongoing</SelectItem>
                  {Array.from(
                    { length: 50 },
                    (_, i) => new Date().getFullYear() - i,
                  ).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={currentVolunteering.location}
                onChange={(e) =>
                  setCurrentVolunteering({
                    ...currentVolunteering,
                    location: e.target.value,
                  })
                }
                placeholder="e.g. San Francisco, CA"
              />
            </div>
            <div className="space-y-2">
              <Label>Link to Volunteering</Label>
              <Input
                value={currentVolunteering.link || ''}
                onChange={(e) =>
                  setCurrentVolunteering({
                    ...currentVolunteering,
                    link: e.target.value,
                  })
                }
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 md:px-8 border-t border-gray-100 bg-white flex justify-end z-10">
            <Button
              onClick={handleSave}
              disabled={!currentVolunteering?.role || !currentVolunteering?.organization}
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
