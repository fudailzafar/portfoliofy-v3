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
    <section className="mb-9 print:mb-8">
      <div
        className="prose prose-sm ml-4 max-w-none text-pretty text-theme-secondary [--tw-prose-bullets:var(--theme-secondary)] [--tw-prose-counters:var(--theme-secondary)] prose-p:my-1 prose-p:text-theme-secondary prose-strong:text-theme-primary prose-ol:pl-0 prose-ul:my-1 prose-ul:pl-0 prose-ul:text-theme-secondary prose-li:pl-0 prose-li:text-theme-secondary min-[481px]:ml-0 print:!text-[12px]"
        style={{
          fontSize: 'var(--type-size)',
          lineHeight: 'var(--line-height)',
        }}
        aria-labelledby="about-section"
        dangerouslySetInnerHTML={{ __html: summary }}
      />
    </section>
  );
}
