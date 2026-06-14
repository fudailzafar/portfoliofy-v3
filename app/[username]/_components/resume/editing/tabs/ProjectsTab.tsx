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
import { FolderCode } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sortByDateDesc } from '@/lib/resume';

export function ProjectsTab({
  years,
  setProjectToDelete,
}: {
  years: number[];
  setProjectToDelete: (id: string) => void;
}) {
  const resume = useResumeStore((state) => state.resume);
  const updateResume = useResumeStore((state) => state.updateResume);
  const {
    view: projectsView,
    setView: setProjectsView,
    current: currentProject,
    setCurrent: setCurrentProject,
  } = useTabEditor<any>();

  const projects = useMemo(() => resume?.projects || [], [resume?.projects]);
  const sortedProjects = useMemo(() => sortByDateDesc(projects), [projects]);

  if (!resume) return null;

  const handleSave = () => {
    if (!currentProject?.title || !currentProject?.year) return;

    const isEdit = !!currentProject.id;
    const newProject = isEdit
      ? currentProject
      : { ...currentProject, id: Date.now().toString() };

    const newProjects = isEdit
      ? projects.map((p: any) => (p.id === currentProject.id ? newProject : p))
      : [...projects, newProject];

    updateResume({ projects: newProjects });
    setProjectsView('list');
    setCurrentProject(null);
  };

  const handleMoveUp = (currentItem: any, prevItem: any) => {
    const newItems = [...projects];
    const idx1 = newItems.findIndex((i: any) => i.id === currentItem.id);
    const idx2 = newItems.findIndex((i: any) => i.id === prevItem.id);

    if (idx1 !== -1 && idx2 !== -1) {
      [newItems[idx1], newItems[idx2]] = [newItems[idx2], newItems[idx1]];
      updateResume({ projects: newItems });
    }
  };

  const handleToggleVisibility = (item: any) => {
    const newItems = projects.map((p: any) =>
      p.id === item.id ? { ...p, hidden: !p.hidden } : p,
    );
    updateResume({ projects: newItems });
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <TabHeader
        title="Projects"
        showAddButton={projectsView === 'list'}
        onAdd={() => {
          setCurrentProject({
            title: '',
            year: currentYear.toString(),
            company: '',
            link: '',
            description: '',
          });
          setProjectsView('form');
        }}
        addButtonText="Add project"
      />

      {projectsView === 'list' && projects.length === 0 && (
        <EmptyState
          icon={FolderCode}
          buttonText="Add a work project you're proud of"
          onClick={() => {
            setCurrentProject({
              title: '',
              year: currentYear.toString(),
              company: '',
              link: '',
              description: '',
            });
            setProjectsView('form');
          }}
        />
      )}

      {projectsView === 'list' && projects.length > 0 && (
        <div className="space-y-8">
          {sortedProjects.map(
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
                    <div className={`w-full transition-all duration-200 ${project.hidden ? 'opacity-50 blur-[1px]' : ''}`}>
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
                            {project.company && (
                              <span className="font-normal text-content-primary">
                                {' '}
                                at {project.company}
                              </span>
                            )}
                            <ArrowUpRight className="relative -top-0.5 ml-1 inline-block h-4 w-4 text-content-primary" />
                          </span>
                        </a>
                      ) : (
                        <p className="text-sm font-semibold text-content-primary">
                          {project.title}
                          {project.company && (
                            <span className="font-normal text-content-primary">
                              {' '}
                              at {project.company}
                            </span>
                          )}
                        </p>
                      )}

                      {project.description &&
                        project.description !== '<p></p>' && (
                          <div
                            className="prose prose-sm prose-p:my-1 prose-ul:my-1 prose-p:text-content-muted prose-ul:text-content-muted prose-li:text-content-muted prose-strong:text-content-primary mt-4 max-w-none text-sm leading-relaxed text-content-muted"
                            dangerouslySetInnerHTML={{
                              __html: project.description,
                            }}
                          />
                        )}
                      <div className="mt-4"><AttachmentsPreview attachments={project.attachments} /></div>
                    </div>

                    <EditDeleteButtons
                      isHidden={project.hidden}
                      onToggleVisibility={() => handleToggleVisibility(project)}
                      onEdit={() => {
                        setCurrentProject(project);
                        setProjectsView('form');
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

      {projectsView === 'form' && currentProject && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">Title*</Label>
              <Input
                value={currentProject.title}
                onChange={(e) =>
                  setCurrentProject({
                    ...currentProject,
                    title: e.target.value,
                  })
                }
                placeholder="My Great Project"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">Year*</Label>
              <Select
                value={currentProject.year}
                onValueChange={(val) =>
                  setCurrentProject({
                    ...currentProject,
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
                value={currentProject.company || ''}
                onChange={(e) =>
                  setCurrentProject({
                    ...currentProject,
                    company: e.target.value,
                  })
                }
                placeholder="Acme inc."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">
                Link to project
              </Label>
              <Input
                value={currentProject.link || ''}
                onChange={(e) =>
                  setCurrentProject({
                    ...currentProject,
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
              content={currentProject.description || ''}
              onChange={(val) =>
                setCurrentProject({
                  ...currentProject,
                  description: val,
                })
              }
            />
          </div>
          <SectionAttachments
            attachments={currentProject.attachments || []}
            onChange={(val) =>
              setCurrentProject({
                ...currentProject,
                attachments: val,
              })
            }
          />

          <TabFormActions
            onCancel={() => setProjectsView('list')}
            onSave={handleSave}
            isSaveDisabled={!currentProject?.title || !currentProject?.year}
          />
        </div>
      )}
    </div>
  );
}
