import { ResumeDataSchemaType } from '@/lib/resume';

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
        className="flex flex-col gap-8 ml-6 sm:ml-0"
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="relative -top-0.5 ml-1 inline-block h-4 w-4"
                      >
                        <path d="M7 17L17 7M7 7h10v10" />
                      </svg>
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
