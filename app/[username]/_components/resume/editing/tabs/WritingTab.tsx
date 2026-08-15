import React, { useMemo } from 'react';
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
import { Pen, ArrowUpRight } from 'lucide-react';
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

export function WritingTab({
  years,
  setProjectToDelete,
}: {
  years: number[];
  setProjectToDelete: (id: string) => void;
}) {
  const {
    items: writing,
    handleSave: saveWriting,
    handleMoveUp,
    handleToggleVisibility,
  } = useResumeList<any>('writing');

  const {
    view: writingView,
    setView: setWritingView,
    current: currentWriting,
    setCurrent: setCurrentWriting,
  } = useTabEditor<any>();

  const sortedWriting = useMemo(() => sortByDateDesc(writing), [writing]);

  const handleSave = () => {
    if (!currentWriting?.title || !currentWriting?.year) return;
    saveWriting(currentWriting);
    setWritingView('list');
    setCurrentWriting(null);
  };

  const currentYear = new Date().getFullYear();

  return (
    <ListTabLayout
      title="Writing"
      view={writingView}
      itemsLength={writing.length}
      onAdd={() => {
        setCurrentWriting({
          title: '',
          year: currentYear.toString(),
          publication: '',
          link: '',
          description: '',
        });
        setWritingView('form');
      }}
      addButtonText="Add writing piece"
      emptyState={{
        icon: Pen,
        buttonText: "Add a piece you've written",
      }}
      renderList={() => (
        <>
          {sortedWriting.map(
            (piece: any, index: number, sortedArray: any[]) => {
              const prevItem = index > 0 ? sortedArray[index - 1] : null;
              const canMoveUp =
                prevItem &&
                parseInt(piece.year || '0') === parseInt(prevItem.year || '0');
              const nextItem =
                index < sortedArray.length - 1 ? sortedArray[index + 1] : null;
              const canMoveDown =
                nextItem &&
                parseInt(piece.year || '0') === parseInt(nextItem.year || '0');

              return (
                <div
                  key={piece.id}
                  className="group mb-5 flex flex-col gap-4 border-b border-border-subtle pb-5 last:mb-0 last:border-b-0 last:pb-0 sm:flex-row sm:gap-12"
                >
                  <div className="shrink-0 pt-0.5 text-sm text-content-muted sm:w-24">
                    {piece.year}
                  </div>

                  <div className="flex flex-1 flex-col items-start justify-start">
                    <div
                      className={`w-full transition-all duration-200 ${piece.hidden ? 'opacity-50 blur-[1px]' : ''}`}
                    >
                      {piece.link ? (
                        <a
                          href={
                            piece.link.startsWith('http')
                              ? piece.link
                              : `https://${piece.link}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block hover:underline hover:underline-offset-4"
                        >
                          <span className="text-sm font-semibold text-content-primary">
                            {piece.title}
                            {piece.publication ? `, ${piece.publication}` : ''}
                            <ArrowUpRight className="relative -top-0.5 ml-1 inline-block h-4 w-4 text-content-primary" />
                          </span>
                        </a>
                      ) : (
                        <p className="text-sm font-semibold text-content-primary">
                          {piece.title}
                          {piece.publication ? `, ${piece.publication}` : ''}
                        </p>
                      )}

                      {piece.description && piece.description !== '<p></p>' && (
                        <div
                          className="prose prose-sm mt-4 max-w-none text-sm leading-relaxed text-content-muted prose-p:my-1 prose-p:text-content-muted prose-strong:text-content-primary prose-ol:pl-0 prose-ul:my-1 prose-ul:pl-0 prose-ul:text-content-muted prose-li:pl-0 prose-li:text-content-muted"
                          dangerouslySetInnerHTML={{
                            __html: piece.description,
                          }}
                        />
                      )}
                      <div className="mt-4">
                        <AttachmentsPreview attachments={piece.attachments} />
                      </div>
                      <AvatarStack
                        collaborators={piece.collaborators}
                        size="sm"
                        ringClassName="ring-surface-1"
                      />
                    </div>

                    <EditDeleteButtons
                      isHidden={piece.hidden}
                      onToggleVisibility={() => handleToggleVisibility(piece)}
                      onEdit={() => {
                        setCurrentWriting(piece);
                        setWritingView('form');
                      }}
                      onDelete={() => setProjectToDelete(piece.id)}
                    >
                      <SortButtons
                        canMoveUp={canMoveUp}
                        canMoveDown={canMoveDown}
                        onMoveUp={() => handleMoveUp(piece, prevItem)}
                        onMoveDown={() => handleMoveUp(piece, nextItem)}
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
        currentWriting ? (
          <>
            <div className="grid grid-cols-2 gap-6">
              <FormInput
                id="title"
                label="Title*"
                value={currentWriting.title}
                onChange={(e) =>
                  setCurrentWriting({
                    ...currentWriting,
                    title: e.target.value,
                  })
                }
                placeholder="My great piece"
              />
              <div className="space-y-2">
                <Label className="text-xs text-content-secondary">Year*</Label>
                <Select
                  value={currentWriting.year}
                  onValueChange={(val) =>
                    setCurrentWriting({
                      ...currentWriting,
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
                id="publication"
                label="Publication"
                value={currentWriting.publication || ''}
                onChange={(e) =>
                  setCurrentWriting({
                    ...currentWriting,
                    publication: e.target.value,
                  })
                }
                placeholder="Jacobin Magazine"
              />
              <FormInput
                id="link"
                label="Link"
                value={currentWriting.link || ''}
                onChange={(e) =>
                  setCurrentWriting({
                    ...currentWriting,
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
                content={currentWriting.description || ''}
                onChange={(val) =>
                  setCurrentWriting({
                    ...currentWriting,
                    description: val,
                  })
                }
              />
            </div>
            <CollaboratorsField
              label="Collaborators"
              value={currentWriting.collaborators || []}
              onChange={(val) =>
                setCurrentWriting({
                  ...currentWriting,
                  collaborators: val,
                })
              }
            />
            <SectionAttachments
              attachments={currentWriting.attachments || []}
              onChange={(val) =>
                setCurrentWriting({
                  ...currentWriting,
                  attachments: val,
                })
              }
            />

            <TabFormActions
              onCancel={() => setWritingView('list')}
              onSave={handleSave}
              isSaveDisabled={!currentWriting?.title || !currentWriting?.year}
            />
          </>
        ) : null
      }
    />
  );
}
