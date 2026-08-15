'use client';

import { useMemo } from 'react';
import { isReversedRange } from '@/lib/validation/dates';
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
import { GraduationCap } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sortByDateDesc } from '@/lib/resume';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(
  () =>
    import('@/components/composite/RichTextEditor').then(
      (mod) => mod.RichTextEditor,
    ),
  { ssr: false },
);

export function EducationTab({
  years,
  setProjectToDelete,
}: {
  years: number[];
  setProjectToDelete: (id: string) => void;
}) {
  const {
    items: education,
    handleSave: saveEdu,
    handleMoveUp,
    handleToggleVisibility,
  } = useResumeList<any>('education');

  const {
    view: eduView,
    setView: setEduView,
    current: currentEdu,
    setCurrent: setCurrentEdu,
  } = useTabEditor<any>();

  const sortedEducation = useMemo(() => sortByDateDesc(education), [education]);

  const handleSave = () => {
    if (!currentEdu?.school || !currentEdu?.degree) return;
    saveEdu(currentEdu);
    setEduView('list');
    setCurrentEdu(null);
  };

  const currentYear = new Date().getFullYear();

  return (
    <ListTabLayout
      title="Education"
      view={eduView}
      itemsLength={education.length}
      onAdd={() => {
        setCurrentEdu({
          school: '',
          degree: '',
          start: currentYear.toString(),
          end: 'Now',
          location: '',
          description: '',
        });
        setEduView('form');
      }}
      addButtonText="Add education"
      emptyState={{
        icon: GraduationCap,
        buttonText: 'Add education',
      }}
      renderList={() => (
        <>
          {sortedEducation.map(
            (edu: any, index: number, sortedArray: any[]) => {
              const prevItem = index > 0 ? sortedArray[index - 1] : null;
              const canMoveUp =
                prevItem &&
                parseInt(edu.start || '0') === parseInt(prevItem.start || '0');
              const nextItem =
                index < sortedArray.length - 1 ? sortedArray[index + 1] : null;
              const canMoveDown =
                nextItem &&
                parseInt(edu.start || '0') === parseInt(nextItem.start || '0');

              return (
                <div
                  key={edu.id || edu.school}
                  className="group mb-5 flex flex-col gap-4 border-b border-border-subtle pb-5 last:mb-0 last:border-b-0 last:pb-0 sm:flex-row sm:gap-12"
                >
                  <div className="shrink-0 pt-0.5 text-sm text-content-muted sm:w-24">
                    {edu.start ? `${edu.start} — ${edu.end}` : edu.end}
                  </div>
                  <div className="flex flex-1 flex-col items-start justify-start">
                    <div
                      className={`w-full transition-all duration-200 ${edu.hidden ? 'opacity-50 blur-[1px]' : ''}`}
                    >
                      <p className="text-sm font-semibold text-content-primary">
                        {edu.degree} at {edu.school}
                      </p>
                      {edu.location && (
                        <p className="mt-1 text-sm text-content-muted">
                          {edu.location}
                        </p>
                      )}
                      {edu.description && edu.description !== '<p></p>' && (
                        <div
                          className="prose prose-sm mt-4 max-w-none text-sm leading-relaxed text-content-muted prose-p:my-1 prose-p:text-content-muted prose-strong:text-content-primary prose-ol:pl-0 prose-ul:my-1 prose-ul:pl-0 prose-ul:text-content-muted prose-li:pl-0 prose-li:text-content-muted"
                          dangerouslySetInnerHTML={{
                            __html: edu.description,
                          }}
                        />
                      )}
                      <div className="mt-4">
                        <AttachmentsPreview attachments={edu.attachments} />
                      </div>
                      <AvatarStack
                        collaborators={edu.collaborators}
                        size="sm"
                        ringClassName="ring-surface-1"
                      />
                    </div>
                    <EditDeleteButtons
                      isHidden={edu.hidden}
                      onToggleVisibility={() => handleToggleVisibility(edu)}
                      onEdit={() => {
                        setCurrentEdu(edu);
                        setEduView('form');
                      }}
                      onDelete={() => setProjectToDelete(edu.id)}
                    >
                      <SortButtons
                        canMoveUp={canMoveUp}
                        canMoveDown={canMoveDown}
                        onMoveUp={() => handleMoveUp(edu, prevItem)}
                        onMoveDown={() => handleMoveUp(edu, nextItem)}
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
        currentEdu ? (
          <>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs text-content-secondary">From*</Label>
                <Select
                  value={currentEdu.start || ''}
                  onValueChange={(val) =>
                    setCurrentEdu({
                      ...currentEdu,
                      start: val,
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
              <div className="space-y-2">
                <Label className="text-xs text-content-secondary">To*</Label>
                <Select
                  value={currentEdu.end || ''}
                  onValueChange={(val) =>
                    setCurrentEdu({ ...currentEdu, end: val })
                  }
                >
                  <SelectTrigger
                    className={
                      isReversedRange(currentEdu.start, currentEdu.end)
                        ? 'border-red-500'
                        : ''
                    }
                  >
                    <SelectValue placeholder="Year" />
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
                {isReversedRange(currentEdu.start, currentEdu.end) && (
                  <p className="text-xs text-red-500">
                    End year can&apos;t be earlier than the start year.
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormInput
                id="degree"
                label="Degree or certification*"
                value={currentEdu.degree}
                onChange={(e) =>
                  setCurrentEdu({ ...currentEdu, degree: e.target.value })
                }
                placeholder="Bachelor's in Graphic Design"
              />
              <FormInput
                id="school"
                label="School or institution*"
                value={currentEdu.school}
                onChange={(e) =>
                  setCurrentEdu({ ...currentEdu, school: e.target.value })
                }
                placeholder="Emily Carr University"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormInput
                id="location"
                label="Location"
                value={currentEdu.location || ''}
                onChange={(e) =>
                  setCurrentEdu({ ...currentEdu, location: e.target.value })
                }
                placeholder="New York"
              />
              <FormInput
                id="link"
                label="URL"
                value={currentEdu.link || ''}
                onChange={(e) =>
                  setCurrentEdu({ ...currentEdu, link: e.target.value })
                }
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">
                Description
              </Label>
              <RichTextEditor
                content={currentEdu.description || ''}
                onChange={(val) =>
                  setCurrentEdu({
                    ...currentEdu,
                    description: val,
                  })
                }
              />
            </div>
            <CollaboratorsField
              label="Classmates"
              value={currentEdu.collaborators || []}
              onChange={(val) =>
                setCurrentEdu({
                  ...currentEdu,
                  collaborators: val,
                })
              }
            />
            <SectionAttachments
              attachments={currentEdu.attachments || []}
              onChange={(val) =>
                setCurrentEdu({
                  ...currentEdu,
                  attachments: val,
                })
              }
            />

            <TabFormActions
              onCancel={() => setEduView('list')}
              onSave={handleSave}
              isSaveDisabled={
                !currentEdu?.school ||
                !currentEdu?.degree ||
                !currentEdu?.end ||
                isReversedRange(currentEdu?.start, currentEdu?.end)
              }
            />
          </>
        ) : null
      }
    />
  );
}
