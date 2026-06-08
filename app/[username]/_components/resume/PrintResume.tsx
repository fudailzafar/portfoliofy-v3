import React, { useMemo } from 'react';
import { ResumeData } from '@/lib/server/dbActions';
import { sortByDateDesc, DEFAULT_SECTION_ORDER } from '@/lib/resume';
import { cn } from '@/lib/utils';
import { Awards } from './preview/Awards';
import { Certifications } from './preview/Certifications';

export const PrintResume = ({
  resume,
  printHiddenSections,
  className,
}: {
  resume?: ResumeData | null;
  printHiddenSections: string[];
  className?: string;
}) => {
  const {
    header,
    summary,
    workExperience,
    education,
    projects,
    sideProjects,
    speaking,
    features,
    volunteering,
    contacts,
    sectionOrder,
    awards,
    certifications,
  } = resume || {};

  const skillsList: string[] = (resume as any)?.skills || header?.skills || [];
  const order = useMemo(() => {
    const existingOrder = sectionOrder || DEFAULT_SECTION_ORDER;
    const missingSections = DEFAULT_SECTION_ORDER.filter(
      (section) => !existingOrder.includes(section),
    );
    return [...existingOrder, ...missingSections];
  }, [sectionOrder]);

  const sortedWork = useMemo(
    () => sortByDateDesc(workExperience),
    [workExperience],
  );
  const sortedAwards = sortByDateDesc(awards);
  const sortedCertifications = sortByDateDesc(certifications);
  const sortedProjects = useMemo(() => sortByDateDesc(projects), [projects]);
  const sortedSideProjects = useMemo(
    () => sortByDateDesc(sideProjects),
    [sideProjects],
  );
  const sortedFeatures = useMemo(() => sortByDateDesc(features), [features]);
  const sortedVolunteering = useMemo(
    () => sortByDateDesc(volunteering),
    [volunteering],
  );
  const sortedSpeaking = useMemo(() => sortByDateDesc(speaking), [speaking]);
  const sortedEducation = useMemo(() => sortByDateDesc(education), [education]);

  if (!resume) return null;

  const renderSection = (
    id: string,
    title: string,
    content: React.ReactNode,
  ) => {
    if (printHiddenSections.includes(id)) return null;
    if (!content) return null;

    return (
      <div className="page-break-inside-avoid mb-12 grid grid-cols-12 gap-8">
        <div className="col-span-4 pt-1 text-sm text-content-primary">
          {title}
        </div>
        <div className="col-span-8 flex flex-col gap-6">{content}</div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        'mx-auto w-full max-w-4xl bg-surface-1 px-8 py-12 text-content-primary',
        className,
      )}
    >
      {/* Header */}
      <div className="mb-16 grid grid-cols-12 gap-8">
        <div className="col-span-4 flex flex-col justify-start">
          <h1 className="text-xl text-content-primary">{header?.name}</h1>
          <p className="mt-1 text-sm text-content-secondary">
            {header?.shortAbout}
          </p>
        </div>
        <div className="col-span-8">
          {/* About section is rendered here if not hidden */}
          {!printHiddenSections.includes('summary') &&
            summary &&
            summary !== '<p></p>' && (
              <div
                className="prose prose-sm prose-p:my-2 prose-a:text-content-primary max-w-none text-sm leading-relaxed text-content-primary"
                dangerouslySetInnerHTML={{ __html: summary }}
              />
            )}
        </div>
      </div>

      {/* Sections */}
      {order.map((sectionId) => {
        switch (sectionId) {
          case 'awards':
            return <Awards key={sectionId} awards={sortedAwards} />;
          case 'certifications':
            return <Certifications key={sectionId} certifications={sortedCertifications} />;
          case 'work':
            if (!workExperience?.length) return null;
            return (
              <div key="work">
                {renderSection(
                  'work',
                  'Work Experience',
                  sortedWork.map((w: any) => (
                    <div key={w.id || w.company} className="flex gap-4">
                      <div className="w-24 shrink-0 pt-0.5 text-xs text-content-muted">
                        {w.start} — {w.end}
                      </div>
                      <div>
                        <p className="text-sm">
                          {w.title} at {w.company}
                        </p>
                        {w.location && (
                          <p className="mt-0.5 text-xs text-content-muted">
                            {w.location}
                          </p>
                        )}
                        {w.description && w.description !== '<p></p>' && (
                          <div
                            className="prose prose-sm prose-p:my-1 mt-2 max-w-none text-xs text-content-secondary"
                            dangerouslySetInnerHTML={{ __html: w.description }}
                          />
                        )}
                      </div>
                    </div>
                  )),
                )}
              </div>
            );
          case 'projects':
            if (!projects?.length) return null;
            return (
              <div key="projects">
                {renderSection(
                  'projects',
                  'Projects',
                  sortedProjects.map((p: any) => (
                    <div key={p.id || p.title} className="flex gap-4">
                      <div className="w-24 shrink-0 pt-0.5 text-xs text-content-muted">
                        {p.year}
                      </div>
                      <div>
                        <p className="text-sm">{p.title}</p>
                        {p.description && p.description !== '<p></p>' && (
                          <div
                            className="prose prose-sm prose-p:my-1 mt-2 max-w-none text-xs text-content-secondary"
                            dangerouslySetInnerHTML={{ __html: p.description }}
                          />
                        )}
                      </div>
                    </div>
                  )),
                )}
              </div>
            );
          case 'side_projects':
            if (!sideProjects?.length) return null;
            return (
              <div key="side_projects">
                {renderSection(
                  'side_projects',
                  'Side Projects',
                  sortedSideProjects.map((p: any) => (
                    <div key={p.id || p.title} className="flex gap-4">
                      <div className="w-24 shrink-0 pt-0.5 text-xs text-content-muted">
                        {p.year}
                      </div>
                      <div>
                        <p className="text-sm">{p.title}</p>
                        {p.description && p.description !== '<p></p>' && (
                          <div
                            className="prose prose-sm prose-p:my-1 mt-2 max-w-none text-xs text-content-secondary"
                            dangerouslySetInnerHTML={{ __html: p.description }}
                          />
                        )}
                      </div>
                    </div>
                  )),
                )}
              </div>
            );
          case 'features':
            if (!features?.length) return null;
            return (
              <div key="features">
                {renderSection(
                  'features',
                  'Features',
                  sortedFeatures.map((f: any) => (
                    <div key={f.id || f.title} className="flex gap-4">
                      <div className="w-24 shrink-0 pt-0.5 text-xs text-content-muted">
                        {f.year}
                      </div>
                      <div>
                        <p className="text-sm">
                          {f.title}
                          {f.location ? ` on ${f.location}` : ''}
                        </p>
                        {f.description && f.description !== '<p></p>' && (
                          <div
                            className="prose prose-sm prose-p:my-1 mt-2 max-w-none text-xs text-content-secondary"
                            dangerouslySetInnerHTML={{ __html: f.description }}
                          />
                        )}
                      </div>
                    </div>
                  )),
                )}
              </div>
            );
          case 'volunteering':
            if (!volunteering?.length) return null;
            return (
              <div key="volunteering">
                {renderSection(
                  'volunteering',
                  'Volunteering',
                  sortedVolunteering.map((v: any) => (
                    <div key={v.id || v.organization} className="flex gap-4">
                      <div className="w-24 shrink-0 pt-0.5 text-xs text-content-muted">
                        {v.startYear} — {v.endYear}
                      </div>
                      <div>
                        <p className="text-sm">
                          {v.role} at {v.organization}
                        </p>
                        {v.location && (
                          <p className="mt-0.5 text-xs text-content-muted">
                            {v.location}
                          </p>
                        )}
                      </div>
                    </div>
                  )),
                )}
              </div>
            );
          case 'speaking':
            if (!speaking?.length) return null;
            return (
              <div key="speaking">
                {renderSection(
                  'speaking',
                  'Speaking',
                  sortedSpeaking.map((s: any) => (
                    <div key={s.id || s.title} className="flex gap-4">
                      <div className="w-24 shrink-0 pt-0.5 text-xs text-content-muted">
                        {s.year}
                      </div>
                      <div>
                        <p className="text-sm">
                          {s.title}
                          {s.location ? ` at ${s.location}` : ''}
                        </p>
                      </div>
                    </div>
                  )),
                )}
              </div>
            );
          case 'education':
            if (!education?.length) return null;
            return (
              <div key="education">
                {renderSection(
                  'education',
                  'Education',
                  sortedEducation.map((e: any) => (
                    <div key={e.id || e.school} className="flex gap-4">
                      <div className="w-24 shrink-0 pt-0.5 text-xs text-content-muted">
                        {e.start} — {e.end}
                      </div>
                      <div>
                        <p className="text-sm">
                          {e.degree} at {e.school}
                        </p>
                        {e.location && (
                          <p className="mt-0.5 text-xs text-content-muted">
                            {e.location}
                          </p>
                        )}
                        {e.description && e.description !== '<p></p>' && (
                          <div
                            className="prose prose-sm prose-p:my-1 mt-2 max-w-none text-xs text-content-secondary"
                            dangerouslySetInnerHTML={{ __html: e.description }}
                          />
                        )}
                      </div>
                    </div>
                  )),
                )}
              </div>
            );
          case 'skills':
            if (!skillsList?.length) return null;
            return (
              <div key="skills">
                {renderSection(
                  'skills',
                  'Skills',
                  <div className="flex flex-wrap gap-2">
                    {skillsList.map((skill: string) => (
                      <span
                        key={skill}
                        className="text-sm text-content-primary"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>,
                )}
              </div>
            );
          case 'contact':
            if (!contacts?.length) return null;
            return (
              <div key="contact">
                {renderSection(
                  'contact',
                  'Contact',
                  <div className="flex flex-col gap-3">
                    {contacts.map((c: any) => (
                      <div
                        key={c.id || c.link}
                        className="flex items-start gap-4"
                      >
                        <div className="w-24 shrink-0 pt-0.5 text-sm capitalize text-content-primary">
                          {c.platform}:
                        </div>
                        <div>
                          <a
                            href={
                              c.link.startsWith('http')
                                ? c.link
                                : `https://${c.link}`
                            }
                            className="text-sm text-content-primary hover:underline"
                          >
                            {c.link}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>,
                )}
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
};
