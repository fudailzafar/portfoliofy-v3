import React, { useState, useEffect } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { useTabEditor } from '@/hooks/useTabEditor';
import { SortButtons } from '../SortButtons';
import { EditDeleteButtons } from '../EditDeleteButtons';
import { TabHeader } from '../TabHeader';
import { EmptyState } from '../EmptyState';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Download, HeartHandshake } from 'lucide-react';
import { sortByDateDesc } from '@/lib/resume';

export function VolunteeringTab({
  years,
  setProjectToDelete,
}: {
  years: number[];
  setProjectToDelete: (id: string) => void;
}) {
  const resume = useResumeStore((state) => state.resume);
  const updateResume = useResumeStore((state) => state.updateResume);
  const {
    view: volunteeringView,
    setView: setVolunteeringView,
    current: currentVolunteering,
    setCurrent: setCurrentVolunteering,
  } = useTabEditor<any>();

  if (!resume) return null;
  const volunteering = resume.volunteering || [];

  const handleSave = () => {
    if (!currentVolunteering?.role || !currentVolunteering?.organization)
      return;

    const isEdit = !!currentVolunteering.id;
    const newItem = isEdit
      ? currentVolunteering
      : { ...currentVolunteering, id: Date.now().toString() };

    const newItems = isEdit
      ? volunteering.map((p: any) =>
          p.id === currentVolunteering.id ? newItem : p,
        )
      : [...volunteering, newItem];

    updateResume({ volunteering: newItems });
    setVolunteeringView('list');
    setCurrentVolunteering(null);
  };

  const handleMoveUp = (currentItem: any, prevItem: any) => {
    const newItems = [...volunteering];
    const idx1 = newItems.findIndex((i: any) => i.id === currentItem.id);
    const idx2 = newItems.findIndex((i: any) => i.id === prevItem.id);

    if (idx1 !== -1 && idx2 !== -1) {
      [newItems[idx1], newItems[idx2]] = [newItems[idx2], newItems[idx1]];
      updateResume({ volunteering: newItems });
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <TabHeader
        title="Volunteering"
        showAddButton={volunteeringView === 'list'}
        onAdd={() => {
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
        addButtonText="Add volunteering"
      />

      {volunteeringView === 'list' && volunteering.length === 0 && (
        <EmptyState
          icon={HeartHandshake}
          buttonText="Add volunteering"
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
        />
      )}

      {volunteeringView === 'list' && volunteering.length > 0 && (
        <div className="space-y-8">
          {sortByDateDesc(volunteering).map(
            (v: any, index: number, sortedArray: any[]) => {
              const prevItem = index > 0 ? sortedArray[index - 1] : null;
              const canMoveUp =
                prevItem &&
                parseInt(v.startYear || '0') ===
                  parseInt(prevItem.startYear || '0');
              const nextItem =
                index < sortedArray.length - 1 ? sortedArray[index + 1] : null;
              const canMoveDown =
                nextItem &&
                parseInt(v.startYear || '0') ===
                  parseInt(nextItem.startYear || '0');

              return (
                <div
                  key={v.id}
                  className="flex flex-col gap-4 sm:flex-row sm:gap-12"
                >
                  <div className="shrink-0 pt-0.5 text-sm text-content-muted sm:w-24">
                    {v.startYear} — {v.endYear}
                  </div>

                  <div className="flex flex-1 flex-col items-start justify-start">
                    <p className="text-base font-semibold text-content-primary">
                      {v.role} at {v.organization}
                    </p>
                    {v.location && (
                      <p className="mt-0.5 text-sm text-content-muted">
                        {v.location}
                      </p>
                    )}

                    <EditDeleteButtons
                      onEdit={() => {
                        setCurrentVolunteering(v);
                        setVolunteeringView('form');
                      }}
                      onDelete={() => setProjectToDelete(v.id)}
                    >
                      <SortButtons
                        canMoveUp={canMoveUp}
                        canMoveDown={canMoveDown}
                        onMoveUp={() => handleMoveUp(v, prevItem)}
                        onMoveDown={() => handleMoveUp(v, nextItem)}
                      />
                    </EditDeleteButtons>
                  </div>
                </div>
              );
            },
          )}
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

          <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-end gap-3 border-t border-border-subtle bg-surface-1 p-4 md:px-8">
            <button
              onClick={() => setVolunteeringView('list')}
              className="px-4 text-[14px] font-medium text-content-primary hover:underline hover:underline-offset-2"
            >
              Cancel
            </button>
            <Button
              onClick={handleSave}
              disabled={
                !currentVolunteering?.role || !currentVolunteering?.organization
              }
              variant="outline"
              className="h-9 rounded-md border border-border-strong bg-surface-card px-6 font-medium text-content-primary shadow-sm"
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
