import React, { useMemo } from 'react';
import { useTabEditor } from '@/hooks/useTabEditor';
import { useResumeList } from '@/hooks/useResumeList';
import { ListTabLayout } from '@/components/composite/ListTabLayout';
import { FormInput } from '@/components/ui/form-input';
import { SortButtons } from '../SortButtons';
import { EditorListItem } from '../shared/EditorListItem';
import { EditDeleteButtons } from '../EditDeleteButtons';
import { SectionAttachments } from '@/components/composite/SectionAttachments';
import { CollaboratorsField } from '@/components/composite/CollaboratorsField';
import { AvatarStack } from '@/components/composite/AvatarStack';
import { AttachmentsPreview } from '../../preview/AttachmentsPreview';
import { TabFormActions } from '../TabFormActions';
import { Label } from '@/components/ui/label';
import dynamic from 'next/dynamic';
const RichTextEditor = dynamic(
  () =>
    import('@/components/composite/RichTextEditor').then(
      (mod) => mod.RichTextEditor,
    ),
  { ssr: false },
);
import { FolderCode, ArrowUpRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sortByDateDesc } from '@/lib/resume';

export function FeaturesTab({
  years,
  setProjectToDelete,
}: {
  years: number[];
  setProjectToDelete: (id: string) => void;
}) {
  const {
    items: features,
    handleSave: saveFeature,
    handleMoveUp,
    handleToggleVisibility,
  } = useResumeList<any>('features');

  const {
    view: featuresView,
    setView: setFeaturesView,
    current: currentFeature,
    setCurrent: setCurrentFeature,
  } = useTabEditor<any>();

  const sortedFeatures = useMemo(() => sortByDateDesc(features), [features]);

  const handleSave = () => {
    if (!currentFeature?.title || !currentFeature?.year) return;
    saveFeature(currentFeature);
    setFeaturesView('list');
    setCurrentFeature(null);
  };

  const currentYear = new Date().getFullYear();

  return (
    <ListTabLayout
      title="Features"
      view={featuresView}
      itemsLength={features.length}
      onAdd={() => {
        setCurrentFeature({
          title: '',
          year: currentYear.toString(),
          link: '',
          location: '',
          description: '',
        });
        setFeaturesView('form');
      }}
      addButtonText="Add feature"
      emptyState={{
        icon: FolderCode,
        buttonText: 'Add a feature',
      }}
      renderList={() => (
        <>
          {sortedFeatures.map(
            (feature: any, index: number, sortedArray: any[]) => {
              const prevItem = index > 0 ? sortedArray[index - 1] : null;
              const canMoveUp =
                prevItem &&
                parseInt(feature.year || '0') ===
                  parseInt(prevItem.year || '0');
              const nextItem =
                index < sortedArray.length - 1 ? sortedArray[index + 1] : null;
              const canMoveDown =
                nextItem &&
                parseInt(feature.year || '0') ===
                  parseInt(nextItem.year || '0');
              return (
                <div
                  key={feature.id}
                  className="group mb-5 flex flex-col gap-4 border-b border-border-subtle pb-5 last:mb-0 last:border-b-0 last:pb-0 sm:flex-row sm:gap-12"
                >
                  <div className="shrink-0 pt-0.5 text-sm text-content-muted sm:w-24">
                    {feature.year}
                  </div>

                  <div className="flex flex-1 flex-col items-start justify-start">
                    <div
                      className={`w-full transition-all duration-200 ${feature.hidden ? 'opacity-50 blur-[1px]' : ''}`}
                    >
                      {feature.link ? (
                        <a
                          href={
                            feature.link.startsWith('http')
                              ? feature.link
                              : `https://${feature.link}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block hover:underline hover:underline-offset-4"
                        >
                          <span className="text-sm font-semibold text-content-primary">
                            {feature.title}
                            {feature.location ? ` on ${feature.location}` : ''}
                            <ArrowUpRight className="relative -top-0.5 ml-1 inline-block h-4 w-4 text-content-primary" />
                          </span>
                        </a>
                      ) : (
                        <p className="text-sm font-semibold text-content-primary">
                          {feature.title}
                          {feature.location ? ` on ${feature.location}` : ''}
                        </p>
                      )}

                      {feature.description &&
                        feature.description !== '<p></p>' && (
                          <div
                            className="prose prose-sm mt-4 max-w-none text-sm leading-relaxed text-content-muted prose-p:my-1 prose-p:text-content-muted prose-strong:text-content-primary prose-ol:pl-0 prose-ul:my-1 prose-ul:pl-0 prose-ul:text-content-muted prose-li:pl-0 prose-li:text-content-muted"
                            dangerouslySetInnerHTML={{
                              __html: feature.description,
                            }}
                          />
                        )}
                      <div className="mt-4">
                        <AttachmentsPreview attachments={feature.attachments} />
                      </div>
                      <AvatarStack
                        collaborators={feature.collaborators}
                        size="sm"
                        ringClassName="ring-surface-1"
                      />
                    </div>

                    <EditDeleteButtons
                      isHidden={feature.hidden}
                      onToggleVisibility={() => handleToggleVisibility(feature)}
                      onEdit={() => {
                        setCurrentFeature(feature);
                        setFeaturesView('form');
                      }}
                      onDelete={() => setProjectToDelete(feature.id)}
                    >
                      <SortButtons
                        canMoveUp={canMoveUp}
                        canMoveDown={canMoveDown}
                        onMoveUp={() => handleMoveUp(feature, prevItem)}
                        onMoveDown={() => handleMoveUp(feature, nextItem)}
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
        currentFeature ? (
          <>
            <div className="grid grid-cols-2 gap-6">
              <FormInput
                id="title"
                label="Thing done*"
                value={currentFeature.title}
                onChange={(e) =>
                  setCurrentFeature({
                    ...currentFeature,
                    title: e.target.value,
                  })
                }
                placeholder="My great feature"
              />
              <div className="space-y-2">
                <Label className="text-xs text-content-secondary">Year*</Label>
                <Select
                  value={currentFeature.year}
                  onValueChange={(val) =>
                    setCurrentFeature({
                      ...currentFeature,
                      year: val,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Ongoing', ...years].map((y) => (
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
                id="location"
                label="Where"
                value={currentFeature.location || ''}
                onChange={(e) =>
                  setCurrentFeature({
                    ...currentFeature,
                    location: e.target.value,
                  })
                }
                placeholder="The Verge"
              />
              <FormInput
                id="link"
                label="Link to feature"
                value={currentFeature.link || ''}
                onChange={(e) =>
                  setCurrentFeature({
                    ...currentFeature,
                    link: e.target.value,
                  })
                }
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2 pt-2">
              <Label className="text-xs text-content-secondary">
                Description
              </Label>
              <RichTextEditor
                content={currentFeature.description || ''}
                onChange={(val) =>
                  setCurrentFeature({
                    ...currentFeature,
                    description: val,
                  })
                }
              />
            </div>
            <SectionAttachments
              attachments={currentFeature.attachments || []}
              onChange={(val) =>
                setCurrentFeature({
                  ...currentFeature,
                  attachments: val,
                })
              }
            />
            <CollaboratorsField
              label="Collaborators"
              value={currentFeature.collaborators || []}
              onChange={(val) =>
                setCurrentFeature({
                  ...currentFeature,
                  collaborators: val,
                })
              }
            />

            <TabFormActions
              onCancel={() => setFeaturesView('list')}
              onSave={handleSave}
              isSaveDisabled={!currentFeature?.title || !currentFeature?.year}
            />
          </>
        ) : null
      }
    />
  );
}
