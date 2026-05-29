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
        className="text-lg font-bold mb-8 print:mb-4 text-theme-primary" 
        id="features-section"
      >
        Features
      </h2>
      <div
        className="flex flex-col gap-8"
        role="feed"
        aria-labelledby="features-section"
      >
        {features.map((feature) => (
          <div
            key={feature.id || feature.title}
            className="flex flex-col sm:flex-row gap-4 sm:gap-12 print:mb-6"
          >
            {/* Left column: Year */}
            <div className="sm:w-32 shrink-0 text-theme-secondary text-sm pt-0.5">
              {feature.year}
            </div>

            {/* Right column: Content */}
            <div className="flex-1 flex flex-col justify-start items-start">
              <div className="flex items-center gap-1 group">
                {feature.link ? (
                  <a 
                    href={feature.link.startsWith('http') ? feature.link : `https://${feature.link}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:underline text-theme-primary"
                  >
                    <span className="text-base font-semibold">
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
                        className="inline-block ml-1 w-4 h-4 relative -top-0.5"
                      >
                        <path d="M7 17L17 7M7 7h10v10" />
                      </svg>
                    </span>
                  </a>
                ) : (
                  <p className="text-base font-semibold text-theme-primary">
                    {feature.title}
                    {feature.location ? ` on ${feature.location}` : ''}
                  </p>
                )}
              </div>
              
              {feature.description && feature.description !== '<p></p>' && (
                <div
                  className="mt-2 text-sm text-theme-secondary line-clamp-2"
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
