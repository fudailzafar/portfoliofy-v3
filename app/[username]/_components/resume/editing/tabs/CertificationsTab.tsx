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
import { FileBadge } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sortByDateDesc, getListAdjacency } from '@/lib/resume';

const isCertificationValid = (item: any) =>
  !!item?.title && !!item?.year && !!item?.issuer;

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
    handleMoveDown,
    handleToggleVisibility,
  } = useResumeList<any>('certifications');

  const {
    view: certificationsView,
    setView: setCertificationsView,
    current: currentCertification,
    setCurrent: setCurrentCertification,
  } = useTabEditor<any>({
    isValid: isCertificationValid,
    onCommit: saveCertification,
  });

  const sortedCertifications = useMemo(
    () => sortByDateDesc(certifications),
    [certifications],
  );

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
        buttonText: 'Add a certification you received',
      }}
      renderList={() => (
        <>
          {sortedCertifications.map(
            (certification: any, index: number, sortedArray: any[]) => {
              const { prevItem, nextItem, canMoveUp, canMoveDown } =
                getListAdjacency(sortedArray, index);
              return (
                <EditorListItem
                  key={certification.id}
                  leftContent={certification.year}
                  title={certification.title}
                  subtitle={` from ${certification.issuer}`}
                  link={certification.link}
                  description={certification.description}
                  attachments={certification.attachments}
                  collaborators={certification.collaborators}
                  isHidden={certification.hidden}
                  canMoveUp={canMoveUp}
                  canMoveDown={canMoveDown}
                  onMoveUp={() => handleMoveUp(certification, prevItem)}
                  onMoveDown={() => handleMoveDown(certification, nextItem)}
                  onToggleVisibility={() =>
                    handleToggleVisibility(certification)
                  }
                  onEdit={() => {
                    setCurrentCertification(certification);
                    setCertificationsView('form');
                  }}
                  onDelete={() => setProjectToDelete(certification.id)}
                />
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
            <CollaboratorsField
              label="Collaborators"
              value={currentCertification.collaborators || []}
              onChange={(val) =>
                setCurrentCertification({
                  ...currentCertification,
                  collaborators: val,
                })
              }
            />
            <SectionAttachments
              attachments={currentCertification.attachments || []}
              onChange={(val) =>
                setCurrentCertification({
                  ...currentCertification,
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
