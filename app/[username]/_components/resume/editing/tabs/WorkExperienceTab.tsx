import React, { useMemo } from 'react';
import { isReversedRange } from '@/lib/validation/dates';
import { useTabEditor } from '@/hooks/useTabEditor';
import { useResumeList } from '@/hooks/useResumeList';
import { ListTabLayout } from '@/components/composite/ListTabLayout';
import { FormInput } from '@/components/ui/form-input';
import { EditorListItem } from '../shared/EditorListItem';
import { SectionAttachments } from '@/components/composite/SectionAttachments';
import { CollaboratorsField } from '@/components/composite/CollaboratorsField';
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
import { Briefcase } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sortByDateDesc } from '@/lib/resume';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function WorkExperienceTab({
  years,
  setProjectToDelete,
}: {
  years: number[];
  setProjectToDelete: (id: string) => void;
}) {
  const {
    items: work,
    handleSave: saveWork,
    handleMoveUp,
    handleToggleVisibility,
  } = useResumeList<any>('workExperience');

  const {
    view: workView,
    setView: setWorkView,
    current: currentWork,
    setCurrent: setCurrentWork,
  } = useTabEditor<any>();

  const sortedWork = useMemo(() => sortByDateDesc(work), [work]);

  const handleSave = () => {
    if (!currentWork?.title || !currentWork?.company) return;
    saveWork(currentWork);
    setWorkView('list');
    setCurrentWork(null);
  };

  const currentYear = new Date().getFullYear();

  return (
    <ListTabLayout
      title="Work Experience"
      view={workView}
      itemsLength={work.length}
      onAdd={() => {
        setCurrentWork({
          company: '',
          title: '',
          startMonth: '',
          start: currentYear.toString(),
          endMonth: '',
          end: 'Now',
          location: '',
          link: '',
          contract: '',
          description: '',
        });
        setWorkView('form');
      }}
      addButtonText="Add workplace"
      emptyState={{
        icon: Briefcase,
        buttonText: 'Add workplace',
      }}
      renderList={() => (
        <>
          {sortedWork.map((w: any, index: number, sortedArray: any[]) => {
            const prevItem = index > 0 ? sortedArray[index - 1] : null;
            const canMoveUp =
              prevItem &&
              parseInt(w.start || '0') === parseInt(prevItem.start || '0');
            const nextItem =
              index < sortedArray.length - 1 ? sortedArray[index + 1] : null;
            const canMoveDown =
              nextItem &&
              parseInt(w.start || '0') === parseInt(nextItem.start || '0');
            return (
              <EditorListItem
                key={w.id || w.company}
                leftContent={`${w.start} — ${w.end}`}
                title={w.title}
                subtitle={` at ${w.company}`}
                link={w.link}
                location={w.location}
                description={w.description}
                attachments={w.attachments}
                collaborators={w.collaborators}
                isHidden={w.hidden}
                canMoveUp={canMoveUp}
                canMoveDown={canMoveDown}
                onMoveUp={() => handleMoveUp(w, prevItem)}
                onMoveDown={() => handleMoveUp(w, nextItem)}
                onToggleVisibility={() => handleToggleVisibility(w)}
                onEdit={() => {
                  setCurrentWork(w);
                  setWorkView('form');
                }}
                onDelete={() => setProjectToDelete(w.id)}
              />
            );
          })}
        </>
      )}
      renderForm={() =>
        currentWork ? (
          <>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs text-content-secondary">From*</Label>
                <Select
                  value={currentWork.start || ''}
                  onValueChange={(val) =>
                    setCurrentWork({ ...currentWork, start: val })
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
                  value={currentWork.end || ''}
                  onValueChange={(val) =>
                    setCurrentWork({ ...currentWork, end: val })
                  }
                >
                  <SelectTrigger
                    className={
                      isReversedRange(currentWork.start, currentWork.end)
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
                {isReversedRange(currentWork.start, currentWork.end) && (
                  <p className="text-xs text-red-500">
                    End year can&apos;t be earlier than the start year.
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormInput
                id="title"
                label="Title*"
                value={currentWork.title}
                onChange={(e) =>
                  setCurrentWork({
                    ...currentWork,
                    title: e.target.value,
                  })
                }
                placeholder="Senior Product Designer"
              />
              <FormInput
                id="company"
                label="Company*"
                value={currentWork.company}
                onChange={(e) =>
                  setCurrentWork({
                    ...currentWork,
                    company: e.target.value,
                  })
                }
                placeholder="Acme Design Studio"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormInput
                id="location"
                label="Location"
                value={currentWork.location || ''}
                onChange={(e) =>
                  setCurrentWork({
                    ...currentWork,
                    location: e.target.value,
                  })
                }
                placeholder="San Francisco, CA"
              />
              <FormInput
                id="link"
                label="URL"
                value={currentWork.link || ''}
                onChange={(e) =>
                  setCurrentWork({
                    ...currentWork,
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
                content={currentWork.description || ''}
                onChange={(val) =>
                  setCurrentWork({ ...currentWork, description: val })
                }
              />
            </div>
            <CollaboratorsField
              label="Coworkers"
              value={currentWork.collaborators || []}
              onChange={(val) =>
                setCurrentWork({
                  ...currentWork,
                  collaborators: val,
                })
              }
            />
            <SectionAttachments
              attachments={currentWork.attachments || []}
              onChange={(val) =>
                setCurrentWork({
                  ...currentWork,
                  attachments: val,
                })
              }
            />

            <TabFormActions
              onCancel={() => setWorkView('list')}
              onSave={handleSave}
              isSaveDisabled={
                !currentWork?.title ||
                !currentWork?.company ||
                isReversedRange(currentWork.start, currentWork.end)
              }
            />
          </>
        ) : null
      }
    />
  );
}
