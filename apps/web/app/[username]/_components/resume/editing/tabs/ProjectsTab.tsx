import { useMemo } from 'react';
import { useTabEditor } from '@portfoliofy/shared/hooks/useTabEditor';
import { useResumeList } from '@portfoliofy/shared/hooks/useResumeList';
import { useResumeStore } from '@portfoliofy/shared/store/useResumeStore';
import { ListTabLayout } from '@/components/composite/ListTabLayout';
import { FormInput } from '@/components/ui/form-input';
import { EditorListItem } from '../shared/EditorListItem';
import { SectionAttachments } from '@/components/composite/SectionAttachments';
import { CollaboratorsField } from '@/components/composite/CollaboratorsField';
import { Label } from '@/components/ui/label';
import dynamic from 'next/dynamic';
const RichTextEditor = dynamic(
  () =>
    import('@/components/composite/RichTextEditor').then(
      (mod) => mod.RichTextEditor,
    ),
  { ssr: false },
);
import { FolderSimpleIcon } from '@phosphor-icons/react/ssr';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sortByDateDesc, getListAdjacency } from '@portfoliofy/shared/resume';

const isProjectValid = (item: any) => !!item?.title && !!item?.year;

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
    handleMoveDown,
    handleToggleVisibility,
  } = useResumeList<any>('projects');

  const {
    view: projectsView,
    setView: setProjectsView,
    current: currentProject,
    setCurrent: setCurrentProject,
  } = useTabEditor<any>({ isValid: isProjectValid, onCommit: saveProject });

  const moveItemToSection = useResumeStore((s) => s.moveItemToSection);

  const sortedProjects = useMemo(() => sortByDateDesc(projects), [projects]);

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
        icon: FolderSimpleIcon,
        buttonText: "Add a work project you're proud of",
      }}
      renderList={() => (
        <>
          {sortedProjects.map(
            (project: any, index: number, sortedArray: any[]) => {
              const { prevItem, nextItem, canMoveUp, canMoveDown } =
                getListAdjacency(sortedArray, index);
              return (
                <EditorListItem
                  key={project.id}
                  leftContent={project.year}
                  title={project.title}
                  subtitle={
                    project.company ? ` at ${project.company}` : undefined
                  }
                  link={project.link}
                  description={project.description}
                  attachments={project.attachments}
                  collaborators={project.collaborators}
                  isHidden={project.hidden}
                  canMoveUp={canMoveUp}
                  canMoveDown={canMoveDown}
                  onMoveUp={() => handleMoveUp(project, prevItem)}
                  onMoveDown={() => handleMoveDown(project, nextItem)}
                  onToggleVisibility={() => handleToggleVisibility(project)}
                  onEdit={() => {
                    setCurrentProject(project);
                    setProjectsView('form');
                  }}
                  onDelete={() => setProjectToDelete(project.id)}
                  menuActions={[
                    {
                      label: 'Move to Side Projects',
                      onSelect: () =>
                        moveItemToSection(
                          'projects',
                          'sideProjects',
                          project.id,
                        ),
                    },
                  ]}
                />
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
          </>
        ) : null
      }
    />
  );
}
