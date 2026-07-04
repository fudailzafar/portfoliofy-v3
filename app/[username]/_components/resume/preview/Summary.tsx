import { ResumeDataSchemaType } from '@/lib/resume';

interface AboutProps {
  summary: ResumeDataSchemaType['summary'];
}

/**
 * Summary section component
 * Displays a summary of professional experience and goals
 */
export function Summary({ summary }: AboutProps) {
  if (!summary || summary === '' || summary === '<p></p>') {
    return null;
  }

  return (
    <>
      <h2 className="text-sm font-bold text-theme-primary" id="about-section">
        About
      </h2>
      <div
        className="prose prose-sm prose-ul:pl-0 prose-ol:pl-0 prose-li:pl-0 ml-6 max-w-none text-pretty text-sm text-theme-secondary prose-p:my-1 prose-p:text-theme-secondary prose-strong:text-theme-primary prose-ul:my-1 prose-ul:text-theme-secondary prose-li:text-theme-secondary sm:ml-0 print:text-[12px]"
        aria-labelledby="about-section"
        dangerouslySetInnerHTML={{ __html: summary }}
      />
    </>
  );
}
