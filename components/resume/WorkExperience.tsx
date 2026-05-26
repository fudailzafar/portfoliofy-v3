import { ResumeDataSchemaType } from '@/lib/resume';
import { useMemo } from 'react';
import { ArrowUpRight } from 'lucide-react';

export function WorkExperience({
  work,
}: {
  work: ResumeDataSchemaType['workExperience'];
}) {
  // Filter out invalid work experiences
  const validWork = useMemo(() => {
    return work?.filter((item) => item.company && item.title && item.start) || [];
  }, [work]);

  if (validWork.length === 0) {
    return null;
  }

  return (
    <section className="mb-12 print:mb-8">
      <h2 
        className="text-lg font-bold mb-8 print:mb-4 text-gray-900" 
        id="work-experience"
      >
        Work Experience
      </h2>
      <div
        className="flex flex-col gap-8"
        role="feed"
        aria-labelledby="work-experience"
      >
        {validWork.map((item, idx) => (
          <div
            key={item.id || idx}
            className="flex flex-col sm:flex-row gap-4 sm:gap-12 print:mb-6"
          >
            {/* Left column: Years */}
            <div className="sm:w-32 shrink-0 text-gray-500 font-mono text-sm pt-0.5">
              {item.start} — {item.end || 'Now'}
            </div>

            {/* Right column: Content */}
            <div className="flex-1 flex flex-col justify-start items-start">
              <div className="flex items-center gap-1 group">
                {item.link ? (
                  <a 
                    href={item.link.startsWith('http') ? item.link : `https://${item.link}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:underline"
                  >
                    <span className="text-base font-semibold text-gray-900 font-mono">
                      {item.title} at {item.company}
                      <ArrowUpRight className="inline-block ml-1 w-4 h-4 text-gray-900 relative -top-0.5" />
                    </span>
                  </a>
                ) : (
                  <p className="text-base font-semibold text-gray-900 font-mono">
                    {item.title} at {item.company}
                  </p>
                )}
              </div>
              
              {item.location && (
                <p className="mt-1 text-sm text-gray-500 font-mono">
                  {item.location}
                </p>
              )}

              {item.description && item.description !== '<p></p>' && (
                <div 
                  className="mt-4 text-base text-gray-600 font-mono prose prose-sm max-w-none leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: item.description }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
