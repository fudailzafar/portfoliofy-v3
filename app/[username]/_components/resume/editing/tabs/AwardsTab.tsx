import { useMemo } from 'react';
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
import { Award } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sortByDateDesc, getListAdjacency } from '@/lib/resume';

const isAwardValid = (item: any) =>
  !!item?.title && !!item?.year && !!item?.issuer;

export function AwardsTab({
  years,
  setProjectToDelete,
}: {
  years: number[];
  setProjectToDelete: (id: string) => void;
}) {
  const {
    items: awards,
    handleSave: saveAward,
    handleMoveUp,
    handleMoveDown,
    handleToggleVisibility,
  } = useResumeList<any>('awards');

  const {
    view: awardsView,
    setView: setAwardsView,
    current: currentAward,
    setCurrent: setCurrentAward,
    commit: commitAward,
  } = useTabEditor<any>({ isValid: isAwardValid, onCommit: saveAward });

  const sortedAwards = useMemo(() => sortByDateDesc(awards), [awards]);

  const currentYear = new Date().getFullYear();

  return (
    <ListTabLayout
      title="Awards"
      view={awardsView}
      itemsLength={awards.length}
      onAdd={() => {
        setCurrentAward({
          title: '',
          issuer: '',
          year: currentYear.toString(),
          link: '',
          description: '',
        });
        setAwardsView('form');
      }}
      addButtonText="Add award"
      emptyState={{
        icon: Award,
        buttonText: 'Add an award you received',
      }}
      onBack={() => {
        commitAward();
        setAwardsView('list');
      }}
      renderList={() => (
        <>
          {sortedAwards.map((award: any, index: number, sortedArray: any[]) => {
            const { prevItem, nextItem, canMoveUp, canMoveDown } =
              getListAdjacency(sortedArray, index);
            return (
              <EditorListItem
                key={award.id}
                leftContent={award.year}
                title={award.title}
                subtitle={` from ${award.issuer}`}
                link={award.link}
                description={award.description}
                attachments={award.attachments}
                collaborators={award.collaborators}
                isHidden={award.hidden}
                canMoveUp={canMoveUp}
                canMoveDown={canMoveDown}
                onMoveUp={() => handleMoveUp(award, prevItem)}
                onMoveDown={() => handleMoveDown(award, nextItem)}
                onToggleVisibility={() => handleToggleVisibility(award)}
                onEdit={() => {
                  setCurrentAward(award);
                  setAwardsView('form');
                }}
                onDelete={() => setProjectToDelete(award.id)}
              />
            );
          })}
        </>
      )}
      renderForm={() =>
        currentAward ? (
          <>
            <div className="grid grid-cols-2 gap-6">
              <FormInput
                id="title"
                label="Title*"
                value={currentAward.title}
                onChange={(e) =>
                  setCurrentAward({
                    ...currentAward,
                    title: e.target.value,
                  })
                }
                placeholder="My great award"
              />
              <div className="space-y-2">
                <Label className="text-xs text-content-secondary">Year*</Label>
                <Select
                  value={currentAward.year}
                  onValueChange={(val) =>
                    setCurrentAward({
                      ...currentAward,
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
                id="issuer"
                label="Issuer*"
                value={currentAward.issuer || ''}
                onChange={(e) =>
                  setCurrentAward({
                    ...currentAward,
                    issuer: e.target.value,
                  })
                }
                placeholder="Apple"
              />
              <FormInput
                id="link"
                label="Link to award"
                value={currentAward.link || ''}
                onChange={(e) =>
                  setCurrentAward({
                    ...currentAward,
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
                content={currentAward.description || ''}
                onChange={(val) =>
                  setCurrentAward({
                    ...currentAward,
                    description: val,
                  })
                }
              />
            </div>
            <CollaboratorsField
              label="Collaborators"
              value={currentAward.collaborators || []}
              onChange={(val) =>
                setCurrentAward({
                  ...currentAward,
                  collaborators: val,
                })
              }
            />
            <SectionAttachments
              attachments={currentAward.attachments || []}
              onChange={(val) =>
                setCurrentAward({
                  ...currentAward,
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
