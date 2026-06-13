import React, { useMemo } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { useTabEditor } from '@/hooks/useTabEditor';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Mic } from 'lucide-react';
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

export function SpeakingTab({
  years,
  setProjectToDelete,
}: {
  years: number[];
  setProjectToDelete: (id: string) => void;
}) {
  const resume = useResumeStore((state) => state.resume);
  const updateResume = useResumeStore((state) => state.updateResume);
  const {
    view: speakingView,
    setView: setSpeakingView,
    current: currentSpeaking,
    setCurrent: setCurrentSpeaking,
  } = useTabEditor<any>();

  const speaking = useMemo(() => resume?.speaking || [], [resume?.speaking]);
  const sortedSpeaking = useMemo(() => sortByDateDesc(speaking), [speaking]);

  if (!resume) return null;

  const handleSave = () => {
    if (!currentSpeaking?.title || !currentSpeaking?.year) return;

    const isEdit = !!currentSpeaking.id;
    const newItem = isEdit
      ? currentSpeaking
      : { ...currentSpeaking, id: Date.now().toString() };

    const newItems = isEdit
      ? speaking.map((p: any) => (p.id === currentSpeaking.id ? newItem : p))
      : [...speaking, newItem];

    updateResume({ speaking: newItems });
    setSpeakingView('list');
    setCurrentSpeaking(null);
  };

  const handleMoveUp = (currentItem: any, prevItem: any) => {
    const newItems = [...speaking];
    const idx1 = newItems.findIndex((i: any) => i.id === currentItem.id);
    const idx2 = newItems.findIndex((i: any) => i.id === prevItem.id);

    if (idx1 !== -1 && idx2 !== -1) {
      [newItems[idx1], newItems[idx2]] = [newItems[idx2], newItems[idx1]];
      updateResume({ speaking: newItems });
    }
  };

  const handleToggleVisibility = (item: any) => {
    const newItems = speaking.map((s: any) =>
      s.id === item.id ? { ...s, hidden: !s.hidden } : s,
    );
    updateResume({ speaking: newItems });
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <TabHeader
        title="Speaking"
        showAddButton={speakingView === 'list'}
        onAdd={() => {
          setCurrentSpeaking({
            title: '',
            year: currentYear.toString(),
            organization: '',
            link: '',
            location: '',
          });
          setSpeakingView('form');
        }}
        addButtonText="Add engagement"
      />

      {speakingView === 'list' && speaking.length === 0 && (
        <EmptyState
          icon={Mic}
          buttonText="Add a talk you've given"
          onClick={() => {
            setCurrentSpeaking({
              title: '',
              year: currentYear.toString(),
              organization: '',
              link: '',
              location: '',
            });
            setSpeakingView('form');
          }}
        />
      )}

      {speakingView === 'list' && speaking.length > 0 && (
        <div className="space-y-8">
          {sortedSpeaking.map(
            (engagement: any, index: number, sortedArray: any[]) => {
              const prevItem = index > 0 ? sortedArray[index - 1] : null;
              const canMoveUp =
                prevItem &&
                parseInt(engagement.year || '0') ===
                  parseInt(prevItem.year || '0');
              const nextItem =
                index < sortedArray.length - 1 ? sortedArray[index + 1] : null;
              const canMoveDown =
                nextItem &&
                parseInt(engagement.year || '0') ===
                  parseInt(nextItem.year || '0');

              return (
                <div
                  key={engagement.id}
                  className="group flex flex-col gap-4 sm:flex-row sm:gap-12"
                >
                  <div className="shrink-0 pt-0.5 text-sm text-content-muted sm:w-16">
                    {engagement.year}
                  </div>

                  <div className="flex flex-1 flex-col items-start justify-start">
                    <div className={`w-full transition-all duration-200 ${engagement.hidden ? 'opacity-50 blur-[1px]' : ''}`}>
                      {engagement.link ? (
                        <a
                          href={
                            engagement.link.startsWith('http')
                              ? engagement.link
                              : `https://${engagement.link}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block hover:underline"
                        >
                          <span className="text-sm font-semibold text-content-primary">
                            {engagement.title}
                            {engagement.organization ? ` at ${engagement.organization}` : ''}
                            <ArrowUpRight className="relative -top-0.5 ml-1 inline-block h-4 w-4 text-content-primary" />
                          </span>
                        </a>
                      ) : (
                        <p className="text-sm font-semibold text-content-primary">
                          {engagement.title}
                          {engagement.organization ? ` at ${engagement.organization}` : ''}
                        </p>
                      )}

                      {engagement.location && (
                        <div className="mt-1 text-sm text-content-muted">
                          {engagement.location}
                        </div>
                      )}
                    </div>

                    <EditDeleteButtons
                      isHidden={engagement.hidden}
                      onToggleVisibility={() => handleToggleVisibility(engagement)}
                      onEdit={() => {
                        setCurrentSpeaking(engagement);
                        setSpeakingView('form');
                      }}
                      onDelete={() => setProjectToDelete(engagement.id)}
                    >
                      <SortButtons
                        canMoveUp={canMoveUp}
                        canMoveDown={canMoveDown}
                        onMoveUp={() => handleMoveUp(engagement, prevItem)}
                        onMoveDown={() => handleMoveUp(engagement, nextItem)}
                      />
                    </EditDeleteButtons>
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}

      {speakingView === 'form' && currentSpeaking && (
        <div className="space-y-6 pb-24">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">Title*</Label>
              <Input
                value={currentSpeaking.title}
                onChange={(e) =>
                  setCurrentSpeaking({
                    ...currentSpeaking,
                    title: e.target.value,
                  })
                }
                placeholder="My great talk"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">Year*</Label>
              <Select
                value={currentSpeaking.year}
                onValueChange={(val) =>
                  setCurrentSpeaking({
                    ...currentSpeaking,
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
                value={currentSpeaking.organization || ''}
                onChange={(e) =>
                  setCurrentSpeaking({
                    ...currentSpeaking,
                    organization: e.target.value,
                  })
                }
                placeholder="SXSW"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">Location</Label>
              <Input
                value={currentSpeaking.location || ''}
                onChange={(e) =>
                  setCurrentSpeaking({
                    ...currentSpeaking,
                    location: e.target.value,
                  })
                }
                placeholder="Paris"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-content-secondary">Link</Label>
            <Input
              value={currentSpeaking.link || ''}
              onChange={(e) =>
                setCurrentSpeaking({
                  ...currentSpeaking,
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
              content={currentSpeaking.description || ''}
              onChange={(val) =>
                setCurrentSpeaking({
                  ...currentSpeaking,
                  description: val,
                })
              }
            />
          </div>

          <TabFormActions
            onCancel={() => setSpeakingView('list')}
            onSave={handleSave}
            isSaveDisabled={!currentSpeaking?.title || !currentSpeaking?.year}
          />
        </div>
      )}
    </div>
  );
}
