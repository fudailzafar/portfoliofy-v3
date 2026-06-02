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

export function SideProjectsTab({ 
  years, 
  setProjectToDelete 
}: { 
  years: number[], 
  setProjectToDelete: (id: string) => void 
}) {
  const { resume, updateResume, setIsEditingTab } = useResumeStore();
  const [sideProjectsView, setSideProjectsView] = useState<'list' | 'form'>('list');

  useEffect(() => {
    setIsEditingTab(sideProjectsView === 'form');
    return () => setIsEditingTab(false);
  }, [sideProjectsView, setIsEditingTab]);
  const [currentSideProject, setCurrentSideProject] = useState<any>(null);

  if (!resume) return null;
  const sideProjects = resume.sideProjects || [];

  const handleSave = () => {
    if (!currentSideProject?.title || !currentSideProject?.year) return;
    
    const isEdit = !!currentSideProject.id;
    const newItem = isEdit
      ? currentSideProject
      : { ...currentSideProject, id: Date.now().toString() };

    const newItems = isEdit
      ? sideProjects.map((p: any) => (p.id === currentSideProject.id ? newItem : p))
      : [...sideProjects, newItem];

    updateResume({ sideProjects: newItems });
    setSideProjectsView('list');
    setCurrentSideProject(null);
  };

  const handleMoveUp = (currentItem: any, prevItem: any) => {
    const newItems = [...sideProjects];
    const idx1 = newItems.findIndex((i: any) => i.id === currentItem.id);
    const idx2 = newItems.findIndex((i: any) => i.id === prevItem.id);
    
    if (idx1 !== -1 && idx2 !== -1) {
      [newItems[idx1], newItems[idx2]] = [newItems[idx2], newItems[idx1]];
      updateResume({ sideProjects: newItems });
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <h2 className="text-2xl font-bold">Side Projects</h2>
        {sideProjectsView === 'list' && (
          <Button
            variant="secondary"
            onClick={() => {
              setCurrentSideProject({
                title: '',
                year: currentYear.toString(),
                link: '',
                description: '',
              });
              setSideProjectsView('form');
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none h-8 text-xs px-4 rounded-md"
          >
            Add side project
          </Button>
        )}

      </div>

      {sideProjectsView === 'list' && sideProjects.length === 0 && (
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
              setCurrentSideProject({
                title: '',
                year: currentYear.toString(),
                link: '',
                description: '',
              });
              setSideProjectsView('form');
            }}
          >
            Add a side project you're proud of
          </Button>
        </div>
      )}

      {sideProjectsView === 'list' && sideProjects.length > 0 && (
        <div className="space-y-8">
          {sortByDateDesc(sideProjects).map((project: any, index: number, sortedArray: any[]) => {
            const prevItem = index > 0 ? sortedArray[index - 1] : null;
            const canMoveUp = prevItem && parseInt(project.year || '0') === parseInt(prevItem.year || '0');
            const nextItem = index < sortedArray.length - 1 ? sortedArray[index + 1] : null;
            const canMoveDown = nextItem && parseInt(project.year || '0') === parseInt(nextItem.year || '0');
            return (
            <div
              key={project.id}
              className="flex flex-col sm:flex-row gap-4 sm:gap-12"
            >
              <div className="sm:w-16 shrink-0 text-gray-400 text-sm pt-0.5">
                {project.year}
              </div>

              <div className="flex-1 flex flex-col justify-start items-start">
                <p className="text-base font-semibold text-gray-900">
                  {project.title}
                </p>

                {project.description &&
                  project.description !== '<p></p>' && (
                    <div
                      className="mt-1 text-sm text-gray-500 line-clamp-2"
                      dangerouslySetInnerHTML={{
                        __html: project.description,
                      }}
                    />
                  )}

                <div className="flex items-center gap-4 mt-3 text-xs font-medium text-gray-400">
                  <button
                    onClick={() => {
                      setCurrentSideProject(project);
                      setSideProjectsView('form');
                    }}
                    className="hover:text-gray-900 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() =>
                      setProjectToDelete(project.id)
                    }
                    className="hover:text-red-600 transition-colors"
                  >
                    Delete
                  </button>
                  {canMoveUp && (
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleMoveUp(project, prevItem)}
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
                            onClick={() => handleMoveUp(project, nextItem)}
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

      {sideProjectsView === 'form' && currentSideProject && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-600 text-xs">
                Title*
              </Label>
              <Input
                value={currentSideProject.title}
                onChange={(e) =>
                  setCurrentSideProject({
                    ...currentSideProject,
                    title: e.target.value,
                  })
                }
                placeholder="My Great Project"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600 text-xs">Year*</Label>
              <Select
                value={currentSideProject.year}
                onValueChange={(val) =>
                  setCurrentSideProject({
                    ...currentSideProject,
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
                Link to side project
              </Label>
              <Input
                value={currentSideProject.link || ''}
                onChange={(e) =>
                  setCurrentSideProject({
                    ...currentSideProject,
                    link: e.target.value,
                  })
                }
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label className="text-gray-600 text-xs">
              Description
            </Label>
            <RichTextEditor
              content={currentSideProject.description || ''}
              onChange={(val) =>
                setCurrentSideProject({
                  ...currentSideProject,
                  description: val,
                })
              }
            />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 md:px-8 border-t border-gray-100 bg-white flex justify-end z-10">
            <Button
              onClick={handleSave}
              disabled={!currentSideProject?.title || !currentSideProject?.year}
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
