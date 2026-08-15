import { ResumeDataSchemaType } from '@/lib/resume';
import { PreviewSection } from './shared/PreviewSection';
import { PreviewListItem } from './shared/PreviewListItem';

export function Education({
  educations,
}: {
  educations?: ResumeDataSchemaType['education'];
}) {
  const validItems =
    educations?.filter(
      (item) => item.school && item.degree && item.end && !item.hidden,
    ) || [];

  if (validItems.length === 0) {
    return null;
  }

  return (
    <PreviewSection id="education-section" title="Education">
      {validItems.map((item, idx) => (
        <PreviewListItem
          key={item.id || idx}
          leftContent={item.start ? `${item.start} — ${item.end}` : item.end}
          title={item.degree}
          subtitle={`at ${item.school}`}
          link={item.link}
          location={undefined}
          description={item.description}
          attachments={item.attachments}
          collaborators={item.collaborators}
        />
      ))}
    </PreviewSection>
  );
}
