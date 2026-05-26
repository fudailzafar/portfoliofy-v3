import { Section } from '@/components/ui/section';
import { ResumeDataSchemaType } from '@/lib/resume';
import { ArrowUpRight } from 'lucide-react';

export function Projects({
  projects,
}: {
  projects?: ResumeDataSchemaType['projects'];
}) {
  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <section className="mb-12 print:mb-8">
      <h2 
        className="text-lg font-bold mb-8 print:mb-4 text-gray-900" 
        id="projects-section"
      >
        Projects
      </h2>
      <div
        className="flex flex-col gap-8"
        role="feed"
        aria-labelledby="projects-section"
      >
        {projects.map((project) => (
          <div
            key={project.id || project.title}
            className="flex flex-col sm:flex-row gap-4 sm:gap-12 print:mb-6"
          >
            {/* Left column: Year */}
            <div className="sm:w-32 shrink-0 text-gray-500 font-mono text-sm pt-0.5">
              {project.year}
            </div>

            {/* Right column: Content */}
            <div className="flex-1 flex flex-col justify-start items-start">
              <div className="flex items-center gap-1 group">
                {project.link ? (
                  <a 
                    href={project.link.startsWith('http') ? project.link : `https://${project.link}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:underline"
                  >
                    <span className="text-base font-semibold text-gray-900 font-mono">
                      {project.title}
                      {project.company && (
                        <span className="font-normal text-gray-900">
                          {' '}at {project.company}
                        </span>
                      )}
                      <ArrowUpRight className="inline-block ml-1 w-4 h-4 text-gray-900 relative -top-0.5" />
                    </span>
                  </a>
                ) : (
                  <p className="text-base font-semibold text-gray-900 font-mono">
                    {project.title}
                    {project.company && (
                      <span className="font-normal text-gray-900">
                        {' '}at {project.company}
                      </span>
                    )}
                  </p>
                )}
              </div>
              
              {project.description && project.description !== '<p></p>' && (
                <div 
                  className="mt-2 text-sm text-gray-600 font-mono prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1"
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
