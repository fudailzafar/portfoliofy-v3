import { useMemo } from 'react';
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
import { Award, ArrowUpRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sortByDateDesc } from '@/lib/resume';

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
    handleToggleVisibility,
  } = useResumeList<any>('awards');

  const {
    view: awardsView,
    setView: setAwardsView,
    current: currentAward,
    setCurrent: setCurrentAward,
  } = useTabEditor<any>();

  const sortedAwards = useMemo(() => sortByDateDesc(awards), [awards]);

  const handleSave = () => {
    if (!currentAward?.title || !currentAward?.year || !currentAward?.issuer)
      return;
    saveAward(currentAward);
    setAwardsView('list');
    setCurrentAward(null);
  };

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
      renderList={() => (
        <>
          {sortedAwards.map((award: any, index: number, sortedArray: any[]) => {
            const prevItem = index > 0 ? sortedArray[index - 1] : null;
            const canMoveUp =
              prevItem &&
              parseInt(award.year || '0') === parseInt(prevItem.year || '0');
            const nextItem =
              index < sortedArray.length - 1 ? sortedArray[index + 1] : null;
            const canMoveDown =
              nextItem &&
              parseInt(award.year || '0') === parseInt(nextItem.year || '0');
            return (
              <div
                key={award.id}
                className="group mb-5 flex flex-col gap-4 border-b border-border-subtle pb-5 last:mb-0 last:border-b-0 last:pb-0 sm:flex-row sm:gap-12"
              >
                <div className="shrink-0 pt-0.5 text-sm text-content-muted sm:w-24">
                  {award.year}
                </div>

                <div className="flex flex-1 flex-col items-start justify-start">
                  <div
                    className={`w-full transition-all duration-200 ${award.hidden ? 'opacity-50 blur-[1px]' : ''}`}
                  >
                    {award.link ? (
                      <a
                        href={
                          award.link.startsWith('http')
                            ? award.link
                            : `https://${award.link}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block hover:underline hover:underline-offset-4"
                      >
                        <span className="text-sm font-semibold text-content-primary">
                          {award.title} from {award.issuer}
                          <ArrowUpRight className="relative -top-0.5 ml-1 inline-block h-4 w-4 text-content-primary" />
                        </span>
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-content-primary">
                        {award.title} from {award.issuer}
                      </p>
                    )}

                    {award.description && award.description !== '<p></p>' && (
                      <div
                        className="prose prose-sm mt-4 max-w-none text-sm leading-relaxed text-content-muted prose-p:my-1 prose-p:text-content-muted prose-strong:text-content-primary prose-ol:pl-0 prose-ul:my-1 prose-ul:pl-0 prose-ul:text-content-muted prose-li:pl-0 prose-li:text-content-muted"
                        dangerouslySetInnerHTML={{
                          __html: award.description,
                        }}
                      />
                    )}
                    <div className="mt-4">
                      <AttachmentsPreview attachments={award.attachments} />
                    </div>
                    <AvatarStack
                      collaborators={award.collaborators}
                      size="sm"
                      ringClassName="ring-surface-1"
                    />
                  </div>

                  <EditDeleteButtons
                    isHidden={award.hidden}
                    onToggleVisibility={() => handleToggleVisibility(award)}
                    onEdit={() => {
                      setCurrentAward(award);
                      setAwardsView('form');
                    }}
                    onDelete={() => setProjectToDelete(award.id)}
                  >
                    <SortButtons
                      canMoveUp={canMoveUp}
                      canMoveDown={canMoveDown}
                      onMoveUp={() => handleMoveUp(award, prevItem)}
                      onMoveDown={() => handleMoveUp(award, nextItem)}
                    />
                  </EditDeleteButtons>
                </div>
              </div>
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
            <SectionAttachments
              attachments={currentAward.attachments || []}
              onChange={(val) =>
                setCurrentAward({
                  ...currentAward,
                  attachments: val,
                })
              }
            />
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

            <TabFormActions
              onCancel={() => setAwardsView('list')}
              onSave={handleSave}
              isSaveDisabled={
                !currentAward?.title ||
                !currentAward?.year ||
                !currentAward?.issuer
              }
            />
          </>
        ) : null
      }
    />
  );
}
