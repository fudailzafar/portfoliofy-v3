import { ResumeDataSchemaType } from "@/lib/resume";
import { PreviewSection } from "./shared/PreviewSection";
import { PreviewListItem } from "./shared/PreviewListItem";

export function Awards({
  awards,
}: {
  awards?: ResumeDataSchemaType["awards"];
}) {
  const validItems = awards?.filter((item) => !item.hidden) || [];

  if (validItems.length === 0) {
    return null;
  }

  return (
    <PreviewSection id="awards-section" title="Awards">
      {validItems.map((item, idx) => (
        <PreviewListItem
          key={item.id || idx}
          leftContent={item.year}
          title={item.title}
          subtitle={item.issuer ? `by ${item.issuer}` : undefined}
          link={item.link}
          location={undefined}
          description={item.description}
          attachments={item.attachments}
        />
      ))}
    </PreviewSection>
  );
}
