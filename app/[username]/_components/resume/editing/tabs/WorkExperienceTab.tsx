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
import { Briefcase, ArrowUpRight } from 'lucide-react';
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
              <div
                key={w.id || w.company}
                className="group mb-5 flex flex-col gap-4 border-b border-border-subtle pb-5 last:mb-0 last:border-b-0 last:pb-0 sm:flex-row sm:gap-12"
              >
                <div className="shrink-0 pt-0.5 text-sm text-content-muted sm:w-24">
                  {w.start} — {w.end}
                </div>

                <div className="flex flex-1 flex-col items-start justify-start">
                  <div
                    className={`w-full transition-all duration-200 ${w.hidden ? 'opacity-50 blur-[1px]' : ''}`}
                  >
                    {w.link ? (
                      <a
                        href={
                          w.link.startsWith('http')
                            ? w.link
                            : `https://${w.link}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block hover:underline hover:underline-offset-4"
                      >
                        <span className="text-sm font-semibold text-content-primary">
                          {w.title} at {w.company}
                          <ArrowUpRight className="relative -top-0.5 ml-1 inline-block h-4 w-4 text-content-primary" />
                        </span>
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-content-primary">
                        {w.title} at {w.company}
                      </p>
                    )}
                    {w.location && (
                      <p className="mt-1 text-sm text-content-muted">
                        {w.location}
                      </p>
                    )}

                    {w.description && w.description !== '<p></p>' && (
                      <div
                        className="prose prose-sm mt-4 max-w-none text-sm leading-relaxed text-content-muted prose-p:my-1 prose-p:text-content-muted prose-strong:text-content-primary prose-ol:pl-0 prose-ul:my-1 prose-ul:pl-0 prose-ul:text-content-muted prose-li:pl-0 prose-li:text-content-muted"
                        dangerouslySetInnerHTML={{
                          __html: w.description,
                        }}
                      />
                    )}
                    <div className="mt-4">
                      <AttachmentsPreview attachments={w.attachments} />
                    </div>
                    <AvatarStack
                      collaborators={w.collaborators}
                      size="sm"
                      ringClassName="ring-surface-1"
                    />
                  </div>

                  <EditDeleteButtons
                    isHidden={w.hidden}
                    onToggleVisibility={() => handleToggleVisibility(w)}
                    onEdit={() => {
                      setCurrentWork(w);
                      setWorkView('form');
                    }}
                    onDelete={() => setProjectToDelete(w.id)}
                  >
                    <SortButtons
                      canMoveUp={canMoveUp}
                      canMoveDown={canMoveDown}
                      onMoveUp={() => handleMoveUp(w, prevItem)}
                      onMoveDown={() => handleMoveUp(w, nextItem)}
                    />
                  </EditDeleteButtons>
                </div>
              </div>
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
            <SectionAttachments
              attachments={currentWork.attachments || []}
              onChange={(val) =>
                setCurrentWork({
                  ...currentWork,
                  attachments: val,
                })
              }
            />
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
