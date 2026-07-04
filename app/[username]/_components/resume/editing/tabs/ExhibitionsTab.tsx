import React, { useMemo } from 'react';
import { useTabEditor } from '@/hooks/useTabEditor';
import { useResumeList } from '@/hooks/useResumeList';
import { ListTabLayout } from '@/components/composite/ListTabLayout';
import { FormInput } from '@/components/ui/form-input';
import { SortButtons } from '../SortButtons';
import { EditDeleteButtons } from '../EditDeleteButtons';
import { SectionAttachments } from '@/components/composite/SectionAttachments';
import { AttachmentsPreview } from '../../preview/AttachmentsPreview';
import { TabFormActions } from '../TabFormActions';
import { Label } from '@/components/ui/label';
import { Palette, ArrowUpRight } from 'lucide-react';
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
    handleToggleVisibility,
  } = useResumeList<any>('exhibitions');

  const {
    view: exhibitionsView,
    setView: setExhibitionsView,
    current: currentExhibition,
    setCurrent: setCurrentExhibition,
  } = useTabEditor<any>();

  const sortedExhibitions = useMemo(
    () => sortByDateDesc(exhibitions),
    [exhibitions],
  );

  const handleSave = () => {
    if (!currentExhibition?.title || !currentExhibition?.year) return;
    saveExhibition(currentExhibition);
    setExhibitionsView('list');
    setCurrentExhibition(null);
  };

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
        buttonText: "Add an exhibition",
      }}
      renderList={() => (
        <>
          {sortedExhibitions.map(
            (exhibition: any, index: number, sortedArray: any[]) => {
              const prevItem = index > 0 ? sortedArray[index - 1] : null;
              const canMoveUp =
                prevItem &&
                parseInt(exhibition.year || '0') ===
                  parseInt(prevItem.year || '0');
              const nextItem =
                index < sortedArray.length - 1 ? sortedArray[index + 1] : null;
              const canMoveDown =
                nextItem &&
                parseInt(exhibition.year || '0') ===
                  parseInt(nextItem.year || '0');

              return (
                <div
                  key={exhibition.id}
                  className="group flex flex-col gap-4 sm:flex-row sm:gap-12 border-b border-border-subtle pb-5 mb-5 last:border-b-0 last:pb-0 last:mb-0"
                >
                  <div className="shrink-0 pt-0.5 text-sm text-content-muted sm:w-24">
                    {exhibition.year}
                  </div>

                  <div className="flex flex-1 flex-col items-start justify-start">
                    <div
                      className={`w-full transition-all duration-200 ${exhibition.hidden ? 'opacity-50 blur-[1px]' : ''}`}
                    >
                      {exhibition.link ? (
                        <a
                          href={
                            exhibition.link.startsWith('http')
                              ? exhibition.link
                              : `https://${exhibition.link}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block hover:underline hover:underline-offset-4"
                        >
                          <span className="text-sm font-semibold text-content-primary">
                            {exhibition.title}
                            {exhibition.organization
                              ? ` at ${exhibition.organization}`
                              : ''}
                            <ArrowUpRight className="relative -top-0.5 ml-1 inline-block h-4 w-4 text-content-primary" />
                          </span>
                        </a>
                      ) : (
                        <p className="text-sm font-semibold text-content-primary">
                          {exhibition.title}
                          {exhibition.organization
                            ? ` at ${exhibition.organization}`
                            : ''}
                        </p>
                      )}

                      {exhibition.location && (
                        <div className="mt-1 text-sm text-content-muted">
                          {exhibition.location}
                        </div>
                      )}

                      {exhibition.description && exhibition.description !== '<p></p>' && (
                        <div
                          className="prose prose-sm prose-ul:pl-0 prose-ol:pl-0 prose-li:pl-0 mt-4 max-w-none text-sm leading-relaxed text-content-muted prose-p:my-1 prose-p:text-content-muted prose-strong:text-content-primary prose-ul:my-1 prose-ul:text-content-muted prose-li:text-content-muted"
                          dangerouslySetInnerHTML={{
                            __html: exhibition.description,
                          }}
                        />
                      )}
                      <div className="mt-4">
                        <AttachmentsPreview
                          attachments={exhibition.attachments}
                        />
                      </div>
                    </div>

                    <EditDeleteButtons
                      isHidden={exhibition.hidden}
                      onToggleVisibility={() =>
                        handleToggleVisibility(exhibition)
                      }
                      onEdit={() => {
                        setCurrentExhibition(exhibition);
                        setExhibitionsView('form');
                      }}
                      onDelete={() => setProjectToDelete(exhibition.id)}
                    >
                      <SortButtons
                        canMoveUp={canMoveUp}
                        canMoveDown={canMoveDown}
                        onMoveUp={() => handleMoveUp(exhibition, prevItem)}
                        onMoveDown={() => handleMoveUp(exhibition, nextItem)}
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
        currentExhibition ? (
          <>
            <div className="grid grid-cols-2 gap-6">
              <FormInput
                id="title"
                label="Title*"
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
                placeholder="Vancouver"
              />
            </div>

            <FormInput
              id="link"
              label="Link"
              value={currentExhibition.link || ''}
              onChange={(e) =>
                setCurrentExhibition({
                  ...currentExhibition,
                  link: e.target.value,
                })
              }
              placeholder="https://example.com"
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

            <TabFormActions
              onCancel={() => setExhibitionsView('list')}
              onSave={handleSave}
              isSaveDisabled={
                !currentExhibition?.title || !currentExhibition?.year
              }
            />
          </>
        ) : null
      }
    />
  );
}
