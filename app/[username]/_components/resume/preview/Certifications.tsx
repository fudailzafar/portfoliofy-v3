import { ResumeDataSchemaType } from '@/lib/resume';
import { AttachmentsPreview } from './AttachmentsPreview';
import { ArrowUpRight } from 'lucide-react';

export function Certifications({
  certifications,
}: {
  certifications?: ResumeDataSchemaType['certifications'];
}) {
  const visibleCertifications = certifications?.filter(
    (certification) => !certification.hidden,
  );
  if (!visibleCertifications || visibleCertifications.length === 0) return null;

  return (
    <section className="mb-12 print:mb-8">
      <h2
        className="mb-8 text-sm font-bold text-theme-primary print:mb-4"
        id="certifications-section"
      >
        Certifications
      </h2>
      <div
        className="ml-6 flex flex-col gap-8 sm:ml-0"
        role="feed"
        aria-labelledby="certifications-section"
      >
        {visibleCertifications.map((certification) => (
          <div
            key={certification.id || certification.title}
            className="flex flex-col gap-1 sm:flex-row sm:gap-12 print:mb-6"
          >
            {/* Left column: Year */}
            <div className="shrink-0 pt-0.5 text-sm text-theme-secondary sm:w-32">
              {certification.year}
            </div>

            {/* Right column: Content */}
            <div className="flex flex-1 flex-col items-start justify-start">
              <div className="group flex items-center gap-1">
                {certification.link ? (
                  <a
                    href={
                      certification.link.startsWith('http')
                        ? certification.link
                        : `https://${certification.link}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-theme-primary hover:underline hover:underline-offset-4"
                  >
                    <span className="text-sm font-semibold">
                      {certification.title} from {certification.issuer}
                      <ArrowUpRight className="relative -top-0.5 ml-1 inline-block h-4 w-4" />
                    </span>
                  </a>
                ) : (
                  <p className="text-sm font-semibold text-theme-primary">
                    {certification.title} from {certification.issuer}
                  </p>
                )}
              </div>

              {certification.description &&
                certification.description !== '<p></p>' && (
                  <div
                    className="prose prose-sm prose-ul:pl-0 prose-ol:pl-0 prose-li:pl-0 max-w-none text-sm text-theme-secondary prose-p:my-1 prose-p:text-theme-secondary prose-strong:text-theme-primary prose-ul:my-1 prose-ul:text-theme-secondary prose-li:text-theme-secondary"
                    dangerouslySetInnerHTML={{
                      __html: certification.description,
                    }}
                  />
                )}
              <AttachmentsPreview attachments={certification.attachments} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
