import { useMemo } from 'react';
import { useTabEditor } from '@/hooks/useTabEditor';
import { useResumeList } from '@/hooks/useResumeList';
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
import { FolderCode } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sortByDateDesc, getListAdjacency } from '@/lib/resume';

const isSideProjectValid = (item: any) => !!item?.title && !!item?.year;

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
    handleMoveDown,
    handleToggleVisibility,
  } = useResumeList<any>('sideProjects');

  const {
    view: sideProjectsView,
    setView: setSideProjectsView,
    current: currentSideProject,
    setCurrent: setCurrentSideProject,
  } = useTabEditor<any>({
    isValid: isSideProjectValid,
    onCommit: saveSideProject,
  });

  const sortedSideProjects = useMemo(
    () => sortByDateDesc(sideProjects),
    [sideProjects],
  );

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
              const { prevItem, nextItem, canMoveUp, canMoveDown } =
                getListAdjacency(sortedArray, index);
              return (
                <EditorListItem
                  key={project.id}
                  leftContent={project.year}
                  title={project.title}
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
                    setCurrentSideProject(project);
                    setSideProjectsView('form');
                  }}
                  onDelete={() => setProjectToDelete(project.id)}
                />
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
            <SectionAttachments
              attachments={currentSideProject.attachments || []}
              onChange={(val) =>
                setCurrentSideProject({
                  ...currentSideProject,
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
