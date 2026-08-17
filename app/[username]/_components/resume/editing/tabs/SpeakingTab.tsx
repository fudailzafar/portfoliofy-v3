import React, { useMemo } from 'react';
import { useTabEditor } from '@/hooks/useTabEditor';
import { useResumeList } from '@/hooks/useResumeList';
import { ListTabLayout } from '@/components/composite/ListTabLayout';
import { FormInput } from '@/components/ui/form-input';
import { EditorListItem } from '../shared/EditorListItem';
import { SectionAttachments } from '@/components/composite/SectionAttachments';
import { CollaboratorsField } from '@/components/composite/CollaboratorsField';
import { TabFormActions } from '../TabFormActions';
import { Label } from '@/components/ui/label';
import { Mic } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sortByDateDesc, getListAdjacency } from '@/lib/resume';
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
    handleMoveDown,
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
              const { prevItem, nextItem, canMoveUp, canMoveDown } =
                getListAdjacency(sortedArray, index);

              return (
                <EditorListItem
                  key={engagement.id}
                  leftContent={engagement.year}
                  title={engagement.title}
                  subtitle={
                    engagement.organization
                      ? ` at ${engagement.organization}`
                      : undefined
                  }
                  link={engagement.link}
                  location={engagement.location}
                  description={engagement.description}
                  attachments={engagement.attachments}
                  collaborators={engagement.collaborators}
                  isHidden={engagement.hidden}
                  canMoveUp={canMoveUp}
                  canMoveDown={canMoveDown}
                  onMoveUp={() => handleMoveUp(engagement, prevItem)}
                  onMoveDown={() => handleMoveDown(engagement, nextItem)}
                  onToggleVisibility={() => handleToggleVisibility(engagement)}
                  onEdit={() => {
                    setCurrentSpeaking(engagement);
                    setSpeakingView('form');
                  }}
                  onDelete={() => setProjectToDelete(engagement.id)}
                />
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
            <CollaboratorsField
              label="Collaborators"
              value={currentSpeaking.collaborators || []}
              onChange={(val) =>
                setCurrentSpeaking({
                  ...currentSpeaking,
                  collaborators: val,
                })
              }
            />
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
