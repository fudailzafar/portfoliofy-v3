import { ResumeDataSchemaType } from '@/lib/resume';

export function SideProjects({
  sideProjects,
}: {
  sideProjects?: ResumeDataSchemaType['sideProjects'];
}) {
  if (!sideProjects || sideProjects.length === 0) return null;

  return (
    <section className="mb-12 print:mb-8">
      <h2 
        className="text-lg font-bold mb-8 print:mb-4 text-gray-900" 
        id="side-projects-section"
      >
        Side Projects
      </h2>
      <div
        className="flex flex-col gap-8"
        role="feed"
        aria-labelledby="side-projects-section"
      >
        {sideProjects.map((project) => (
          <div
            key={project.id || project.title}
            className="flex flex-col sm:flex-row gap-4 sm:gap-12 print:mb-6"
          >
            {/* Left column: Year */}
            <div className="sm:w-32 shrink-0 text-gray-500  text-sm pt-0.5">
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
                    <span className="text-base font-semibold text-gray-900 ">
                      {project.title}
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
                        className="inline-block ml-1 w-4 h-4 text-gray-900 relative -top-0.5"
                      >
                        <path d="M7 17L17 7M7 7h10v10" />
                      </svg>
                    </span>
                  </a>
                ) : (
                  <p className="text-base font-semibold text-gray-900 ">
                    {project.title}
                  </p>
                )}
              </div>
              
              {project.description && project.description !== '<p></p>' && (
                <div 
                  className="mt-2 text-sm text-gray-600  prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1"
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
