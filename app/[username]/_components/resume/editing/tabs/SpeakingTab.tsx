import React, { useMemo } from 'react';
import { useTabEditor } from '@/hooks/useTabEditor';
import { useResumeList } from '@/hooks/useResumeList';
import { ListTabLayout } from '@/components/composite/ListTabLayout';
import { FormInput } from '@/components/ui/form-input';
import { SortButtons } from '../SortButtons';
import { EditDeleteButtons } from '../EditDeleteButtons';
import { SectionAttachments } from '@/components/composite/SectionAttachments';
import { AttachmentsPreview } from '../../preview/AttachmentsPreview';
import { TabFormActions } from '../TabFormActions';
import { Label } from '@/components/ui/label';
import { Mic, ArrowUpRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sortByDateDesc } from '@/lib/resume';
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
  const {
    items: speaking,
    handleSave: saveSpeaking,
    handleMoveUp,
    handleToggleVisibility,
  } = useResumeList<any>('speaking');

  const {
    view: speakingView,
    setView: setSpeakingView,
    current: currentSpeaking,
    setCurrent: setCurrentSpeaking,
  } = useTabEditor<any>();

  const sortedSpeaking = useMemo(() => sortByDateDesc(speaking), [speaking]);

  const handleSave = () => {
    if (!currentSpeaking?.title || !currentSpeaking?.year) return;
    saveSpeaking(currentSpeaking);
    setSpeakingView('list');
    setCurrentSpeaking(null);
  };

  const currentYear = new Date().getFullYear();

  return (
    <ListTabLayout
      title="Speaking"
      view={speakingView}
      itemsLength={speaking.length}
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
      emptyState={{
        icon: Mic,
        buttonText: "Add a talk you've given",
      }}
      renderList={() => (
        <>
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
                    <div
                      className={`w-full transition-all duration-200 ${engagement.hidden ? 'opacity-50 blur-[1px]' : ''}`}
                    >
                      {engagement.link ? (
                        <a
                          href={
                            engagement.link.startsWith('http')
                              ? engagement.link
                              : `https://${engagement.link}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block hover:underline hover:underline-offset-4"
                        >
                          <span className="text-sm font-semibold text-content-primary">
                            {engagement.title}
                            {engagement.organization
                              ? ` at ${engagement.organization}`
                              : ''}
                            <ArrowUpRight className="relative -top-0.5 ml-1 inline-block h-4 w-4 text-content-primary" />
                          </span>
                        </a>
                      ) : (
                        <p className="text-sm font-semibold text-content-primary">
                          {engagement.title}
                          {engagement.organization
                            ? ` at ${engagement.organization}`
                            : ''}
                        </p>
                      )}

                      {engagement.location && (
                        <div className="mt-1 text-sm text-content-muted">
                          {engagement.location}
                        </div>
                      )}

                      {engagement.description && engagement.description !== '<p></p>' && (
                        <div
                          className="prose prose-sm mt-4 max-w-none text-sm leading-relaxed text-content-muted prose-p:my-1 prose-p:text-content-muted prose-strong:text-content-primary prose-ul:my-1 prose-ul:text-content-muted prose-li:text-content-muted"
                          dangerouslySetInnerHTML={{
                            __html: engagement.description,
                          }}
                        />
                      )}
                      <div className="mt-4">
                        <AttachmentsPreview
                          attachments={engagement.attachments}
                        />
                      </div>
                    </div>

                    <EditDeleteButtons
                      isHidden={engagement.hidden}
                      onToggleVisibility={() =>
                        handleToggleVisibility(engagement)
                      }
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
        </>
      )}
      renderForm={() =>
        currentSpeaking ? (
          <>
            <div className="grid grid-cols-2 gap-6">
              <FormInput
                id="title"
                label="Title*"
                value={currentSpeaking.title}
                onChange={(e) =>
                  setCurrentSpeaking({
                    ...currentSpeaking,
                    title: e.target.value,
                  })
                }
                placeholder="My great talk"
              />
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
              <FormInput
                id="organization"
                label="Organization"
                value={currentSpeaking.organization || ''}
                onChange={(e) =>
                  setCurrentSpeaking({
                    ...currentSpeaking,
                    organization: e.target.value,
                  })
                }
                placeholder="SXSW"
              />
              <FormInput
                id="location"
                label="Location"
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

            <FormInput
              id="link"
              label="Link"
              value={currentSpeaking.link || ''}
              onChange={(e) =>
                setCurrentSpeaking({
                  ...currentSpeaking,
                  link: e.target.value,
                })
              }
              placeholder="https://example.com"
            />

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
            <SectionAttachments
              attachments={currentSpeaking.attachments || []}
              onChange={(val) =>
                setCurrentSpeaking({
                  ...currentSpeaking,
                  attachments: val,
                })
              }
            />

            <TabFormActions
              onCancel={() => setSpeakingView('list')}
              onSave={handleSave}
              isSaveDisabled={!currentSpeaking?.title || !currentSpeaking?.year}
            />
          </>
        ) : null
      }
    />
  );
}
