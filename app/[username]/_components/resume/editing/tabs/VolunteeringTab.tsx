import { useMemo } from 'react';
import { isReversedRange } from '@/lib/validation/dates';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { HeartHandshake } from 'lucide-react';
import { sortByDateDesc, getListAdjacency } from '@/lib/resume';

const isVolunteeringValid = (item: any) =>
  !!item?.role &&
  !!item?.organization &&
  !isReversedRange(item?.startYear, item?.endYear);

export function VolunteeringTab({
  years,
  setProjectToDelete,
}: {
  years: number[];
  setProjectToDelete: (id: string) => void;
}) {
  const {
    items: volunteering,
    handleSave: saveVolunteering,
    handleMoveUp,
    handleMoveDown,
    handleToggleVisibility,
  } = useResumeList<any>('volunteering');

  const {
    view: volunteeringView,
    setView: setVolunteeringView,
    current: currentVolunteering,
    setCurrent: setCurrentVolunteering,
  } = useTabEditor<any>({
    isValid: isVolunteeringValid,
    onCommit: saveVolunteering,
  });

  const sortedVolunteering = useMemo(
    () => sortByDateDesc(volunteering),
    [volunteering],
  );

  return (
    <ListTabLayout
      title="Volunteering"
      view={volunteeringView}
      itemsLength={volunteering.length}
      onAdd={() => {
        setCurrentVolunteering({
          role: '',
          organization: '',
          startYear: '',
          endYear: '',
          location: '',
          link: '',
        });
        setVolunteeringView('form');
      }}
      addButtonText="Add volunteering"
      emptyState={{
        icon: HeartHandshake,
        buttonText: 'Add volunteering',
      }}
      renderList={() => (
        <>
          {sortedVolunteering.map(
            (v: any, index: number, sortedArray: any[]) => {
              const { prevItem, nextItem, canMoveUp, canMoveDown } =
                getListAdjacency(sortedArray, index);

              return (
                <EditorListItem
                  key={v.id}
                  leftContent={`${v.startYear} — ${v.endYear}`}
                  title={v.role}
                  subtitle={` at ${v.organization}`}
                  link={v.link}
                  location={v.location}
                  description={v.description}
                  attachments={v.attachments}
                  collaborators={v.collaborators}
                  isHidden={v.hidden}
                  canMoveUp={canMoveUp}
                  canMoveDown={canMoveDown}
                  onMoveUp={() => handleMoveUp(v, prevItem)}
                  onMoveDown={() => handleMoveDown(v, nextItem)}
                  onToggleVisibility={() => handleToggleVisibility(v)}
                  onEdit={() => {
                    setCurrentVolunteering(v);
                    setVolunteeringView('form');
                  }}
                  onDelete={() => setProjectToDelete(v.id)}
                />
              );
            },
          )}
        </>
      )}
      renderForm={() =>
        currentVolunteering ? (
          <>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs text-content-secondary">From*</Label>
                <Select
                  value={currentVolunteering.startYear}
                  onValueChange={(val) =>
                    setCurrentVolunteering({
                      ...currentVolunteering,
                      startYear: val,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
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
              <div className="space-y-2">
                <Label className="text-xs text-content-secondary">To*</Label>
                <Select
                  value={currentVolunteering.endYear}
                  onValueChange={(val) =>
                    setCurrentVolunteering({
                      ...currentVolunteering,
                      endYear: val,
                    })
                  }
                >
                  <SelectTrigger
                    className={
                      isReversedRange(
                        currentVolunteering.startYear,
                        currentVolunteering.endYear,
                      )
                        ? 'border-red-500'
                        : ''
                    }
                  >
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Now">Now</SelectItem>
                    {years.map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isReversedRange(
                  currentVolunteering.startYear,
                  currentVolunteering.endYear,
                ) && (
                  <p className="text-xs text-red-500">
                    End year can&apos;t be earlier than the start year.
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormInput
                id="role"
                label="Role*"
                value={currentVolunteering.role}
                onChange={(e) =>
                  setCurrentVolunteering({
                    ...currentVolunteering,
                    role: e.target.value,
                  })
                }
                placeholder="Volunteer"
              />
              <FormInput
                id="organization"
                label="Organization*"
                value={currentVolunteering.organization}
                onChange={(e) =>
                  setCurrentVolunteering({
                    ...currentVolunteering,
                    organization: e.target.value,
                  })
                }
                placeholder="Non-profit Org."
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormInput
                id="location"
                label="Location"
                value={currentVolunteering.location}
                onChange={(e) =>
                  setCurrentVolunteering({
                    ...currentVolunteering,
                    location: e.target.value,
                  })
                }
                placeholder="Paris"
              />
              <FormInput
                id="link"
                label="URL"
                value={currentVolunteering.link || ''}
                onChange={(e) =>
                  setCurrentVolunteering({
                    ...currentVolunteering,
                    link: e.target.value,
                  })
                }
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">
                Description
              </Label>
              <RichTextEditor
                content={currentVolunteering.description || ''}
                onChange={(val) =>
                  setCurrentVolunteering({
                    ...currentVolunteering,
                    description: val,
                  })
                }
              />
            </div>
            <CollaboratorsField
              label="Collaborators"
              value={currentVolunteering.collaborators || []}
              onChange={(val) =>
                setCurrentVolunteering({
                  ...currentVolunteering,
                  collaborators: val,
                })
              }
            />
            <SectionAttachments
              attachments={currentVolunteering.attachments || []}
              onChange={(val) =>
                setCurrentVolunteering({
                  ...currentVolunteering,
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
