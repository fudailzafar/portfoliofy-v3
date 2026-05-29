import { ResumeDataSchemaType } from '@/lib/resume';
import { ArrowUpRight } from 'lucide-react';

interface VolunteeringProps {
  volunteering?: ResumeDataSchemaType['volunteering'];
}

export function Volunteering({
  volunteering,
}: VolunteeringProps) {
  if (!volunteering || volunteering.length === 0) return null;

  return (
    <section className="mb-12 print:mb-8">
      <h2 
        className="text-sm font-bold mb-8 print:mb-4 text-theme-primary" 
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
          <div key={v.id} className="flex flex-col sm:flex-row gap-4 sm:gap-12 print:mb-6">
            {/* Year Column */}
            <div 
              className="sm:w-32 shrink-0 text-theme-secondary text-sm pt-0.5"
              aria-label={`From ${v.startYear} to ${v.endYear}`}
            >
              {v.startYear} — {v.endYear}
            </div>

            {/* Content Column */}
            <div className="flex-1 flex flex-col justify-start items-start">
              <div className="flex items-center gap-1 group">
                {v.link ? (
                  <a 
                    href={v.link.startsWith('http') ? v.link : `https://${v.link}`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:underline text-theme-primary"
                  >
                    <span className="text-sm font-semibold">
                      {v.role}
                      <span className="font-normal">
                        {' '}at {v.organization}
                      </span>
                      <ArrowUpRight className="inline-block ml-1 w-4 h-4 relative -top-0.5" />
                    </span>
                  </a>
                ) : (
                  <p className="text-sm font-semibold text-theme-primary">
                    {v.role}
                    <span className="font-normal text-theme-primary">
                      {' '}at {v.organization}
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
