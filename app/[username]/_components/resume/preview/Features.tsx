import { ResumeDataSchemaType } from '@/lib/resume';

export function Features({
  features,
}: {
  features?: ResumeDataSchemaType['features'];
}) {
  if (!features || features.length === 0) return null;

  return (
    <section className="mb-12 print:mb-8">
      <h2
        className="mb-8 text-sm font-bold text-theme-primary print:mb-4"
        id="features-section"
      >
        Features
      </h2>
      <div
        className="ml-6 flex flex-col gap-8 sm:ml-0"
        role="feed"
        aria-labelledby="features-section"
      >
        {features.map((feature) => (
          <div
            key={feature.id || feature.title}
            className="flex flex-col gap-1 sm:flex-row sm:gap-12 print:mb-6"
          >
            {/* Left column: Year */}
            <div className="shrink-0 pt-0.5 text-sm text-theme-secondary sm:w-32">
              {feature.year}
            </div>

            {/* Right column: Content */}
            <div className="flex flex-1 flex-col items-start justify-start">
              <div className="group flex items-center gap-1">
                {feature.link ? (
                  <a
                    href={
                      feature.link.startsWith('http')
                        ? feature.link
                        : `https://${feature.link}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-theme-primary hover:underline"
                  >
                    <span className="text-sm font-semibold">
                      {feature.title}
                      {feature.location ? ` on ${feature.location}` : ''}
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
                    {feature.title}
                    {feature.location ? ` on ${feature.location}` : ''}
                  </p>
                )}
              </div>

              {feature.description && feature.description !== '<p></p>' && (
                <div
                  className="prose prose-sm prose-p:my-1 prose-ul:my-1 prose-p:text-theme-secondary prose-ul:text-theme-secondary prose-li:text-theme-secondary prose-strong:text-theme-primary mt-2 max-w-none text-sm leading-relaxed text-theme-secondary"
                  dangerouslySetInnerHTML={{ __html: feature.description }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
