import { ResumeDataSchemaType } from '@/lib/resume';
import { PreviewSection } from './shared/PreviewSection';
import { PreviewListItem } from './shared/PreviewListItem';

export function Volunteering({
  volunteering,
}: {
  volunteering?: ResumeDataSchemaType['volunteering'];
}) {
  const validItems = volunteering?.filter((item) => !item.hidden) || [];

  if (validItems.length === 0) {
    return null;
  }

  return (
    <PreviewSection id="volunteering-section" title="Volunteering">
      {validItems.map((item, idx) => (
        <PreviewListItem
          key={item.id || idx}
          leftContent={
            item.startYear
              ? `${item.startYear} — ${item.endYear || 'Now'}`
              : item.endYear
          }
          title={item.role}
          subtitle={item.organization ? `at ${item.organization}` : undefined}
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
