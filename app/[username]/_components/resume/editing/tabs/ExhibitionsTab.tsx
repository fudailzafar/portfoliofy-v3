import { useMemo } from 'react';
import { useTabEditor } from '@/hooks/useTabEditor';
import { useResumeList } from '@/hooks/useResumeList';
import { ListTabLayout } from '@/components/composite/ListTabLayout';
import { FormInput } from '@/components/ui/form-input';
import { EditorListItem } from '../shared/EditorListItem';
import { SectionAttachments } from '@/components/composite/SectionAttachments';
import { CollaboratorsField } from '@/components/composite/CollaboratorsField';
import { Label } from '@/components/ui/label';
import { Palette } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sortByDateDesc, getListAdjacency } from '@/lib/resume';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(
  () =>
    import('@/components/composite/RichTextEditor').then(
      (mod) => mod.RichTextEditor,
    ),
  { ssr: false },
);

const isExhibitionValid = (item: any) => !!item?.title && !!item?.year;

export function ExhibitionsTab({
  years,
  setProjectToDelete,
}: {
  years: number[];
  setProjectToDelete: (id: string) => void;
}) {
  const {
    items: exhibitions,
    handleSave: saveExhibition,
    handleMoveUp,
    handleMoveDown,
    handleToggleVisibility,
  } = useResumeList<any>('exhibitions');

  const {
    view: exhibitionsView,
    setView: setExhibitionsView,
    current: currentExhibition,
    setCurrent: setCurrentExhibition,
  } = useTabEditor<any>({
    isValid: isExhibitionValid,
    onCommit: saveExhibition,
  });

  const sortedExhibitions = useMemo(
    () => sortByDateDesc(exhibitions),
    [exhibitions],
  );

  const currentYear = new Date().getFullYear();

  return (
    <ListTabLayout
      title="Exhibitions"
      view={exhibitionsView}
      itemsLength={exhibitions.length}
      onAdd={() => {
        setCurrentExhibition({
          title: '',
          year: currentYear.toString(),
          organization: '',
          link: '',
          location: '',
          description: '',
        });
        setExhibitionsView('form');
      }}
      addButtonText="Add exhibition"
      emptyState={{
        icon: Palette,
        buttonText: 'Add an exhibition you were in',
      }}
      renderList={() => (
        <>
          {sortedExhibitions.map(
            (exhibition: any, index: number, sortedArray: any[]) => {
              const { prevItem, nextItem, canMoveUp, canMoveDown } =
                getListAdjacency(sortedArray, index);

              return (
                <EditorListItem
                  key={exhibition.id}
                  leftContent={exhibition.year}
                  title={exhibition.title}
                  subtitle={
                    exhibition.organization
                      ? ` at ${exhibition.organization}`
                      : undefined
                  }
                  link={exhibition.link}
                  location={exhibition.location}
                  description={exhibition.description}
                  attachments={exhibition.attachments}
                  collaborators={exhibition.collaborators}
                  isHidden={exhibition.hidden}
                  canMoveUp={canMoveUp}
                  canMoveDown={canMoveDown}
                  onMoveUp={() => handleMoveUp(exhibition, prevItem)}
                  onMoveDown={() => handleMoveDown(exhibition, nextItem)}
                  onToggleVisibility={() => handleToggleVisibility(exhibition)}
                  onEdit={() => {
                    setCurrentExhibition(exhibition);
                    setExhibitionsView('form');
                  }}
                  onDelete={() => setProjectToDelete(exhibition.id)}
                />
              );
            },
          )}
        </>
      )}
      renderForm={() =>
        currentExhibition ? (
          <>
            <div className="grid grid-cols-2 gap-6">
              <FormInput
                id="title"
                label="Exhibition title*"
                value={currentExhibition.title}
                onChange={(e) =>
                  setCurrentExhibition({
                    ...currentExhibition,
                    title: e.target.value,
                  })
                }
                placeholder="My great show"
              />
              <div className="space-y-2">
                <Label className="text-xs text-content-secondary">Year*</Label>
                <Select
                  value={currentExhibition.year}
                  onValueChange={(val) =>
                    setCurrentExhibition({
                      ...currentExhibition,
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
              <FormInput
                id="organization"
                label="Organization"
                value={currentExhibition.organization || ''}
                onChange={(e) =>
                  setCurrentExhibition({
                    ...currentExhibition,
                    organization: e.target.value,
                  })
                }
                placeholder="The Vancouver Art Gallery"
              />
              <FormInput
                id="location"
                label="Location"
                value={currentExhibition.location || ''}
                onChange={(e) =>
                  setCurrentExhibition({
                    ...currentExhibition,
                    location: e.target.value,
                  })
                }
                placeholder="City or country"
              />
            </div>

            <FormInput
              id="link"
              label="URL"
              value={currentExhibition.link || ''}
              onChange={(e) =>
                setCurrentExhibition({
                  ...currentExhibition,
                  link: e.target.value,
                })
              }
              placeholder="https://example.com"
            />
            <CollaboratorsField
              label="Collaborators"
              value={currentExhibition.collaborators || []}
              onChange={(val) =>
                setCurrentExhibition({
                  ...currentExhibition,
                  collaborators: val,
                })
              }
            />
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">
                Description
              </Label>
              <RichTextEditor
                content={currentExhibition.description || ''}
                onChange={(val) =>
                  setCurrentExhibition({
                    ...currentExhibition,
                    description: val,
                  })
                }
              />
            </div>
            <SectionAttachments
              attachments={currentExhibition.attachments || []}
              onChange={(val) =>
                setCurrentExhibition({
                  ...currentExhibition,
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
