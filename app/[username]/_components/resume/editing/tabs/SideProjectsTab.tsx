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

export function SideProjectsTab({
  years,
  setProjectToDelete,
}: {
  years: number[];
  setProjectToDelete: (id: string) => void;
}) {
  const resume = useResumeStore((state) => state.resume);
  const updateResume = useResumeStore((state) => state.updateResume);
  const {
    view: sideProjectsView,
    setView: setSideProjectsView,
    current: currentSideProject,
    setCurrent: setCurrentSideProject,
  } = useTabEditor<any>();

  const sideProjects = useMemo(
    () => resume?.sideProjects || [],
    [resume?.sideProjects],
  );
  const sortedSideProjects = useMemo(
    () => sortByDateDesc(sideProjects),
    [sideProjects],
  );

  if (!resume) return null;

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

  const handleToggleVisibility = (project: any) => {
    const newItems = sideProjects.map((p: any) =>
      p.id === project.id ? { ...p, hidden: !p.hidden } : p,
    );
    updateResume({ sideProjects: newItems });
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <TabHeader
        title="Side Projects"
        showAddButton={sideProjectsView === 'list'}
        onAdd={() => {
          setCurrentSideProject({
            title: '',
            year: currentYear.toString(),
            link: '',
            description: '',
          });
          setSideProjectsView('form');
        }}
        addButtonText="Add side project"
      />

      {sideProjectsView === 'list' && sideProjects.length === 0 && (
        <EmptyState
          icon={FolderCode}
          buttonText="Add a side project you're proud of"
          onClick={() => {
            setCurrentSideProject({
              title: '',
              year: currentYear.toString(),
              link: '',
              description: '',
            });
            setSideProjectsView('form');
          }}
        />
      )}

      {sideProjectsView === 'list' && sideProjects.length > 0 && (
        <div className="space-y-8">
          {sortedSideProjects.map(
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
                  className="group flex flex-col gap-4 sm:flex-row sm:gap-12"
                >
                  <div className="shrink-0 pt-0.5 text-sm text-content-muted sm:w-16">
                    {project.year}
                  </div>

                  <div className="flex flex-1 flex-col items-start justify-start">
                    <div
                      className={`w-full transition-all duration-200 ${project.hidden ? 'opacity-50 blur-[1px]' : ''}`}
                    >
                      {project.link ? (
                        <a
                          href={
                            project.link.startsWith('http')
                              ? project.link
                              : `https://${project.link}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block hover:underline hover:underline-offset-4"
                        >
                          <span className="text-sm font-semibold text-content-primary">
                            {project.title}
                            <ArrowUpRight className="relative -top-0.5 ml-1 inline-block h-4 w-4 text-content-primary" />
                          </span>
                        </a>
                      ) : (
                        <p className="text-sm font-semibold text-content-primary">
                          {project.title}
                        </p>
                      )}

                      {project.description &&
                        project.description !== '<p></p>' && (
                          <div
                            className="prose prose-sm mt-4 max-w-none text-sm leading-relaxed text-content-muted prose-p:my-1 prose-p:text-content-muted prose-strong:text-content-primary prose-ul:my-1 prose-ul:text-content-muted prose-li:text-content-muted"
                            dangerouslySetInnerHTML={{
                              __html: project.description,
                            }}
                          />
                        )}
                      <div className="mt-4">
                        <AttachmentsPreview attachments={project.attachments} />
                      </div>
                    </div>

                    <EditDeleteButtons
                      isHidden={project.hidden}
                      onToggleVisibility={() => handleToggleVisibility(project)}
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
        <div className="space-y-6 w-full min-w-0">
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
                placeholder="My Side-Project"
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
                Company or client
              </Label>
              <Input
                value={currentSideProject.company || ''}
                onChange={(e) =>
                  setCurrentSideProject({
                    ...currentSideProject,
                    company: e.target.value,
                  })
                }
                placeholder="Acme inc."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">
                Link to side-project
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
            <Label className="text-xs text-content-secondary">
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
          <SectionAttachments
            attachments={currentSideProject.attachments || []}
            onChange={(val) =>
              setCurrentSideProject({
                ...currentSideProject,
                attachments: val,
              })
            }
          />

          <TabFormActions
            onCancel={() => setSideProjectsView('list')}
            onSave={handleSave}
            isSaveDisabled={
              !currentSideProject?.title || !currentSideProject?.year
            }
          />
        </div>
      )}
    </div>
  );
}
