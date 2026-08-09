import { ResumeDataSchemaType } from "@/lib/resume";
import { PreviewSection } from "./shared/PreviewSection";
import { PreviewListItem } from "./shared/PreviewListItem";

export function Projects({
  projects,
}: {
  projects?: ResumeDataSchemaType["projects"];
}) {
  const validItems = projects?.filter((item) => !item.hidden) || [];

  if (validItems.length === 0) {
    return null;
  }

  return (
    <PreviewSection id="projects-section" title="Projects">
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
        />
      ))}
    </PreviewSection>
  );
}
