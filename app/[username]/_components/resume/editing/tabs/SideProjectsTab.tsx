import React, { useState, useEffect } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { useTabEditor } from '@/hooks/useTabEditor';
import { SortButtons } from '../SortButtons';
import { EditDeleteButtons } from '../EditDeleteButtons';
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
import { FolderCode, Upload, Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sortByDateDesc } from '@/lib/resume';

export function SideProjectsTab({
  years,
  setProjectToDelete,
}: {
  years: number[];
  setProjectToDelete: (id: string) => void;
}) {
  const { resume, updateResume } = useResumeStore();
  const {
    view: sideProjectsView,
    setView: setSideProjectsView,
    current: currentSideProject,
    setCurrent: setCurrentSideProject,
  } = useTabEditor<any>();

  if (!resume) return null;
  const sideProjects = resume.sideProjects || [];

  const handleSave = () => {
    if (!currentSideProject?.title || !currentSideProject?.year) return;

    const isEdit = !!currentSideProject.id;
    const newItem = isEdit
      ? currentSideProject
      : { ...currentSideProject, id: Date.now().toString() };

    const newItems = isEdit
      ? sideProjects.map((p: any) =>
          p.id === currentSideProject.id ? newItem : p,
        )
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
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <div className="mb-8 flex items-center justify-between border-b border-border-subtle pb-4">
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
            className="h-8 rounded-md border-none bg-surface-2 px-4 text-xs text-content-primary hover:bg-surface-3"
          >
            Add side project
          </Button>
        )}
      </div>

      {sideProjectsView === 'list' && sideProjects.length === 0 && (
        <div className="mt-12 flex flex-1 flex-col items-center justify-center space-y-6 text-center opacity-80">
          <div className="rounded-full bg-surface-2 p-8">
            <FolderCode className="h-16 w-16 text-content-muted" strokeWidth={1} />
          </div>
          <Button
            variant="secondary"
            className="h-auto rounded-md border-none bg-surface-2 px-6 py-5 text-sm text-content-primary hover:bg-surface-3"
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
            Add a side project you&apos;re proud of
          </Button>
        </div>
      )}

      {sideProjectsView === 'list' && sideProjects.length > 0 && (
        <div className="space-y-8">
          {sortByDateDesc(sideProjects).map(
            (project: any, index: number, sortedArray: any[]) => {
              const prevItem = index > 0 ? sortedArray[index - 1] : null;
              const canMoveUp =
                prevItem &&
                parseInt(project.year || '0') ===
                  parseInt(prevItem.year || '0');
              const nextItem =
                index < sortedArray.length - 1 ? sortedArray[index + 1] : null;
              const canMoveDown =
                nextItem &&
                parseInt(project.year || '0') ===
                  parseInt(nextItem.year || '0');
              return (
                <div
                  key={project.id}
                  className="flex flex-col gap-4 sm:flex-row sm:gap-12"
                >
                  <div className="shrink-0 pt-0.5 text-sm text-content-muted sm:w-16">
                    {project.year}
                  </div>

                  <div className="flex flex-1 flex-col items-start justify-start">
                    <p className="text-base font-semibold text-content-primary">
                      {project.title}
                    </p>

                    {project.description &&
                      project.description !== '<p></p>' && (
                        <div
                          className="mt-1 line-clamp-2 text-sm text-content-muted"
                          dangerouslySetInnerHTML={{
                            __html: project.description,
                          }}
                        />
                      )}

                    <EditDeleteButtons
                      onEdit={() => {
                        setCurrentSideProject(project);
                        setSideProjectsView('form');
                      }}
                      onDelete={() => setProjectToDelete(project.id)}
                    >
                      <SortButtons
                        canMoveUp={canMoveUp}
                        canMoveDown={canMoveDown}
                        onMoveUp={() => handleMoveUp(project, prevItem)}
                        onMoveDown={() => handleMoveUp(project, nextItem)}
                      />
                    </EditDeleteButtons>
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}

      {sideProjectsView === 'form' && currentSideProject && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">Title*</Label>
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
              <Label className="text-xs text-content-secondary">Year*</Label>
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
              <Label className="text-xs text-content-secondary">
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
            <Label className="text-xs text-content-secondary">Description</Label>
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

          <div className="absolute bottom-0 left-0 right-0 z-10 flex justify-end gap-3 border-t border-border-subtle bg-surface-1 p-4 md:px-8">
            <button
              onClick={() => setSideProjectsView('list')}
              className="px-4 text-[14px] font-medium text-content-primary hover:underline hover:underline-offset-2"
            >
              Cancel
            </button>
            <Button
              onClick={handleSave}
              disabled={!currentSideProject?.title || !currentSideProject?.year}
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
