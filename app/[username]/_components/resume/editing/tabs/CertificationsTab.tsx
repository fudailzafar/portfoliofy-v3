import { useMemo } from 'react';
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
  const {
    items: certifications,
    handleSave: saveCertification,
    handleMoveUp,
    handleToggleVisibility,
  } = useResumeList<any>('certifications');

  const {
    view: certificationsView,
    setView: setCertificationsView,
    current: currentCertification,
    setCurrent: setCurrentCertification,
  } = useTabEditor<any>();

  const sortedCertifications = useMemo(
    () => sortByDateDesc(certifications),
    [certifications],
  );

  const handleSave = () => {
    if (
      !currentCertification?.title ||
      !currentCertification?.year ||
      !currentCertification?.issuer
    )
      return;
    saveCertification(currentCertification);
    setCertificationsView('list');
    setCurrentCertification(null);
  };

  const currentYear = new Date().getFullYear();

  return (
    <ListTabLayout
      title="Certifications"
      view={certificationsView}
      itemsLength={certifications.length}
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
      emptyState={{
        icon: FileBadge,
        buttonText: "Add an certification you received",
      }}
      renderList={() => (
        <>
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
                  className="group flex flex-col gap-4 sm:flex-row sm:gap-12"
                >
                  <div className="shrink-0 pt-0.5 text-sm text-content-muted sm:w-16">
                    {certification.year}
                  </div>

                  <div className="flex flex-1 flex-col items-start justify-start">
                    <div
                      className={`w-full transition-all duration-200 ${certification.hidden ? 'opacity-50 blur-[1px]' : ''}`}
                    >
                      {certification.link ? (
                        <a
                          href={
                            certification.link.startsWith('http')
                              ? certification.link
                              : `https://${certification.link}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block hover:underline hover:underline-offset-4"
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
                            className="prose prose-sm mt-4 max-w-none text-sm leading-relaxed text-content-muted prose-p:my-1 prose-p:text-content-muted prose-strong:text-content-primary prose-ul:my-1 prose-ul:text-content-muted prose-li:text-content-muted"
                            dangerouslySetInnerHTML={{
                              __html: certification.description,
                            }}
                          />
                        )}
                      <div className="mt-4">
                        <AttachmentsPreview
                          attachments={certification.attachments}
                        />
                      </div>
                    </div>

                    <EditDeleteButtons
                      isHidden={certification.hidden}
                      onToggleVisibility={() =>
                        handleToggleVisibility(certification)
                      }
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
        </>
      )}
      renderForm={() =>
        currentCertification ? (
          <>
            <div className="grid grid-cols-2 gap-6">
              <FormInput
                id="title"
                label="Title*"
                value={currentCertification.title}
                onChange={(e) =>
                  setCurrentCertification({
                    ...currentCertification,
                    title: e.target.value,
                  })
                }
                placeholder="My certification"
              />
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
            </div>
            <div className="grid grid-cols-2 gap-6">
              <FormInput
                id="issuer"
                label="Issuer*"
                value={currentCertification.issuer || ''}
                onChange={(e) =>
                  setCurrentCertification({
                    ...currentCertification,
                    issuer: e.target.value,
                  })
                }
                placeholder="Issuing organization"
              />
              <FormInput
                id="link"
                label="Link to certification"
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
            <SectionAttachments
              attachments={currentCertification.attachments || []}
              onChange={(val) =>
                setCurrentCertification({
                  ...currentCertification,
                  attachments: val,
                })
              }
            />

            <TabFormActions
              onCancel={() => setCertificationsView('list')}
              onSave={handleSave}
              isSaveDisabled={
                !currentCertification?.title ||
                !currentCertification?.year ||
                !currentCertification?.issuer
              }
            />
          </>
        ) : null
      }
    />
  );
}
