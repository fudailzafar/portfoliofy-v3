import React, { useState, useEffect } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
const RichTextEditor = dynamic(() => import('@/components/ui/rich-text-editor').then(mod => mod.RichTextEditor), { ssr: false });
import { FolderCode, Upload, Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { sortByDateDesc } from '@/lib/resume';

export function FeaturesTab({
  years,
  setProjectToDelete,
}: {
  years: number[];
  setProjectToDelete: (id: string) => void;
}) {
  const { resume, updateResume, setIsEditingTab } = useResumeStore();
  const [featuresView, setFeaturesView] = useState<'list' | 'form'>('list');

  useEffect(() => {
    setIsEditingTab(featuresView === 'form');
    return () => setIsEditingTab(false);
  }, [featuresView, setIsEditingTab]);
  const [currentFeature, setCurrentFeature] = useState<any>(null);

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

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-bold">Features</h2>
        {featuresView === 'list' && (
          <Button
            variant="secondary"
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
            className="h-8 rounded-md border-none bg-gray-100 px-4 text-xs text-gray-900 hover:bg-gray-200"
          >
            Add feature
          </Button>
        )}
      </div>

      {featuresView === 'list' && features.length === 0 && (
        <div className="mt-12 flex flex-1 flex-col items-center justify-center space-y-6 text-center opacity-80">
          <div className="rounded-full bg-gray-50 p-8">
            <FolderCode className="h-16 w-16 text-gray-400" strokeWidth={1} />
          </div>
          <Button
            variant="secondary"
            className="h-auto rounded-md border-none bg-gray-100 px-6 py-5 text-sm text-gray-900 hover:bg-gray-200"
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
          >
            Add a feature
          </Button>
        </div>
      )}

      {featuresView === 'list' && features.length > 0 && (
        <div className="space-y-8">
          {sortByDateDesc(features).map(
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
                  <div className="shrink-0 pt-0.5 text-sm text-gray-400 sm:w-16">
                    {feature.year}
                  </div>

                  <div className="flex flex-1 flex-col items-start justify-start">
                    <p className="text-base font-semibold text-gray-900">
                      {feature.title}
                      {feature.location ? ` on ${feature.location}` : ''}
                    </p>

                    {feature.description &&
                      feature.description !== '<p></p>' && (
                        <div
                          className="prose prose-sm prose-p:my-1 prose-ul:my-1 prose-p:text-gray-500 prose-ul:text-gray-500 prose-li:text-gray-500 prose-strong:text-gray-900 mt-1 max-w-none text-sm leading-relaxed text-gray-500"
                          dangerouslySetInnerHTML={{
                            __html: feature.description,
                          }}
                        />
                      )}

                    <div className="mt-3 flex items-center gap-4 text-xs font-medium text-gray-400">
                      <button
                        onClick={() => {
                          setCurrentFeature(feature);
                          setFeaturesView('form');
                        }}
                        className="transition-colors hover:text-gray-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setProjectToDelete(feature.id)}
                        className="transition-colors hover:text-red-600"
                      >
                        Delete
                      </button>
                      {canMoveUp && (
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleMoveUp(feature, prevItem)}
                                className="transition-colors hover:text-gray-900"
                              >
                                <Upload className="h-[15px] w-[15px]" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="mb-1 rounded-md border-none bg-[#111] px-2.5 py-1.5 text-xs font-medium text-white"
                            >
                              Move up
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {canMoveDown && (
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleMoveUp(feature, nextItem)}
                                className="transition-colors hover:text-gray-900"
                              >
                                <Download className="h-[15px] w-[15px]" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              className="mb-1 rounded-md border-none bg-[#111] px-2.5 py-1.5 text-xs font-medium text-white"
                            >
                              Move down
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
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
              <Label className="text-xs text-gray-600">Title*</Label>
              <Input
                value={currentFeature.title}
                onChange={(e) =>
                  setCurrentFeature({
                    ...currentFeature,
                    title: e.target.value,
                  })
                }
                placeholder="Pattern on Hypebeast"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Year*</Label>
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
              <Label className="text-xs text-gray-600">Link to feature</Label>
              <Input
                value={currentFeature.link || ''}
                onChange={(e) =>
                  setCurrentFeature({
                    ...currentFeature,
                    link: e.target.value,
                  })
                }
                placeholder="https://hypebeast.com/pattern"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Location</Label>
              <Input
                value={currentFeature.location || ''}
                onChange={(e) =>
                  setCurrentFeature({
                    ...currentFeature,
                    location: e.target.value,
                  })
                }
                placeholder="New York, NY"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label className="text-xs text-gray-600">Description</Label>
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

          <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-end border-t border-gray-100 bg-white p-4 md:px-8">
            <Button
              onClick={handleSave}
              disabled={!currentFeature?.title || !currentFeature?.year}
              className="h-9 rounded-md border-none bg-[#2A2A2A] px-6 font-medium text-white shadow-sm hover:bg-[#1A1A1A]"
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
