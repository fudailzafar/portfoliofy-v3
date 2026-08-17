import { ResumeDataSchemaType } from '@/lib/resume';
import { PreviewSection } from './shared/PreviewSection';
import { PreviewListItem } from './shared/PreviewListItem';

export function SideProjects({
  sideProjects,
}: {
  sideProjects?: ResumeDataSchemaType['sideProjects'];
}) {
  const validItems = sideProjects?.filter((item) => !item.hidden) || [];

  if (validItems.length === 0) {
    return null;
  }

  return (
    <PreviewSection id="side-projects-section" title="Side Projects">
      {validItems.map((item, idx) => (
        <PreviewListItem
          key={item.id || idx}
          leftContent={item.year}
          title={item.title}
          subtitle={item.company ? `at ${item.company}` : undefined}
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
