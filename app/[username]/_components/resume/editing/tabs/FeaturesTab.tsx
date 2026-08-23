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
import { FolderCode } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { sortByDateDesc, getListAdjacency } from '@/lib/resume';

const isFeatureValid = (item: any) => !!item?.title && !!item?.year;

export function FeaturesTab({
  years,
  setProjectToDelete,
}: {
  years: number[];
  setProjectToDelete: (id: string) => void;
}) {
  const {
    items: features,
    handleSave: saveFeature,
    handleMoveUp,
    handleMoveDown,
    handleToggleVisibility,
  } = useResumeList<any>('features');

  const {
    view: featuresView,
    setView: setFeaturesView,
    current: currentFeature,
    setCurrent: setCurrentFeature,
    commit: commitFeature,
  } = useTabEditor<any>({ isValid: isFeatureValid, onCommit: saveFeature });

  const sortedFeatures = useMemo(() => sortByDateDesc(features), [features]);

  const currentYear = new Date().getFullYear();

  return (
    <ListTabLayout
      title="Features"
      view={featuresView}
      itemsLength={features.length}
      onAdd={() => {
        setCurrentFeature({
          title: '',
          year: currentYear.toString(),
          link: '',
          location: '',
          description: '',
        });
        setFeaturesView('form');
      }}
      addButtonText="Add feature"
      emptyState={{
        icon: FolderCode,
        buttonText: 'Add a feature',
      }}
      onBack={() => {
        commitFeature();
        setFeaturesView('list');
      }}
      renderList={() => (
        <>
          {sortedFeatures.map(
            (feature: any, index: number, sortedArray: any[]) => {
              const { prevItem, nextItem, canMoveUp, canMoveDown } =
                getListAdjacency(sortedArray, index);
              return (
                <EditorListItem
                  key={feature.id}
                  leftContent={feature.year}
                  title={feature.title}
                  subtitle={
                    feature.location ? ` on ${feature.location}` : undefined
                  }
                  link={feature.link}
                  description={feature.description}
                  attachments={feature.attachments}
                  collaborators={feature.collaborators}
                  isHidden={feature.hidden}
                  canMoveUp={canMoveUp}
                  canMoveDown={canMoveDown}
                  onMoveUp={() => handleMoveUp(feature, prevItem)}
                  onMoveDown={() => handleMoveDown(feature, nextItem)}
                  onToggleVisibility={() => handleToggleVisibility(feature)}
                  onEdit={() => {
                    setCurrentFeature(feature);
                    setFeaturesView('form');
                  }}
                  onDelete={() => setProjectToDelete(feature.id)}
                />
              );
            },
          )}
        </>
      )}
      renderForm={() =>
        currentFeature ? (
          <>
            <div className="grid grid-cols-2 gap-6">
              <FormInput
                id="title"
                label="Thing done*"
                value={currentFeature.title}
                onChange={(e) =>
                  setCurrentFeature({
                    ...currentFeature,
                    title: e.target.value,
                  })
                }
                placeholder="My great feature"
              />
              <div className="space-y-2">
                <Label className="text-xs text-content-secondary">Year*</Label>
                <Select
                  value={currentFeature.year}
                  onValueChange={(val) =>
                    setCurrentFeature({
                      ...currentFeature,
                      year: val,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Ongoing', ...years].map((y) => (
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
                id="location"
                label="Where"
                value={currentFeature.location || ''}
                onChange={(e) =>
                  setCurrentFeature({
                    ...currentFeature,
                    location: e.target.value,
                  })
                }
                placeholder="The Verge"
              />
              <FormInput
                id="link"
                label="Link to feature"
                value={currentFeature.link || ''}
                onChange={(e) =>
                  setCurrentFeature({
                    ...currentFeature,
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
                content={currentFeature.description || ''}
                onChange={(val) =>
                  setCurrentFeature({
                    ...currentFeature,
                    description: val,
                  })
                }
              />
            </div>
            <CollaboratorsField
              label="Collaborators"
              value={currentFeature.collaborators || []}
              onChange={(val) =>
                setCurrentFeature({
                  ...currentFeature,
                  collaborators: val,
                })
              }
            />
            <SectionAttachments
              attachments={currentFeature.attachments || []}
              onChange={(val) =>
                setCurrentFeature({
                  ...currentFeature,
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
