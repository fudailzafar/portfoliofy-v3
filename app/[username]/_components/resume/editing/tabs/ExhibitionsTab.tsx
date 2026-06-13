import React, { useMemo } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { useTabEditor } from '@/hooks/useTabEditor';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Palette } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { sortByDateDesc } from '@/lib/resume';
import { SortButtons } from '../SortButtons';
import { EditDeleteButtons } from '../EditDeleteButtons';
import { TabHeader } from '../TabHeader';
import { TabFormActions } from '../TabFormActions';
import { EmptyState } from '../EmptyState';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(
  () =>
    import('@/components/composite/RichTextEditor').then(
      (mod) => mod.RichTextEditor,
    ),
  { ssr: false },
);

export function ExhibitionsTab({
  years,
  setProjectToDelete,
}: {
  years: number[];
  setProjectToDelete: (id: string) => void;
}) {
  const resume = useResumeStore((state) => state.resume);
  const updateResume = useResumeStore((state) => state.updateResume);
  const {
    view: exhibitionsView,
    setView: setExhibitionsView,
    current: currentExhibition,
    setCurrent: setCurrentExhibition,
  } = useTabEditor<any>();

  const exhibitions = useMemo(() => resume?.exhibitions || [], [resume?.exhibitions]);
  const sortedExhibitions = useMemo(() => sortByDateDesc(exhibitions), [exhibitions]);

  if (!resume) return null;

  const handleSave = () => {
    if (!currentExhibition?.title || !currentExhibition?.year) return;

    const isEdit = !!currentExhibition.id;
    const newItem = isEdit
      ? currentExhibition
      : { ...currentExhibition, id: Date.now().toString() };

    const newItems = isEdit
      ? exhibitions.map((p: any) => (p.id === currentExhibition.id ? newItem : p))
      : [...exhibitions, newItem];

    updateResume({ exhibitions: newItems });
    setExhibitionsView('list');
    setCurrentExhibition(null);
  };

  const handleMoveUp = (currentItem: any, prevItem: any) => {
    const newItems = [...exhibitions];
    const idx1 = newItems.findIndex((i: any) => i.id === currentItem.id);
    const idx2 = newItems.findIndex((i: any) => i.id === prevItem.id);

    if (idx1 !== -1 && idx2 !== -1) {
      [newItems[idx1], newItems[idx2]] = [newItems[idx2], newItems[idx1]];
      updateResume({ exhibitions: newItems });
    }
  };

  const handleToggleVisibility = (item: any) => {
    const newItems = exhibitions.map((s: any) =>
      s.id === item.id ? { ...s, hidden: !s.hidden } : s,
    );
    updateResume({ exhibitions: newItems });
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <TabHeader
        title="Exhibitions"
        showAddButton={exhibitionsView === 'list'}
        onAdd={() => {
          setCurrentExhibition({
            title: '',
            year: currentYear.toString(),
            organization: '',
            link: '',
            location: '',
            description: '',
          });
          setExhibitionsView('form');
        }}
        addButtonText="Add exhibition"
      />

      {exhibitionsView === 'list' && exhibitions.length === 0 && (
        <EmptyState
          icon={Palette}
          buttonText="Add an exhibition"
          onClick={() => {
            setCurrentExhibition({
              title: '',
              year: currentYear.toString(),
              organization: '',
              link: '',
              location: '',
              description: '',
            });
            setExhibitionsView('form');
          }}
        />
      )}

      {exhibitionsView === 'list' && exhibitions.length > 0 && (
        <div className="space-y-8">
          {sortedExhibitions.map(
            (exhibition: any, index: number, sortedArray: any[]) => {
              const prevItem = index > 0 ? sortedArray[index - 1] : null;
              const canMoveUp =
                prevItem &&
                parseInt(exhibition.year || '0') ===
                  parseInt(prevItem.year || '0');
              const nextItem =
                index < sortedArray.length - 1 ? sortedArray[index + 1] : null;
              const canMoveDown =
                nextItem &&
                parseInt(exhibition.year || '0') ===
                  parseInt(nextItem.year || '0');

              return (
                <div
                  key={exhibition.id}
                  className="group flex flex-col gap-4 sm:flex-row sm:gap-12"
                >
                  <div className="shrink-0 pt-0.5 text-sm text-content-muted sm:w-16">
                    {exhibition.year}
                  </div>

                  <div className="flex flex-1 flex-col items-start justify-start">
                    <div className={`w-full transition-all duration-200 ${exhibition.hidden ? 'opacity-50 blur-[1px]' : ''}`}>
                      {exhibition.link ? (
                        <a
                          href={
                            exhibition.link.startsWith('http')
                              ? exhibition.link
                              : `https://${exhibition.link}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block hover:underline"
                        >
                          <span className="text-sm font-semibold text-content-primary">
                            {exhibition.title}
                            {exhibition.organization ? ` at ${exhibition.organization}` : ''}
                            <ArrowUpRight className="relative -top-0.5 ml-1 inline-block h-4 w-4 text-content-primary" />
                          </span>
                        </a>
                      ) : (
                        <p className="text-sm font-semibold text-content-primary">
                          {exhibition.title}
                          {exhibition.organization ? ` at ${exhibition.organization}` : ''}
                        </p>
                      )}

                      {exhibition.location && (
                        <div className="mt-1 text-sm text-content-muted">
                          {exhibition.location}
                        </div>
                      )}
                    </div>

                    <EditDeleteButtons
                      isHidden={exhibition.hidden}
                      onToggleVisibility={() => handleToggleVisibility(exhibition)}
                      onEdit={() => {
                        setCurrentExhibition(exhibition);
                        setExhibitionsView('form');
                      }}
                      onDelete={() => setProjectToDelete(exhibition.id)}
                    >
                      <SortButtons
                        canMoveUp={canMoveUp}
                        canMoveDown={canMoveDown}
                        onMoveUp={() => handleMoveUp(exhibition, prevItem)}
                        onMoveDown={() => handleMoveUp(exhibition, nextItem)}
                      />
                    </EditDeleteButtons>
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}

      {exhibitionsView === 'form' && currentExhibition && (
        <div className="space-y-6 pb-24">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">Title*</Label>
              <Input
                value={currentExhibition.title}
                onChange={(e) =>
                  setCurrentExhibition({
                    ...currentExhibition,
                    title: e.target.value,
                  })
                }
                placeholder="My great show"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">Year*</Label>
              <Select
                value={currentExhibition.year}
                onValueChange={(val) =>
                  setCurrentExhibition({
                    ...currentExhibition,
                    year: val,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
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
              <Label className="text-xs text-content-secondary">Organization</Label>
              <Input
                value={currentExhibition.organization || ''}
                onChange={(e) =>
                  setCurrentExhibition({
                    ...currentExhibition,
                    organization: e.target.value,
                  })
                }
                placeholder="The Vancouver Art Gallery"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">Location</Label>
              <Input
                value={currentExhibition.location || ''}
                onChange={(e) =>
                  setCurrentExhibition({
                    ...currentExhibition,
                    location: e.target.value,
                  })
                }
                placeholder="Vancouver"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-content-secondary">Link</Label>
            <Input
              value={currentExhibition.link || ''}
              onChange={(e) =>
                setCurrentExhibition({
                  ...currentExhibition,
                  link: e.target.value,
                })
              }
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-content-secondary">
              Description
            </Label>
            <RichTextEditor
              content={currentExhibition.description || ''}
              onChange={(val) =>
                setCurrentExhibition({
                  ...currentExhibition,
                  description: val,
                })
              }
            />
          </div>

          <TabFormActions
            onCancel={() => setExhibitionsView('list')}
            onSave={handleSave}
            isSaveDisabled={!currentExhibition?.title || !currentExhibition?.year}
          />
        </div>
      )}
    </div>
  );
}
