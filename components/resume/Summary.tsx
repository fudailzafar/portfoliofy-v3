import { ResumeDataSchemaType } from '@/lib/resume';
import { Section } from '../ui/section';

interface AboutProps {
  summary: ResumeDataSchemaType['summary'];
  className?: string;
}

/**
 * Summary section component
 * Displays a summary of professional experience and goals
 */
export function Summary({ summary, className }: AboutProps) {
  if (!summary || summary === '' || summary === '<p></p>') {
    return null;
  }

  return (
    <Section className={className}>
      <h2 className="text-xl font-bold" id="about-section">
        About
      </h2>
      <div
        className="text-pretty  text-md text-gray-700 print:text-[12px] prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1"
        aria-labelledby="about-section"
        dangerouslySetInnerHTML={{ __html: summary }}
      />
    </Section>
  );
}
