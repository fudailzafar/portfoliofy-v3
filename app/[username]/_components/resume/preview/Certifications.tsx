import { ResumeDataSchemaType } from "@/lib/resume";
import { PreviewSection } from "./shared/PreviewSection";
import { PreviewListItem } from "./shared/PreviewListItem";

export function Certifications({
  certifications,
}: {
  certifications?: ResumeDataSchemaType["certifications"];
}) {
  const validItems = certifications?.filter((item) => !item.hidden) || [];

  if (validItems.length === 0) {
    return null;
  }

  return (
    <PreviewSection id="certifications-section" title="Certifications">
      {validItems.map((item, idx) => (
        <PreviewListItem
          key={item.id || idx}
          leftContent={item.year}
          title={item.title}
          subtitle={item.issuer ? `from ${item.issuer}` : undefined}
          link={item.link}
          location={undefined}
          description={item.description}
          attachments={item.attachments}
        />
      ))}
    </PreviewSection>
  );
}
