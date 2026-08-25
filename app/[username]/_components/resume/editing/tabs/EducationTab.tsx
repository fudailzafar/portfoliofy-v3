'use client';

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
import { GraduationCap } from 'lucide-react';
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

const isEducationValid = (item: any) =>
  !!item?.school &&
  !!item?.degree &&
  !!item?.end &&
  !isReversedRange(item?.start, item?.end);

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
    handleMoveDown,
    handleToggleVisibility,
  } = useResumeList<any>('education');

  const {
    view: eduView,
    setView: setEduView,
    current: currentEdu,
    setCurrent: setCurrentEdu,
  } = useTabEditor<any>({ isValid: isEducationValid, onCommit: saveEdu });

  const sortedEducation = useMemo(() => sortByDateDesc(education), [education]);

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
        buttonText: 'Add a school you attended',
      }}
      renderList={() => (
        <>
          {sortedEducation.map(
            (edu: any, index: number, sortedArray: any[]) => {
              const { prevItem, nextItem, canMoveUp, canMoveDown } =
                getListAdjacency(sortedArray, index);

              return (
                <EditorListItem
                  key={edu.id || edu.school}
                  leftContent={
                    edu.start ? `${edu.start} — ${edu.end}` : edu.end
                  }
                  title={edu.degree}
                  subtitle={` at ${edu.school}`}
                  location={edu.location}
                  description={edu.description}
                  attachments={edu.attachments}
                  collaborators={edu.collaborators}
                  isHidden={edu.hidden}
                  canMoveUp={canMoveUp}
                  canMoveDown={canMoveDown}
                  onMoveUp={() => handleMoveUp(edu, prevItem)}
                  onMoveDown={() => handleMoveDown(edu, nextItem)}
                  onToggleVisibility={() => handleToggleVisibility(edu)}
                  onEdit={() => {
                    setCurrentEdu(edu);
                    setEduView('form');
                  }}
                  onDelete={() => setProjectToDelete(edu.id)}
                />
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
                placeholder="Bachelor of Design"
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
                placeholder="Where was it"
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

            <SectionAttachments
              attachments={currentEdu.attachments || []}
              onChange={(val) =>
                setCurrentEdu({
                  ...currentEdu,
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
