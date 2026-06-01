import React, { useState, useEffect } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sortByDateDesc } from '@/lib/resume';

export function SpeakingTab({ 
  years, 
  setProjectToDelete 
}: { 
  years: number[], 
  setProjectToDelete: (id: string) => void 
}) {
  const { resume, updateResume, setIsEditingTab } = useResumeStore();
  const [speakingView, setSpeakingView] = useState<'list' | 'form'>('list');

  useEffect(() => {
    setIsEditingTab(speakingView === 'form');
    return () => setIsEditingTab(false);
  }, [speakingView, setIsEditingTab]);
  const [currentSpeaking, setCurrentSpeaking] = useState<any>(null);

  if (!resume) return null;
  const speaking = resume.speaking || [];

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

  const currentYear = new Date().getFullYear();

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <h2 className="text-2xl font-bold">Speaking</h2>
        {speakingView === 'list' && (
          <Button
            variant="secondary"
            onClick={() => {
              setCurrentSpeaking({
                title: '',
                year: currentYear.toString(),
                link: '',
                location: '',
              });
              setSpeakingView('form');
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none h-8 text-xs px-4 rounded-md"
          >
            Add engagement
          </Button>
        )}

      </div>

      {speakingView === 'list' && speaking.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-80 mt-12">
          <div className="p-8 bg-gray-50 rounded-full">
            <Mic
              className="w-16 h-16 text-gray-400"
              strokeWidth={1}
            />
          </div>
          <Button
            variant="secondary"
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none rounded-md px-6 py-5 h-auto text-sm"
            onClick={() => {
              setCurrentSpeaking({
                title: '',
                year: currentYear.toString(),
                link: '',
                location: '',
              });
              setSpeakingView('form');
            }}
          >
            Add a speaking engagement
          </Button>
        </div>
      )}

      {speakingView === 'list' && speaking.length > 0 && (
        <div className="space-y-8">
          {sortByDateDesc(speaking).map((engagement: any) => (
            <div
              key={engagement.id}
              className="flex flex-col sm:flex-row gap-4 sm:gap-12"
            >
              <div className="sm:w-16 shrink-0 text-gray-400 text-sm pt-0.5">
                {engagement.year}
              </div>

              <div className="flex-1 flex flex-col justify-start items-start">
                <p className="text-base font-semibold text-gray-900">
                  {engagement.title}
                </p>

                {engagement.location && (
                  <div className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {engagement.location}
                  </div>
                )}

                <div className="flex items-center gap-4 mt-3 text-xs font-medium text-gray-400">
                  <button
                    onClick={() => {
                      setCurrentSpeaking(engagement);
                      setSpeakingView('form');
                    }}
                    className="hover:text-gray-900 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      setProjectToDelete(engagement.id)
                    }
                    className="hover:text-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {speakingView === 'form' && currentSpeaking && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-600 text-xs">
                Title*
              </Label>
              <Input
                value={currentSpeaking.title}
                onChange={(e) =>
                  setCurrentSpeaking({
                    ...currentSpeaking,
                    title: e.target.value,
                  })
                }
                placeholder="React Conf 2024"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600 text-xs">Year*</Label>
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
              <Label className="text-gray-600 text-xs">
                Location
              </Label>
              <Input
                value={currentSpeaking.location || ''}
                onChange={(e) =>
                  setCurrentSpeaking({
                    ...currentSpeaking,
                    location: e.target.value,
                  })
                }
                placeholder="Las Vegas, NV"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600 text-xs">Link</Label>
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
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 md:px-8 border-t border-gray-100 bg-white flex justify-end z-10">
            <Button
              onClick={handleSave}
              disabled={!currentSpeaking?.title || !currentSpeaking?.year}
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
