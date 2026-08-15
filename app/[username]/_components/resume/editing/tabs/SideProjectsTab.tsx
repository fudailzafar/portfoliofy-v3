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

export function SideProjectsTab({
  years,
  setProjectToDelete,
}: {
  years: number[];
  setProjectToDelete: (id: string) => void;
}) {
  const {
    items: sideProjects,
    handleSave: saveSideProject,
    handleMoveUp,
    handleToggleVisibility,
  } = useResumeList<any>('sideProjects');

  const {
    view: sideProjectsView,
    setView: setSideProjectsView,
    current: currentSideProject,
    setCurrent: setCurrentSideProject,
  } = useTabEditor<any>();

  const sortedSideProjects = useMemo(
    () => sortByDateDesc(sideProjects),
    [sideProjects],
  );

  const handleSave = () => {
    if (!currentSideProject?.title || !currentSideProject?.year) return;
    saveSideProject(currentSideProject);
    setSideProjectsView('list');
    setCurrentSideProject(null);
  };

  const currentYear = new Date().getFullYear();

  return (
    <ListTabLayout
      title="Side Projects"
      view={sideProjectsView}
      itemsLength={sideProjects.length}
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
      emptyState={{
        icon: FolderCode,
        buttonText: "Add a side project you're proud of",
      }}
      renderList={() => (
        <>
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
                            className="prose prose-sm mt-4 max-w-none text-sm leading-relaxed text-content-muted prose-p:my-1 prose-p:text-content-muted prose-strong:text-content-primary prose-ol:pl-0 prose-ul:my-1 prose-ul:pl-0 prose-ul:text-content-muted prose-li:pl-0 prose-li:text-content-muted"
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
        </>
      )}
      renderForm={() =>
        currentSideProject ? (
          <>
            <div className="grid grid-cols-2 gap-6">
              <FormInput
                id="title"
                label="Title*"
                value={currentSideProject.title}
                onChange={(e) =>
                  setCurrentSideProject({
                    ...currentSideProject,
                    title: e.target.value,
                  })
                }
                placeholder="My Side-Project"
              />
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
              <FormInput
                id="company"
                label="Company or client"
                value={currentSideProject.company || ''}
                onChange={(e) =>
                  setCurrentSideProject({
                    ...currentSideProject,
                    company: e.target.value,
                  })
                }
                placeholder="Acme inc."
              />
              <FormInput
                id="link"
                label="Link to side-project"
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
            <CollaboratorsField
              label="Collaborators"
              value={currentSideProject.collaborators || []}
              onChange={(val) =>
                setCurrentSideProject({
                  ...currentSideProject,
                  collaborators: val,
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
          </>
        ) : null
      }
    />
  );
}
