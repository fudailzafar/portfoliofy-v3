import { ResumeDataSchemaType } from "@/lib/resume";
import { PreviewSection } from "./shared/PreviewSection";
import { PreviewListItem } from "./shared/PreviewListItem";

export function WorkExperience({
  work,
}: {
  work?: ResumeDataSchemaType["workExperience"];
}) {
  const validItems = work?.filter((item) => item.company && item.title && item.start && !item.hidden) || [];

  if (validItems.length === 0) {
    return null;
  }

  return (
    <PreviewSection id="work-experience" title="Work Experience">
      {validItems.map((item, idx) => (
        <PreviewListItem
          key={item.id || idx}
          leftContent={`\${item.start} — \${item.end || "Now"}`}
          title={item.title}
          subtitle={`at \${item.company}`}
          link={item.link}
          location={item.location}
          description={item.description}
          attachments={item.attachments}
        />
      ))}
    </PreviewSection>
  );
}
