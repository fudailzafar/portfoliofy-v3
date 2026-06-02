import React, { useState, useEffect } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { FolderCode, Upload, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { sortByDateDesc } from '@/lib/resume';

export function FeaturesTab({ 
  years, 
  setProjectToDelete 
}: { 
  years: number[], 
  setProjectToDelete: (id: string) => void 
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
    <div className="max-w-3xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
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
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none h-8 text-xs px-4 rounded-md"
          >
            Add feature
          </Button>
        )}

      </div>

      {featuresView === 'list' && features.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-80 mt-12">
          <div className="p-8 bg-gray-50 rounded-full">
            <FolderCode
              className="w-16 h-16 text-gray-400"
              strokeWidth={1}
            />
          </div>
          <Button
            variant="secondary"
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none rounded-md px-6 py-5 h-auto text-sm"
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
          {sortByDateDesc(features).map((feature: any, index: number, sortedArray: any[]) => {
            const prevItem = index > 0 ? sortedArray[index - 1] : null;
            const canMoveUp = prevItem && parseInt(feature.year || '0') === parseInt(prevItem.year || '0');
            const nextItem = index < sortedArray.length - 1 ? sortedArray[index + 1] : null;
            const canMoveDown = nextItem && parseInt(feature.year || '0') === parseInt(nextItem.year || '0');
            return (
            <div
              key={feature.id}
              className="flex flex-col sm:flex-row gap-4 sm:gap-12"
            >
              <div className="sm:w-16 shrink-0 text-gray-400 text-sm pt-0.5">
                {feature.year}
              </div>

              <div className="flex-1 flex flex-col justify-start items-start">
                <p className="text-base font-semibold text-gray-900">
                  {feature.title}
                  {feature.location
                    ? ` on ${feature.location}`
                    : ''}
                </p>

                {feature.description &&
                  feature.description !== '<p></p>' && (
                    <div
                      className="mt-1 text-sm text-gray-500 prose prose-sm max-w-none leading-relaxed prose-p:my-1 prose-ul:my-1 prose-p:text-gray-500 prose-ul:text-gray-500 prose-li:text-gray-500 prose-strong:text-gray-900"
                      dangerouslySetInnerHTML={{
                        __html: feature.description,
                      }}
                    />
                  )}

                <div className="flex items-center gap-4 mt-3 text-xs font-medium text-gray-400">
                  <button
                    onClick={() => {
                      setCurrentFeature(feature);
                      setFeaturesView('form');
                    }}
                    className="hover:text-gray-900 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setProjectToDelete(feature.id)}
                    className="hover:text-red-600 transition-colors"
                  >
                    Delete
                  </button>
                  {canMoveUp && (
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleMoveUp(feature, prevItem)}
                            className="hover:text-gray-900 transition-colors"
                          >
                            <Upload className="w-[15px] h-[15px]" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-[#111] text-white text-xs px-2.5 py-1.5 rounded-md border-none font-medium mb-1">
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
                            className="hover:text-gray-900 transition-colors"
                          >
                            <Download className="w-[15px] h-[15px]" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-[#111] text-white text-xs px-2.5 py-1.5 rounded-md border-none font-medium mb-1">
                          Move down
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </div>
          )})}
        </div>
      )}

      {featuresView === 'form' && currentFeature && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-600 text-xs">
                Title*
              </Label>
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
              <Label className="text-gray-600 text-xs">Year*</Label>
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
              <Label className="text-gray-600 text-xs">
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
                placeholder="https://hypebeast.com/pattern"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600 text-xs">
                Location
              </Label>
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
            <Label className="text-gray-600 text-xs">
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

          <div className="absolute bottom-0 left-0 right-0 p-4 md:px-8 border-t border-gray-100 bg-white flex justify-end z-10">
            <Button
              onClick={handleSave}
              disabled={!currentFeature?.title || !currentFeature?.year}
              className="bg-[#2A2A2A] hover:bg-[#1A1A1A] text-white h-9 px-6 rounded-md shadow-sm border-none font-medium"
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
