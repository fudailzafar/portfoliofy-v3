import { ResumeDataSchemaType } from '@/lib/resume';
import { AttachmentsPreview } from './AttachmentsPreview';
import { ArrowUpRight } from 'lucide-react';

export function SideProjects({
  sideProjects,
}: {
  sideProjects?: ResumeDataSchemaType['sideProjects'];
}) {
  const visibleProjects = sideProjects?.filter((project) => !project.hidden);
  if (!visibleProjects || visibleProjects.length === 0) return null;

  return (
    <section className="mb-9 print:mb-8">
      <h2
        className="mb-6 text-sm font-bold text-theme-primary print:mb-4"
        id="side-projects-section"
      >
        Side Projects
      </h2>
      <div
        className="ml-6 flex flex-col gap-8 sm:ml-0"
        role="feed"
        aria-labelledby="side-projects-section"
      >
        {visibleProjects.map((project) => (
          <div
            key={project.id || project.title}
            className="flex flex-col gap-1 sm:flex-row sm:gap-[36px] print:mb-6"
          >
            {/* Left column: Year */}
            <div className="shrink-0 pt-0.5 text-sm text-theme-secondary sm:w-[94px]">
              {project.year}
            </div>

            {/* Right column: Content */}
            <div className="flex flex-1 flex-col items-start justify-start">
              <div className="group flex items-center gap-1">
                {project.link ? (
                  <a
                    href={
                      project.link.startsWith('http')
                        ? project.link
                        : `https://${project.link}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-theme-primary hover:underline hover:underline-offset-4"
                  >
                    <span className="text-sm font-semibold">
                      {project.title}
                      {project.company && (
                        <span className="font-normal">
                          {' '}
                          at {project.company}
                        </span>
                      )}
                      <ArrowUpRight className="relative -top-0.5 ml-1 inline-block h-4 w-4" />
                    </span>
                  </a>
                ) : (
                  <p className="text-sm font-semibold text-theme-primary">
                    {project.title}
                    {project.company && (
                      <span className="font-normal text-theme-primary">
                        {' '}
                        at {project.company}
                      </span>
                    )}
                  </p>
                )}
              </div>

              {project.description && project.description !== '<p></p>' && (
                <div
                  className="prose prose-sm prose-ul:pl-0 prose-ol:pl-0 prose-li:pl-0 max-w-none text-sm text-theme-secondary prose-p:my-1 prose-p:text-theme-secondary prose-strong:text-theme-primary prose-ul:my-1 prose-ul:text-theme-secondary prose-li:text-theme-secondary"
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />
              )}
              <AttachmentsPreview attachments={project.attachments} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
