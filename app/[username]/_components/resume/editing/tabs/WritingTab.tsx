import React, { useMemo } from 'react';
import { useTabEditor } from '@/hooks/useTabEditor';
import { useResumeList } from '@/hooks/useResumeList';
import { ListTabLayout } from '@/components/composite/ListTabLayout';
import { FormInput } from '@/components/ui/form-input';
import { EditorListItem } from '../shared/EditorListItem';
import { SectionAttachments } from '@/components/composite/SectionAttachments';
import { CollaboratorsField } from '@/components/composite/CollaboratorsField';
import { TabFormActions } from '../TabFormActions';
import { Label } from '@/components/ui/label';
import { Pen } from 'lucide-react';
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
    handleMoveDown,
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
              const { prevItem, nextItem, canMoveUp, canMoveDown } =
                getListAdjacency(sortedArray, index);

              return (
                <EditorListItem
                  key={piece.id}
                  leftContent={piece.year}
                  title={piece.title}
                  subtitle={
                    piece.publication ? `, ${piece.publication}` : undefined
                  }
                  link={piece.link}
                  description={piece.description}
                  attachments={piece.attachments}
                  collaborators={piece.collaborators}
                  isHidden={piece.hidden}
                  canMoveUp={canMoveUp}
                  canMoveDown={canMoveDown}
                  onMoveUp={() => handleMoveUp(piece, prevItem)}
                  onMoveDown={() => handleMoveDown(piece, nextItem)}
                  onToggleVisibility={() => handleToggleVisibility(piece)}
                  onEdit={() => {
                    setCurrentWriting(piece);
                    setWritingView('form');
                  }}
                  onDelete={() => setProjectToDelete(piece.id)}
                />
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
