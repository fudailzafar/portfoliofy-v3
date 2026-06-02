import { ResumeDataSchemaType } from '@/lib/resume';
import { ArrowUpRight } from 'lucide-react';

interface VolunteeringProps {
  volunteering?: ResumeDataSchemaType['volunteering'];
}

export function Volunteering({ volunteering }: VolunteeringProps) {
  if (!volunteering || volunteering.length === 0) return null;

  return (
    <section className="mb-12 print:mb-8">
      <h2
        className="mb-8 text-sm font-bold text-theme-primary print:mb-4"
        id="volunteering-section"
      >
        Volunteering
      </h2>
      <div
        className="flex flex-col gap-8"
        role="feed"
        aria-labelledby="volunteering-section"
      >
        {volunteering.map((v) => (
          <div
            key={v.id}
            className="flex flex-col gap-4 sm:flex-row sm:gap-12 print:mb-6"
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
                      {v.role}
                      <span className="font-normal"> at {v.organization}</span>
                      <ArrowUpRight className="relative -top-0.5 ml-1 inline-block h-4 w-4" />
                    </span>
                  </a>
                ) : (
                  <p className="text-sm font-semibold text-theme-primary">
                    {v.role}
                    <span className="font-normal text-theme-primary">
                      {' '}
                      at {v.organization}
                    </span>
                  </p>
                )}
              </div>

              {v.location && (
                <div className="mt-2 text-sm text-theme-secondary">
                  {v.location}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
