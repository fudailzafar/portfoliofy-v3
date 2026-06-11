import { useMemo } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { useTabEditor } from '@/hooks/useTabEditor';
import { SortButtons } from '../SortButtons';
import { EditDeleteButtons } from '../EditDeleteButtons';
import { TabHeader } from '../TabHeader';
import { TabFormActions } from '../TabFormActions';
import { EmptyState } from '../EmptyState';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
  const resume = useResumeStore((state) => state.resume);
  const updateResume = useResumeStore((state) => state.updateResume);
  const {
    view: awardsView,
    setView: setAwardsView,
    current: currentAward,
    setCurrent: setCurrentAward,
  } = useTabEditor<any>();

  const awards = useMemo(() => resume?.awards || [], [resume?.awards]);
  const sortedAwards = useMemo(() => sortByDateDesc(awards), [awards]);

  if (!resume) return null;

  const handleSave = () => {
    if (!currentAward?.title || !currentAward?.year || !currentAward?.issuer)
      return;

    const isEdit = !!currentAward.id;
    const newItem = isEdit
      ? currentAward
      : { ...currentAward, id: Date.now().toString() };

    const newItems = isEdit
      ? awards.map((p: any) => (p.id === currentAward.id ? newItem : p))
      : [...awards, newItem];

    updateResume({ awards: newItems });
    setAwardsView('list');
    setCurrentAward(null);
  };

  const handleMoveUp = (currentItem: any, prevItem: any) => {
    const newItems = [...awards];
    const idx1 = newItems.findIndex((i: any) => i.id === currentItem.id);
    const idx2 = newItems.findIndex((i: any) => i.id === prevItem.id);

    if (idx1 !== -1 && idx2 !== -1) {
      [newItems[idx1], newItems[idx2]] = [newItems[idx2], newItems[idx1]];
      updateResume({ awards: newItems });
    }
  };

  const handleToggleVisibility = (item: any) => {
    const newItems = awards.map((a: any) =>
      a.id === item.id ? { ...a, hidden: !a.hidden } : a,
    );
    updateResume({ awards: newItems });
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <TabHeader
        title="Awards"
        showAddButton={awardsView === 'list'}
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
      />

      {awardsView === 'list' && awards.length === 0 && (
        <EmptyState
          icon={Award}
          buttonText="Add an award you received"
          onClick={() => {
            setCurrentAward({
              title: '',
              issuer: '',
              year: currentYear.toString(),
              link: '',
              description: '',
            });
            setAwardsView('form');
          }}
        />
      )}

      {awardsView === 'list' && awards.length > 0 && (
        <div className="space-y-8">
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
                className="group flex flex-col gap-4 sm:flex-row sm:gap-12"
              >
                <div className="shrink-0 pt-0.5 text-sm text-content-muted sm:w-16">
                  {award.year}
                </div>

                <div className="flex flex-1 flex-col items-start justify-start">
                  <div className={`w-full transition-all duration-200 ${award.hidden ? 'opacity-50 blur-[1px]' : ''}`}>
                    {award.link ? (
                      <a
                        href={
                          award.link.startsWith('http')
                            ? award.link
                            : `https://${award.link}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block hover:underline"
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
                        className="prose prose-sm prose-p:my-1 prose-ul:my-1 prose-p:text-content-muted prose-ul:text-content-muted prose-li:text-content-muted prose-strong:text-content-primary mt-4 max-w-none text-sm leading-relaxed text-content-muted"
                        dangerouslySetInnerHTML={{
                          __html: award.description,
                        }}
                      />
                    )}
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
        </div>
      )}

      {awardsView === 'form' && currentAward && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">Title*</Label>
              <Input
                value={currentAward.title}
                onChange={(e) =>
                  setCurrentAward({
                    ...currentAward,
                    title: e.target.value,
                  })
                }
                placeholder="Excellence Award"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">Issuer*</Label>
              <Input
                value={currentAward.issuer || ''}
                onChange={(e) =>
                  setCurrentAward({
                    ...currentAward,
                    issuer: e.target.value,
                  })
                }
                placeholder="Google"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
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
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">
                Link to award
              </Label>
              <Input
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

          <TabFormActions
            onCancel={() => setAwardsView('list')}
            onSave={handleSave}
            isSaveDisabled={
              !currentAward?.title ||
              !currentAward?.year ||
              !currentAward?.issuer
            }
          />
        </div>
      )}
    </div>
  );
}
