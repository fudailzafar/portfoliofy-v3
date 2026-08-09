import React, { useMemo } from 'react';
import { isReversedRange } from '@/lib/validation/dates';
import { useTabEditor } from '@/hooks/useTabEditor';
import { useResumeList } from '@/hooks/useResumeList';
import { ListTabLayout } from '@/components/composite/ListTabLayout';
import { FormInput } from '@/components/ui/form-input';
import { SortButtons } from '../SortButtons';
import { EditorListItem } from '../shared/EditorListItem';
import { EditDeleteButtons } from '../EditDeleteButtons';
import { SectionAttachments } from '@/components/composite/SectionAttachments';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { HeartHandshake, ArrowUpRight } from 'lucide-react';
import { sortByDateDesc } from '@/lib/resume';

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
    handleToggleVisibility,
  } = useResumeList<any>('volunteering');

  const {
    view: volunteeringView,
    setView: setVolunteeringView,
    current: currentVolunteering,
    setCurrent: setCurrentVolunteering,
  } = useTabEditor<any>();

  const sortedVolunteering = useMemo(
    () => sortByDateDesc(volunteering),
    [volunteering],
  );

  const handleSave = () => {
    if (!currentVolunteering?.role || !currentVolunteering?.organization)
      return;
    saveVolunteering(currentVolunteering);
    setVolunteeringView('list');
    setCurrentVolunteering(null);
  };

  const currentYear = new Date().getFullYear();

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
        buttonText: "Add volunteering",
      }}
      renderList={() => (
        <>
          {sortedVolunteering.map(
            (v: any, index: number, sortedArray: any[]) => {
              const prevItem = index > 0 ? sortedArray[index - 1] : null;
              const canMoveUp =
                prevItem &&
                parseInt(v.startYear || '0') ===
                parseInt(prevItem.startYear || '0');
              const nextItem =
                index < sortedArray.length - 1 ? sortedArray[index + 1] : null;
              const canMoveDown =
                nextItem &&
                parseInt(v.startYear || '0') ===
                parseInt(nextItem.startYear || '0');

              return (
                <div
                  key={v.id}
                  className="group flex flex-col gap-4 sm:flex-row sm:gap-12 border-b border-border-subtle pb-5 mb-5 last:border-b-0 last:pb-0 last:mb-0"
                >
                  <div className="shrink-0 pt-0.5 text-sm text-content-muted sm:w-24">
                    {v.startYear} — {v.endYear}
                  </div>

                  <div className="flex flex-1 flex-col items-start justify-start">
                    <div
                      className={`w-full transition-all duration-200 ${v.hidden ? 'opacity-50 blur-[1px]' : ''}`}
                    >
                      {v.link ? (
                        <a
                          href={
                            v.link.startsWith('http')
                              ? v.link
                              : `https://${v.link}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block hover:underline hover:underline-offset-4"
                        >
                          <span className="text-sm font-semibold text-content-primary">
                            {v.role} at {v.organization}
                            <ArrowUpRight className="relative -top-0.5 ml-1 inline-block h-4 w-4 text-content-primary" />
                          </span>
                        </a>
                      ) : (
                        <p className="text-sm font-semibold text-content-primary">
                          {v.role} at {v.organization}
                        </p>
                      )}
                      {v.location && (
                        <p className="mt-1 text-sm text-content-muted">
                          {v.location}
                        </p>
                      )}

                      {v.description && v.description !== '<p></p>' && (
                        <div
                          className="prose prose-sm prose-ul:pl-0 prose-ol:pl-0 prose-li:pl-0 mt-4 max-w-none text-sm leading-relaxed text-content-muted prose-p:my-1 prose-p:text-content-muted prose-strong:text-content-primary prose-ul:my-1 prose-ul:text-content-muted prose-li:text-content-muted"
                          dangerouslySetInnerHTML={{
                            __html: v.description,
                          }}
                        />
                      )}
                      <div className="mt-4">
                        <AttachmentsPreview attachments={v.attachments} />
                      </div>
                    </div>

                    <EditDeleteButtons
                      isHidden={v.hidden}
                      onToggleVisibility={() => handleToggleVisibility(v)}
                      onEdit={() => {
                        setCurrentVolunteering(v);
                        setVolunteeringView('form');
                      }}
                      onDelete={() => setProjectToDelete(v.id)}
                    >
                      <SortButtons
                        canMoveUp={canMoveUp}
                        canMoveDown={canMoveDown}
                        onMoveUp={() => handleMoveUp(v, prevItem)}
                        onMoveDown={() => handleMoveUp(v, nextItem)}
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
        currentVolunteering ? (
          <>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs text-content-secondary">
                  From*
                </Label>
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
                <Label className="text-xs text-content-secondary">
                  To*
                </Label>
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
                    className={isReversedRange(currentVolunteering.startYear, currentVolunteering.endYear) ? 'border-red-500' : ''}
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
                {isReversedRange(currentVolunteering.startYear, currentVolunteering.endYear) && (
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
            <SectionAttachments
              attachments={currentVolunteering.attachments || []}
              onChange={(val) =>
                setCurrentVolunteering({
                  ...currentVolunteering,
                  attachments: val,
                })
              }
            />

            <TabFormActions
              onCancel={() => setVolunteeringView('list')}
              onSave={handleSave}
              isSaveDisabled={
                !currentVolunteering?.role ||
                !currentVolunteering?.organization ||
                isReversedRange(currentVolunteering.startYear, currentVolunteering.endYear)
              }
            />
          </>
        ) : null
      }
    />
  );
}
