import React, { useMemo } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { useTabEditor } from '@/hooks/useTabEditor';
import { SortButtons } from '../SortButtons';
import { EditDeleteButtons } from '../EditDeleteButtons';
import { TabHeader } from '../TabHeader';
import { TabFormActions } from '../TabFormActions';
import { EmptyState } from '../EmptyState';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import dynamic from 'next/dynamic';
const RichTextEditor = dynamic(
  () =>
    import('@/components/composite/RichTextEditor').then(
      (mod) => mod.RichTextEditor,
    ),
  { ssr: false },
);
import { Briefcase, ArrowUpRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sortByDateDesc } from '@/lib/resume';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function WorkExperienceTab({
  years,
  setProjectToDelete,
}: {
  years: number[];
  setProjectToDelete: (id: string) => void;
}) {
  const resume = useResumeStore((state) => state.resume);
  const updateResume = useResumeStore((state) => state.updateResume);
  const {
    view: workView,
    setView: setWorkView,
    current: currentWork,
    setCurrent: setCurrentWork,
  } = useTabEditor<any>();

  const work = useMemo(
    () => resume?.workExperience || [],
    [resume?.workExperience],
  );
  const sortedWork = useMemo(() => sortByDateDesc(work), [work]);

  if (!resume) return null;

  const handleSave = () => {
    if (!currentWork?.title || !currentWork?.company) return;

    const isEdit = !!currentWork.id;
    const newItem = isEdit
      ? currentWork
      : { ...currentWork, id: Date.now().toString() };

    const newItems = isEdit
      ? work.map((p: any) => (p.id === currentWork.id ? newItem : p))
      : [...work, newItem];

    updateResume({ workExperience: newItems });
    setWorkView('list');
    setCurrentWork(null);
  };

  const handleMoveUp = (currentItem: any, prevItem: any) => {
    const newItems = [...work];
    const idx1 = newItems.findIndex((i: any) => i.id === currentItem.id);
    const idx2 = newItems.findIndex((i: any) => i.id === prevItem.id);

    if (idx1 !== -1 && idx2 !== -1) {
      [newItems[idx1], newItems[idx2]] = [newItems[idx2], newItems[idx1]];
      updateResume({ workExperience: newItems });
    }
  };

  const handleToggleVisibility = (item: any) => {
    const newItems = work.map((w: any) =>
      w.id === item.id ? { ...w, hidden: !w.hidden } : w,
    );
    updateResume({ workExperience: newItems });
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="mx-auto flex max-w-3xl flex-col pb-24">
      <TabHeader
        title="Work Experience"
        showAddButton={workView === 'list'}
        onAdd={() => {
          setCurrentWork({
            company: '',
            title: '',
            startMonth: '',
            start: currentYear.toString(),
            endMonth: '',
            end: 'Now',
            location: '',
            link: '',
            contract: '',
            description: '',
          });
          setWorkView('form');
        }}
        addButtonText="Add workplace"
      />

      {workView === 'list' && work.length === 0 && (
        <EmptyState
          icon={Briefcase}
          buttonText="Add workplace"
          onClick={() => {
            setCurrentWork({
              company: '',
              title: '',
              startMonth: '',
              start: currentYear.toString(),
              endMonth: '',
              end: 'Now',
              location: '',
              link: '',
              contract: '',
              description: '',
            });
            setWorkView('form');
          }}
        />
      )}

      {workView === 'list' && work.length > 0 && (
        <div className="space-y-8">
          {sortedWork.map((w: any, index: number, sortedArray: any[]) => {
            const prevItem = index > 0 ? sortedArray[index - 1] : null;
            const canMoveUp =
              prevItem &&
              parseInt(w.start || '0') === parseInt(prevItem.start || '0');
            const nextItem =
              index < sortedArray.length - 1 ? sortedArray[index + 1] : null;
            const canMoveDown =
              nextItem &&
              parseInt(w.start || '0') === parseInt(nextItem.start || '0');
            return (
              <div
                key={w.id || w.company}
                className="group flex flex-col gap-4 sm:flex-row sm:gap-12"
              >
                <div className="shrink-0 pt-0.5 text-sm text-content-muted sm:w-32">
                  {w.start} — {w.end}
                </div>

                <div className="flex flex-1 flex-col items-start justify-start">
                  <div className={`w-full transition-all duration-200 ${w.hidden ? 'opacity-50 blur-[1px]' : ''}`}>
                    {w.link ? (
                      <a
                        href={
                          w.link.startsWith('http') ? w.link : `https://${w.link}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block hover:underline"
                      >
                        <span className="text-sm font-semibold text-content-primary">
                          {w.title} at {w.company}
                          <ArrowUpRight className="relative -top-0.5 ml-1 inline-block h-4 w-4 text-content-primary" />
                        </span>
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-content-primary">
                        {w.title} at {w.company}
                      </p>
                    )}
                    {w.location && (
                      <p className="mt-1 text-sm text-content-muted">
                        {w.location}
                      </p>
                    )}

                    {w.description && w.description !== '<p></p>' && (
                      <div
                        className="prose prose-sm prose-p:my-1 prose-ul:my-1 prose-p:text-content-muted prose-ul:text-content-muted prose-li:text-content-muted prose-strong:text-content-primary mt-4 max-w-none text-sm leading-relaxed text-content-muted"
                        dangerouslySetInnerHTML={{
                          __html: w.description,
                        }}
                      />
                    )}
                  </div>

                  <EditDeleteButtons
                    isHidden={w.hidden}
                    onToggleVisibility={() => handleToggleVisibility(w)}
                    onEdit={() => {
                      setCurrentWork(w);
                      setWorkView('form');
                    }}
                    onDelete={() => setProjectToDelete(w.id)}
                  >
                    <SortButtons
                      canMoveUp={canMoveUp}
                      canMoveDown={canMoveDown}
                      onMoveUp={() => handleMoveUp(w, prevItem)}
                      onMoveDown={() => handleMoveUp(w, nextItem)}
                    />
                  </EditDeleteButtons>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {workView === 'form' && currentWork && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">Company*</Label>
              <Input
                value={currentWork.company}
                onChange={(e) =>
                  setCurrentWork({
                    ...currentWork,
                    company: e.target.value,
                  })
                }
                placeholder="Acme Design Studio"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">
                Position*
              </Label>
              <Input
                value={currentWork.title}
                onChange={(e) =>
                  setCurrentWork({
                    ...currentWork,
                    title: e.target.value,
                  })
                }
                placeholder="Senior Product Designer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">
                Start Date*
              </Label>
              <div className="flex gap-2">
                <Select
                  value={currentWork.startMonth || ''}
                  onValueChange={(val) =>
                    setCurrentWork({
                      ...currentWork,
                      startMonth: val,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={currentWork.start || ''}
                  onValueChange={(val) =>
                    setCurrentWork({ ...currentWork, start: val })
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

            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">
                End Date*
              </Label>
              <div className="flex gap-2">
                {currentWork.end !== 'Now' && (
                  <Select
                    value={currentWork.endMonth || ''}
                    onValueChange={(val) =>
                      setCurrentWork({
                        ...currentWork,
                        endMonth: val,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Select
                  value={currentWork.end || ''}
                  onValueChange={(val) =>
                    setCurrentWork({ ...currentWork, end: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Now">Now</SelectItem>
                    {years.map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">Location</Label>
              <Input
                value={currentWork.location || ''}
                onChange={(e) =>
                  setCurrentWork({
                    ...currentWork,
                    location: e.target.value,
                  })
                }
                placeholder="San Francisco, CA"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">Link</Label>
              <Input
                value={currentWork.link || ''}
                onChange={(e) =>
                  setCurrentWork({
                    ...currentWork,
                    link: e.target.value,
                  })
                }
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label className="text-xs text-content-secondary">
              Description
            </Label>
            <RichTextEditor
              content={currentWork.description || ''}
              onChange={(val) =>
                setCurrentWork({ ...currentWork, description: val })
              }
            />
          </div>

          <TabFormActions
            onCancel={() => setWorkView('list')}
            onSave={handleSave}
            isSaveDisabled={!currentWork?.title || !currentWork?.company}
          />
        </div>
      )}
    </div>
  );
}
