import React, { useState, useEffect, useMemo } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { useTabEditor } from '@/hooks/useTabEditor';
import { SortButtons } from '../SortButtons';
import { EditDeleteButtons } from '../EditDeleteButtons';
import { TabHeader } from '../TabHeader';
import { EmptyState } from '../EmptyState';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

  if (!resume) return null;
  const features = resume.features || [];

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

  const currentYear = new Date().getFullYear();
  const sortedFeatures = useMemo(() => sortByDateDesc(features), [features]);

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
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
                  className="flex flex-col gap-4 sm:flex-row sm:gap-12"
                >
                  <div className="shrink-0 pt-0.5 text-sm text-content-muted sm:w-16">
                    {feature.year}
                  </div>

                  <div className="flex flex-1 flex-col items-start justify-start">
                    {feature.link ? (
                      <a
                        href={
                          feature.link.startsWith('http')
                            ? feature.link
                            : `https://${feature.link}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block hover:underline"
                      >
                        <span className="text-base font-semibold text-content-primary">
                          {feature.title}
                          {feature.location ? ` on ${feature.location}` : ''}
                          <ArrowUpRight className="relative -top-0.5 ml-1 inline-block h-4 w-4 text-content-primary" />
                        </span>
                      </a>
                    ) : (
                      <p className="text-base font-semibold text-content-primary">
                        {feature.title}
                        {feature.location ? ` on ${feature.location}` : ''}
                      </p>
                    )}

                    {feature.description &&
                      feature.description !== '<p></p>' && (
                        <div
                          className="prose prose-sm prose-p:my-1 prose-ul:my-1 prose-p:text-content-muted prose-ul:text-content-muted prose-li:text-content-muted prose-strong:text-content-primary mt-1 max-w-none text-sm leading-relaxed text-content-muted"
                          dangerouslySetInnerHTML={{
                            __html: feature.description,
                          }}
                        />
                      )}

                    <EditDeleteButtons
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
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">Thing done*</Label>
              <Input
                value={currentFeature.title}
                onChange={(e) =>
                  setCurrentFeature({
                    ...currentFeature,
                    title: e.target.value,
                  })
                }
                placeholder="Podcast, interview, article, etc"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">Where*</Label>
              <Input
                value={currentFeature.location || ''}
                onChange={(e) =>
                  setCurrentFeature({
                    ...currentFeature,
                    location: e.target.value,
                  })
                }
                placeholder="New York Times, Awwwards, ProductHunt, etc"
              />
            </div>

          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">Link to feature</Label>
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

          <div className="space-y-2 pt-2">
            <Label className="text-xs text-content-secondary">Description</Label>
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

          <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-end gap-3 border-t border-border-subtle bg-surface-1 p-4 md:px-8">
            <button
              onClick={() => setFeaturesView('list')}
              className="px-4 text-[14px] font-medium text-content-primary hover:underline hover:underline-offset-2"
            >
              Cancel
            </button>
            <Button
              onClick={handleSave}
              disabled={!currentFeature?.title || !currentFeature?.year}
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
