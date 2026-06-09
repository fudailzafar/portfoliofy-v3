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
import { FileBadge, ArrowUpRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sortByDateDesc } from '@/lib/resume';

export function CertificationsTab({
  years,
  setProjectToDelete,
}: {
  years: number[];
  setProjectToDelete: (id: string) => void;
}) {
  const resume = useResumeStore((state) => state.resume);
  const updateResume = useResumeStore((state) => state.updateResume);
  const {
    view: certificationsView,
    setView: setCertificationsView,
    current: currentCertification,
    setCurrent: setCurrentCertification,
  } = useTabEditor<any>();

  const certifications = useMemo(
    () => resume?.certifications || [],
    [resume?.certifications],
  );
  const sortedCertifications = useMemo(
    () => sortByDateDesc(certifications),
    [certifications],
  );

  if (!resume) return null;

  const handleSave = () => {
    if (
      !currentCertification?.title ||
      !currentCertification?.year ||
      !currentCertification?.issuer
    )
      return;

    const isEdit = !!currentCertification.id;
    const newItem = isEdit
      ? currentCertification
      : { ...currentCertification, id: Date.now().toString() };

    const newItems = isEdit
      ? certifications.map((p: any) =>
          p.id === currentCertification.id ? newItem : p,
        )
      : [...certifications, newItem];

    updateResume({ certifications: newItems });
    setCertificationsView('list');
    setCurrentCertification(null);
  };

  const handleMoveUp = (currentItem: any, prevItem: any) => {
    const newItems = [...certifications];
    const idx1 = newItems.findIndex((i: any) => i.id === currentItem.id);
    const idx2 = newItems.findIndex((i: any) => i.id === prevItem.id);

    if (idx1 !== -1 && idx2 !== -1) {
      [newItems[idx1], newItems[idx2]] = [newItems[idx2], newItems[idx1]];
      updateResume({ certifications: newItems });
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col">
      <TabHeader
        title="Certifications"
        showAddButton={certificationsView === 'list'}
        onAdd={() => {
          setCurrentCertification({
            title: '',
            issuer: '',
            year: currentYear.toString(),
            link: '',
            description: '',
          });
          setCertificationsView('form');
        }}
        addButtonText="Add certification"
      />

      {certificationsView === 'list' && certifications.length === 0 && (
        <EmptyState
          icon={FileBadge}
          buttonText="Add an certification you received"
          onClick={() => {
            setCurrentCertification({
              title: '',
              issuer: '',
              year: currentYear.toString(),
              link: '',
              description: '',
            });
            setCertificationsView('form');
          }}
        />
      )}

      {certificationsView === 'list' && certifications.length > 0 && (
        <div className="space-y-8">
          {sortedCertifications.map(
            (certification: any, index: number, sortedArray: any[]) => {
              const prevItem = index > 0 ? sortedArray[index - 1] : null;
              const canMoveUp =
                prevItem &&
                parseInt(certification.year || '0') ===
                  parseInt(prevItem.year || '0');
              const nextItem =
                index < sortedArray.length - 1 ? sortedArray[index + 1] : null;
              const canMoveDown =
                nextItem &&
                parseInt(certification.year || '0') ===
                  parseInt(nextItem.year || '0');
              return (
                <div
                  key={certification.id}
                  className="flex flex-col gap-4 sm:flex-row sm:gap-12"
                >
                  <div className="shrink-0 pt-0.5 text-sm text-content-muted sm:w-16">
                    {certification.year}
                  </div>

                  <div className="flex flex-1 flex-col items-start justify-start">
                    {certification.link ? (
                      <a
                        href={
                          certification.link.startsWith('http')
                            ? certification.link
                            : `https://${certification.link}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block hover:underline"
                      >
                        <span className="text-sm font-semibold text-content-primary">
                          {certification.title} from {certification.issuer}
                          <ArrowUpRight className="relative -top-0.5 ml-1 inline-block h-4 w-4 text-content-primary" />
                        </span>
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-content-primary">
                        {certification.title} from {certification.issuer}
                      </p>
                    )}

                    {certification.description &&
                      certification.description !== '<p></p>' && (
                        <div
                          className="prose prose-sm prose-p:my-1 prose-ul:my-1 prose-p:text-content-muted prose-ul:text-content-muted prose-li:text-content-muted prose-strong:text-content-primary mt-4 max-w-none text-sm leading-relaxed text-content-muted"
                          dangerouslySetInnerHTML={{
                            __html: certification.description,
                          }}
                        />
                      )}

                    <EditDeleteButtons
                      onEdit={() => {
                        setCurrentCertification(certification);
                        setCertificationsView('form');
                      }}
                      onDelete={() => setProjectToDelete(certification.id)}
                    >
                      <SortButtons
                        canMoveUp={canMoveUp}
                        canMoveDown={canMoveDown}
                        onMoveUp={() => handleMoveUp(certification, prevItem)}
                        onMoveDown={() => handleMoveUp(certification, nextItem)}
                      />
                    </EditDeleteButtons>
                  </div>
                </div>
              );
            },
          )}
        </div>
      )}

      {certificationsView === 'form' && currentCertification && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">Title*</Label>
              <Input
                value={currentCertification.title}
                onChange={(e) =>
                  setCurrentCertification({
                    ...currentCertification,
                    title: e.target.value,
                  })
                }
                placeholder="Excellence Certification"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-content-secondary">Issuer*</Label>
              <Input
                value={currentCertification.issuer || ''}
                onChange={(e) =>
                  setCurrentCertification({
                    ...currentCertification,
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
                value={currentCertification.year}
                onValueChange={(val) =>
                  setCurrentCertification({
                    ...currentCertification,
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
                Link to certification
              </Label>
              <Input
                value={currentCertification.link || ''}
                onChange={(e) =>
                  setCurrentCertification({
                    ...currentCertification,
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
              content={currentCertification.description || ''}
              onChange={(val) =>
                setCurrentCertification({
                  ...currentCertification,
                  description: val,
                })
              }
            />
          </div>

          <TabFormActions
            onCancel={() => setCertificationsView('list')}
            onSave={handleSave}
            isSaveDisabled={
              !currentCertification?.title ||
              !currentCertification?.year ||
              !currentCertification?.issuer
            }
          />
        </div>
      )}
    </div>
  );
}
