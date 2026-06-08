import { ResumeDataSchemaType } from '@/lib/resume';
import { ArrowUpRight } from 'lucide-react';

export function Speaking({
  speaking,
}: {
  speaking?: ResumeDataSchemaType['speaking'];
}) {
  if (!speaking || speaking.length === 0) return null;

  return (
    <section className="mb-12 print:mb-8">
      <h2
        className="mb-8 text-sm font-bold text-theme-primary print:mb-4"
        id="speaking-section"
      >
        Speaking
      </h2>
      <div
        className="ml-6 flex flex-col gap-8 sm:ml-0"
        role="feed"
        aria-labelledby="speaking-section"
      >
        {speaking.map((engagement) => (
          <div
            key={engagement.id || engagement.title}
            className="flex flex-col gap-1 sm:flex-row sm:gap-12 print:mb-6"
          >
            {/* Left column: Year */}
            <div className="shrink-0 pt-0.5 text-sm text-theme-secondary sm:w-32">
              {engagement.year}
            </div>

            {/* Right column: Content */}
            <div className="flex flex-1 flex-col items-start justify-start">
              <div className="group flex items-center gap-1">
                {engagement.link ? (
                  <a
                    href={
                      engagement.link.startsWith('http')
                        ? engagement.link
                        : `https://${engagement.link}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-theme-primary hover:underline"
                  >
                    <span className="text-sm font-semibold">
                      {engagement.title}
                      <ArrowUpRight className="relative -top-0.5 ml-1 inline-block h-4 w-4" />
                    </span>
                  </a>
                ) : (
                  <p className="text-sm font-semibold text-theme-primary">
                    {engagement.title}
                  </p>
                )}
              </div>

              {engagement.location && (
                <div className="mt-2 text-sm text-theme-secondary">
                  {engagement.location}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
