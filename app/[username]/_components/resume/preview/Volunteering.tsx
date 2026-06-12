import { ResumeDataSchemaType } from '@/lib/resume';
import { ArrowUpRight } from 'lucide-react';

interface VolunteeringProps {
  volunteering?: ResumeDataSchemaType['volunteering'];
}

export function Volunteering({ volunteering }: VolunteeringProps) {
  const visibleVolunteering = volunteering?.filter((v) => !v.hidden);
  if (!visibleVolunteering || visibleVolunteering.length === 0) return null;

  return (
    <section className="mb-12 print:mb-8">
      <h2
        className="mb-8 text-sm font-bold text-theme-primary print:mb-4"
        id="volunteering-section"
      >
        Volunteering
      </h2>
      <div
        className="ml-6 flex flex-col gap-8 sm:ml-0"
        role="feed"
        aria-labelledby="volunteering-section"
      >
        {visibleVolunteering.map((v) => (
          <div
            key={v.id}
            className="flex flex-col gap-1 sm:flex-row sm:gap-12 print:mb-6"
          >
            {/* Year Column */}
            <div
              className="shrink-0 pt-0.5 text-sm text-theme-secondary sm:w-32"
              aria-label={`From ${v.startYear} to ${v.endYear}`}
            >
              {v.startYear} — {v.endYear}
            </div>

            {/* Content Column */}
            <div className="flex flex-1 flex-col items-start justify-start">
              <div className="group flex items-center gap-1">
                {v.link ? (
                  <a
                    href={
                      v.link.startsWith('http') ? v.link : `https://${v.link}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-theme-primary hover:underline"
                  >
                    <span className="text-sm font-semibold">
                      {v.role} at {v.organization}
                      <ArrowUpRight className="relative -top-0.5 ml-1 inline-block h-4 w-4" />
                    </span>
                  </a>
                ) : (
                  <p className="text-sm font-semibold text-theme-primary">
                    {v.role} at {v.organization}
                  </p>
                )}
              </div>

              {v.location && (
                <p className="mt-1 text-sm text-theme-secondary">
                  {v.location}
                </p>
              )}

              {v.description && v.description !== '<p></p>' && (
                <div
                  className="prose prose-sm prose-p:my-1 prose-ul:my-1 prose-p:text-theme-secondary prose-ul:text-theme-secondary prose-li:text-theme-secondary prose-strong:text-theme-primary mt-4 max-w-none text-sm leading-relaxed text-theme-secondary"
                  dangerouslySetInnerHTML={{ __html: v.description }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
