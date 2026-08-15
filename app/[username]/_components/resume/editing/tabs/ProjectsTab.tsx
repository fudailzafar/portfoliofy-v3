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

export function ProjectsTab({
  years,
  setProjectToDelete,
}: {
  years: number[];
  setProjectToDelete: (id: string) => void;
}) {
  const {
    items: projects,
    handleSave: saveProject,
    handleMoveUp,
    handleToggleVisibility,
  } = useResumeList<any>('projects');

  const {
    view: projectsView,
    setView: setProjectsView,
    current: currentProject,
    setCurrent: setCurrentProject,
  } = useTabEditor<any>();

  const sortedProjects = useMemo(() => sortByDateDesc(projects), [projects]);

  const handleSave = () => {
    if (!currentProject?.title || !currentProject?.year) return;
    saveProject(currentProject);
    setProjectsView('list');
    setCurrentProject(null);
  };

  const currentYear = new Date().getFullYear();

  return (
    <ListTabLayout
      title="Projects"
      view={projectsView}
      itemsLength={projects.length}
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
      emptyState={{
        icon: FolderCode,
        buttonText: "Add a work project you're proud of",
      }}
      renderList={() => (
        <>
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
                  className="group mb-5 flex flex-col gap-4 border-b border-border-subtle pb-5 last:mb-0 last:border-b-0 last:pb-0 sm:flex-row sm:gap-12"
                >
                  <div className="shrink-0 pt-0.5 text-sm text-content-muted sm:w-24">
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
                            className="mt- prose prose-sm max-w-none text-sm leading-relaxed text-content-muted prose-p:my-1 prose-p:text-content-muted prose-strong:text-content-primary prose-ol:pl-0 prose-ul:my-1 prose-ul:pl-0 prose-ul:text-content-muted prose-li:pl-0 prose-li:text-content-muted"
                            dangerouslySetInnerHTML={{
                              __html: project.description,
                            }}
                          />
                        )}
                      <div className="mt-4">
                        <AttachmentsPreview attachments={project.attachments} />
                      </div>
                      <AvatarStack
                        collaborators={project.collaborators}
                        size="sm"
                        ringClassName="ring-surface-1"
                      />
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
        </>
      )}
      renderForm={() =>
        currentProject ? (
          <>
            <div className="grid grid-cols-2 gap-6">
              <FormInput
                id="title"
                label="Title*"
                value={currentProject.title}
                onChange={(e) =>
                  setCurrentProject({
                    ...currentProject,
                    title: e.target.value,
                  })
                }
                placeholder="My Great Project"
              />
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
              <FormInput
                id="company"
                label="Company or client"
                value={currentProject.company || ''}
                onChange={(e) =>
                  setCurrentProject({
                    ...currentProject,
                    company: e.target.value,
                  })
                }
                placeholder="Acme inc."
              />
              <FormInput
                id="link"
                label="Link to project"
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
            <CollaboratorsField
              label="Collaborators"
              value={currentProject.collaborators || []}
              onChange={(val) =>
                setCurrentProject({
                  ...currentProject,
                  collaborators: val,
                })
              }
            />
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
          </>
        ) : null
      }
    />
  );
}
