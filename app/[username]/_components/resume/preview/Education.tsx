import { ResumeDataSchemaType } from '@/lib/resume';
import { useMemo } from 'react';

/**
 * Main education section component
 * Renders a list of education experiences in a two-column layout
 */
export function Education({
  educations,
}: {
  educations: ResumeDataSchemaType['education'];
}) {
  // Filter out invalid education entries
  const validEducations = useMemo(
    () =>
      educations?.filter((edu) => edu.school && edu.degree && edu.end) || [],
    [educations],
  );

  if (validEducations.length === 0) {
    return null;
  }

  return (
    <section className="mb-12 print:mb-8">
      <h2
        className="mb-8 text-sm font-bold text-theme-primary print:mb-4"
        id="education-section"
      >
        Education
      </h2>
      <div
        className="ml-6 flex flex-col gap-8 sm:ml-0"
        role="feed"
        aria-labelledby="education-section"
      >
        {validEducations.map((edu, idx) => (
          <div
            key={edu.id || idx}
            className="flex flex-col gap-1 sm:flex-row sm:gap-12 print:mb-6"
          >
            {/* Left column: Years */}
            <div className="shrink-0 pt-0.5 text-sm text-theme-secondary sm:w-32">
              {edu.start ? `${edu.start} — ${edu.end}` : edu.end}
            </div>

            {/* Right column: Content */}
            <div className="flex flex-1 flex-col items-start justify-start">
              <p className="text-sm font-semibold text-theme-primary">
                {edu.degree} at {edu.school}
              </p>

              {edu.location && (
                <p className="mt-1 text-sm text-theme-secondary">
                  {edu.location}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
