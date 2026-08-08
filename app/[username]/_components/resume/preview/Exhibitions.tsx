import { ResumeDataSchemaType } from '@/lib/resume';
import { AttachmentsPreview } from './AttachmentsPreview';
import { ArrowUpRight } from 'lucide-react';

export function Exhibitions({
  exhibitions,
}: {
  exhibitions?: ResumeDataSchemaType['exhibitions'];
}) {
  const visibleExhibitions = exhibitions?.filter(
    (exhibition) => !exhibition.hidden,
  );
  if (!visibleExhibitions || visibleExhibitions.length === 0) return null;

  return (
    <section className="mb-9 print:mb-8">
      <h2
        className="mb-6 text-sm font-bold text-theme-primary print:mb-4"
        id="exhibitions-section"
      >
        Exhibitions
      </h2>
      <div
        className="ml-6 flex flex-col gap-8 sm:ml-0"
        role="feed"
        aria-labelledby="exhibitions-section"
      >
        {visibleExhibitions.map((exhibition) => (
          <div
            key={exhibition.id || exhibition.title}
            className="flex flex-col gap-1 sm:flex-row sm:gap-[36px] print:mb-6"
          >
            {/* Left column: Year */}
            <div className="shrink-0 pt-0.5 text-sm text-theme-secondary sm:w-[94px]">
              {exhibition.year}
            </div>

            {/* Right column: Content */}
            <div className="flex flex-1 flex-col items-start justify-start">
              <div className="group flex items-center gap-1">
                {exhibition.link ? (
                  <a
                    href={
                      exhibition.link.startsWith('http')
                        ? exhibition.link
                        : `https://${exhibition.link}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-theme-primary hover:underline hover:underline-offset-4"
                  >
                    <span className="text-sm font-semibold">
                      {exhibition.title}
                      {exhibition.organization
                        ? ` at ${exhibition.organization}`
                        : ''}
                      <ArrowUpRight className="relative -top-0.5 ml-1 inline-block h-4 w-4" />
                    </span>
                  </a>
                ) : (
                  <p className="text-sm font-semibold text-theme-primary">
                    {exhibition.title}
                    {exhibition.organization
                      ? ` at ${exhibition.organization}`
                      : ''}
                  </p>
                )}
              </div>

              {exhibition.location && (
                <div className="text-sm text-theme-secondary">
                  {exhibition.location}
                </div>
              )}

              {exhibition.description &&
                exhibition.description !== '<p></p>' && (
                  <div
                    className="prose prose-sm prose-ul:pl-0 prose-ol:pl-0 prose-li:pl-0 mt-2 max-w-none text-sm text-theme-secondary prose-p:my-1 prose-p:text-theme-secondary prose-strong:text-theme-primary prose-ul:my-1 prose-ul:text-theme-secondary prose-li:text-theme-secondary"
                    dangerouslySetInnerHTML={{ __html: exhibition.description }}
                  />
                )}
              <AttachmentsPreview attachments={exhibition.attachments} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
