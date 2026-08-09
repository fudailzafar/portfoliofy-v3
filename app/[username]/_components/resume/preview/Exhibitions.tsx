import { ResumeDataSchemaType } from "@/lib/resume";
import { PreviewSection } from "./shared/PreviewSection";
import { PreviewListItem } from "./shared/PreviewListItem";

export function Exhibitions({
  exhibitions,
}: {
  exhibitions?: ResumeDataSchemaType["exhibitions"];
}) {
  const validItems = exhibitions?.filter((item) => !item.hidden) || [];

  if (validItems.length === 0) {
    return null;
  }

  return (
    <PreviewSection id="exhibitions-section" title="Exhibitions">
      {validItems.map((item, idx) => (
        <PreviewListItem
          key={item.id || idx}
          leftContent={item.year}
          title={item.title}
          subtitle={item.organization ? `at \${item.organization}` : undefined}
          link={item.link}
          location={undefined}
          description={item.description}
          attachments={item.attachments}
        />
      ))}
    </PreviewSection>
  );
}
