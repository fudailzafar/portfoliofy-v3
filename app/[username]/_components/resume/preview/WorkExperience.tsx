import { ResumeDataSchemaType } from '@/lib/resume';
import { AttachmentsPreview } from './AttachmentsPreview';
import { useMemo } from 'react';
import { ArrowUpRight } from 'lucide-react';

export function WorkExperience({
  work,
}: {
  work: ResumeDataSchemaType['workExperience'];
}) {
  // Filter out invalid work experiences
  const validWork = useMemo(() => {
    return (
      work?.filter(
        (item) => item.company && item.title && item.start && !item.hidden,
      ) || []
    );
  }, [work]);

  if (validWork.length === 0) {
    return null;
  }

  return (
    <section className="mb-12 print:mb-8">
      <h2
        className="mb-8 text-sm font-bold text-theme-primary print:mb-4"
        id="work-experience"
      >
        Work Experience
      </h2>
      <div
        className="ml-6 flex flex-col gap-8 sm:ml-0"
        role="feed"
        aria-labelledby="work-experience"
      >
        {validWork.map((item, idx) => (
          <div
            key={item.id || idx}
            className="flex flex-col gap-1 sm:flex-row sm:gap-12 print:mb-6"
          >
            {/* Left column: Years */}
            <div className="shrink-0 pt-0.5 text-sm text-theme-secondary sm:w-32">
              {item.start} — {item.end || 'Now'}
            </div>

            {/* Right column: Content */}
            <div className="flex flex-1 flex-col items-start justify-start">
              <div className="group flex items-center gap-1">
                {item.link ? (
                  <a
                    href={
                      item.link.startsWith('http')
                        ? item.link
                        : `https://${item.link}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-theme-primary hover:underline hover:underline-offset-4"
                  >
                    <span className="text-sm font-semibold">
                      {item.title} at {item.company}
                      <ArrowUpRight className="relative -top-0.5 ml-1 inline-block h-4 w-4" />
                    </span>
                  </a>
                ) : (
                  <p className="text-sm font-semibold text-theme-primary">
                    {item.title} at {item.company}
                  </p>
                )}
              </div>

              {item.location && (
                <p className="text-sm text-theme-secondary">{item.location}</p>
              )}

              {item.description && item.description !== '<p></p>' && (
                <div
                  className="prose prose-sm mt-4 max-w-none text-sm leading-relaxed text-theme-secondary prose-p:my-1 prose-p:text-theme-secondary prose-strong:text-theme-primary prose-ul:my-1 prose-ul:text-theme-secondary prose-li:text-theme-secondary"
                  dangerouslySetInnerHTML={{ __html: item.description }}
                />
              )}
              <AttachmentsPreview attachments={item.attachments} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
