import React, { useMemo } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { useTabEditor } from '@/hooks/useTabEditor';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Pen } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { sortByDateDesc } from '@/lib/resume';
import { SortButtons } from '../SortButtons';
import { EditDeleteButtons } from '../EditDeleteButtons';
import { SectionAttachments } from '@/components/composite/SectionAttachments';
import { AttachmentsPreview } from '../../preview/AttachmentsPreview';
import { TabHeader } from '../TabHeader';
import { TabFormActions } from '../TabFormActions';
import { EmptyState } from '../EmptyState';
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
  const resume = useResumeStore((state) => state.resume);
  const updateResume = useResumeStore((state) => state.updateResume);
  const {
    view: writingView,
    setView: setWritingView,
    current: currentWriting,
    setCurrent: setCurrentWriting,
  } = useTabEditor<any>();

  const writing = useMemo(() => resume?.writing || [], [resume?.writing]);
  const sortedWriting = useMemo(() => sortByDateDesc(writing), [writing]);

  if (!resume) return null;

  const handleSave = () => {
    if (!currentWriting?.title || !currentWriting?.year) return;

    const isEdit = !!currentWriting.id;
    const newItem = isEdit
      ? currentWriting
      : { ...currentWriting, id: Date.now().toString() };

    const newItems = isEdit
      ? writing.map((p: any) => (p.id === currentWriting.id ? newItem : p))
      : [...writing, newItem];

    updateResume({ writing: newItems });
    setWritingView('list');
    setCurrentWriting(null);
  };

  const handleMoveUp = (currentItem: any, prevItem: any) => {
    const newItems = [...writing];
    const idx1 = newItems.findIndex((i: any) => i.id === currentItem.id);
    const idx2 = newItems.findIndex((i: any) => i.id === prevItem.id);

    if (idx1 !== -1 && idx2 !== -1) {
      [newItems[idx1], newItems[idx2]] = [newItems[idx2], newItems[idx1]];
      updateResume({ writing: newItems });
    }
  };

  const handleToggleVisibility = (item: any) => {
    const newItems = writing.map((s: any) =>
      s.id === item.id ? { ...s, hidden: !s.hidden } : s,
    );
    updateResume({ writing: newItems });
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <TabHeader
        title="Writing"
        showAddButton={writingView === 'list'}
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
      />

      {writingView === 'list' && writing.length === 0 && (
        <EmptyState
          icon={Pen}
          buttonText="Add a piece you've written"
          onClick={() => {
            setCurrentWriting({
              title: '',
              year: currentYear.toString(),
              publication: '',
              link: '',
              description: '',
            });
            setWritingView('form');
          }}
        />
      )}

      {writingView === 'list' && writing.length > 0 && (
        <div className="space-y-8">
          {sortedWriting.map(
            (piece: any, index: number, sortedArray: any[]) => {
              const prevItem = index > 0 ? sortedArray[index - 1] : null;
              const canMoveUp =
                prevItem &&
                parseInt(piece.year || '0') ===
                  parseInt(prevItem.year || '0');
              const nextItem =
                index < sortedArray.length - 1 ? sortedArray[index + 1] : null;
              const canMoveDown =
                nextItem &&
                parseInt(piece.year || '0') ===
                  parseInt(nextItem.year || '0');

              return (
                <div
                  key={piece.id}
                  className="group flex flex-col gap-4 sm:flex-row sm:gap-12"
                >
                  <div className="shrink-0 pt-0.5 text-sm text-content-muted sm:w-16">
                    {piece.year}
                  </div>

                  <div className="flex flex-1 flex-col items-start justify-start">
                    <div className={`w-full transition-all duration-200 ${piece.hidden ? 'opacity-50 blur-[1px]' : ''}`}>
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
                      <div className="mt-4"><AttachmentsPreview attachments={piece.attachments} /></div>
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
        </div>
      )}

      {writingView === 'form' && currentWriting && (
        <div className="space-y-6 pb-24">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">Title*</Label>
              <Input
                value={currentWriting.title}
                onChange={(e) =>
                  setCurrentWriting({
                    ...currentWriting,
                    title: e.target.value,
                  })
                }
                placeholder="My great piece"
              />
            </div>
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
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">Publication</Label>
              <Input
                value={currentWriting.publication || ''}
                onChange={(e) =>
                  setCurrentWriting({
                    ...currentWriting,
                    publication: e.target.value,
                  })
                }
                placeholder="Jacobin Magazine"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">Link</Label>
              <Input
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
        </div>
      )}
    </div>
  );
}
