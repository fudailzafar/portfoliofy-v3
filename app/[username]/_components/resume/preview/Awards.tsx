import { ResumeDataSchemaType } from '@/lib/resume';
import { AttachmentsPreview } from './AttachmentsPreview';
import { ArrowUpRight } from 'lucide-react';

export function Awards({
  awards,
}: {
  awards?: ResumeDataSchemaType['awards'];
}) {
  const visibleAwards = awards?.filter((award) => !award.hidden);
  if (!visibleAwards || visibleAwards.length === 0) return null;

  return (
    <section className="mb-12 print:mb-8">
      <h2
        className="mb-8 text-sm font-bold text-theme-primary print:mb-4"
        id="awards-section"
      >
        Awards
      </h2>
      <div
        className="ml-6 flex flex-col gap-8 sm:ml-0"
        role="feed"
        aria-labelledby="awards-section"
      >
        {visibleAwards.map((award) => (
          <div
            key={award.id || award.title}
            className="flex flex-col gap-1 sm:flex-row sm:gap-12 print:mb-6"
          >
            {/* Left column: Year */}
            <div className="shrink-0 pt-0.5 text-sm text-theme-secondary sm:w-32">
              {award.year}
            </div>

            {/* Right column: Content */}
            <div className="flex flex-1 flex-col items-start justify-start">
              <div className="group flex items-center gap-1">
                {award.link ? (
                  <a
                    href={
                      award.link.startsWith('http')
                        ? award.link
                        : `https://${award.link}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-theme-primary hover:underline hover:underline-offset-4"
                  >
                    <span className="text-sm font-semibold">
                      {award.title} from {award.issuer}
                      <ArrowUpRight className="relative -top-0.5 ml-1 inline-block h-4 w-4" />
                    </span>
                  </a>
                ) : (
                  <p className="text-sm font-semibold text-theme-primary">
                    {award.title} from {award.issuer}
                  </p>
                )}
              </div>

              {award.description && award.description !== '<p></p>' && (
                <div
                  className="prose prose-sm prose-p:my-1 prose-ul:my-1 prose-p:text-theme-secondary prose-ul:text-theme-secondary prose-li:text-theme-secondary prose-strong:text-theme-primary max-w-none text-sm text-theme-secondary"
                  dangerouslySetInnerHTML={{ __html: award.description }}
                />
              )}
              <AttachmentsPreview attachments={award.attachments} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
