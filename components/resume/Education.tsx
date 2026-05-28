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
    () => educations?.filter((edu) => edu.school && edu.degree && edu.end) || [],
    [educations],
  );

  if (validEducations.length === 0) {
    return null;
  }

  return (
    <section className="mb-12 print:mb-8">
      <h2 
        className="text-lg font-bold mb-8 print:mb-4 text-gray-900" 
        id="education-section"
      >
        Education
      </h2>
      <div
        className="flex flex-col gap-8"
        role="feed"
        aria-labelledby="education-section"
      >
        {validEducations.map((edu, idx) => (
          <div
            key={edu.id || idx}
            className="flex flex-col sm:flex-row gap-4 sm:gap-12 print:mb-6"
          >
            {/* Left column: Years */}
            <div className="sm:w-32 shrink-0 text-gray-500  text-sm pt-0.5">
              {edu.start ? `${edu.start} — ${edu.end}` : edu.end}
            </div>

            {/* Right column: Content */}
            <div className="flex-1 flex flex-col justify-start items-start">
              <p className="text-base font-semibold text-gray-900 ">
                {edu.degree} at {edu.school}
              </p>
              
              {edu.location && (
                <p className="mt-1 text-sm text-gray-500 ">
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
