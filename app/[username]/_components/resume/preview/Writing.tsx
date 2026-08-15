import { ResumeDataSchemaType } from '@/lib/resume';
import { PreviewSection } from './shared/PreviewSection';
import { PreviewListItem } from './shared/PreviewListItem';

export function Writing({
  writing,
}: {
  writing?: ResumeDataSchemaType['writing'];
}) {
  const validItems = writing?.filter((item) => !item.hidden) || [];

  if (validItems.length === 0) {
    return null;
  }

  return (
    <PreviewSection id="writing-section" title="Writing">
      {validItems.map((item, idx) => (
        <PreviewListItem
          key={item.id || idx}
          leftContent={item.year}
          title={item.title}
          subtitle={item.publication ? `in ${item.publication}` : undefined}
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
