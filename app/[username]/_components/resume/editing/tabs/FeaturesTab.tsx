import React, { useMemo } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { useTabEditor } from '@/hooks/useTabEditor';
import { SortButtons } from '../SortButtons';
import { EditDeleteButtons } from '../EditDeleteButtons';
import { SectionAttachments } from '@/components/composite/SectionAttachments';
import { AttachmentsPreview } from '../../preview/AttachmentsPreview';
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
  const resume = useResumeStore((state) => state.resume);
  const updateResume = useResumeStore((state) => state.updateResume);
  const {
    view: featuresView,
    setView: setFeaturesView,
    current: currentFeature,
    setCurrent: setCurrentFeature,
  } = useTabEditor<any>();

  const features = useMemo(() => resume?.features || [], [resume?.features]);
  const sortedFeatures = useMemo(() => sortByDateDesc(features), [features]);

  if (!resume) return null;

  const handleSave = () => {
    if (!currentFeature?.title || !currentFeature?.year) return;

    const isEdit = !!currentFeature.id;
    const newItem = isEdit
      ? currentFeature
      : { ...currentFeature, id: Date.now().toString() };

    const newItems = isEdit
      ? features.map((p: any) => (p.id === currentFeature.id ? newItem : p))
      : [...features, newItem];

    updateResume({ features: newItems });
    setFeaturesView('list');
    setCurrentFeature(null);
  };

  const handleMoveUp = (currentItem: any, prevItem: any) => {
    const newItems = [...features];
    const idx1 = newItems.findIndex((i: any) => i.id === currentItem.id);
    const idx2 = newItems.findIndex((i: any) => i.id === prevItem.id);

    if (idx1 !== -1 && idx2 !== -1) {
      [newItems[idx1], newItems[idx2]] = [newItems[idx2], newItems[idx1]];
      updateResume({ features: newItems });
    }
  };

  const handleToggleVisibility = (item: any) => {
    const newItems = features.map((f: any) =>
      f.id === item.id ? { ...f, hidden: !f.hidden } : f,
    );
    updateResume({ features: newItems });
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <TabHeader
        title="Features"
        showAddButton={featuresView === 'list'}
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
      />

      {featuresView === 'list' && features.length === 0 && (
        <EmptyState
          icon={FolderCode}
          buttonText="Add a feature"
          onClick={() => {
            setCurrentFeature({
              title: '',
              year: currentYear.toString(),
              link: '',
              location: '',
              description: '',
            });
            setFeaturesView('form');
          }}
        />
      )}

      {featuresView === 'list' && features.length > 0 && (
        <div className="space-y-8">
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
                  className="group flex flex-col gap-4 sm:flex-row sm:gap-12"
                >
                  <div className="shrink-0 pt-0.5 text-sm text-content-muted sm:w-16">
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
                            className="prose prose-sm mt-4 max-w-none text-sm leading-relaxed text-content-muted prose-p:my-1 prose-p:text-content-muted prose-strong:text-content-primary prose-ul:my-1 prose-ul:text-content-muted prose-li:text-content-muted"
                            dangerouslySetInnerHTML={{
                              __html: feature.description,
                            }}
                          />
                        )}
                      <div className="mt-4">
                        <AttachmentsPreview attachments={feature.attachments} />
                      </div>
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
        </div>
      )}

      {featuresView === 'form' && currentFeature && (
        <div className="space-y-6 w-full min-w-0">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">
                Thing done*
              </Label>
              <Input
                value={currentFeature.title}
                onChange={(e) =>
                  setCurrentFeature({
                    ...currentFeature,
                    title: e.target.value,
                  })
                }
                placeholder="My great feature"
              />
            </div>
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
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">Where</Label>
              <Input
                value={currentFeature.location || ''}
                onChange={(e) =>
                  setCurrentFeature({
                    ...currentFeature,
                    location: e.target.value,
                  })
                }
                placeholder="The Verge"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">
                Link to feature
              </Label>
              <Input
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

          <TabFormActions
            onCancel={() => setFeaturesView('list')}
            onSave={handleSave}
            isSaveDisabled={!currentFeature?.title || !currentFeature?.year}
          />
        </div>
      )}
    </div>
  );
}
