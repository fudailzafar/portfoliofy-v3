import React, { useMemo } from 'react';
import { ResumeData } from '@/lib/server/dbActions';
import { sortByDateDesc, normalizeSectionOrder } from '@/lib/resume';
import { cn } from '@/lib/utils';

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
    writing,
    exhibitions,
    features,
    volunteering,
    contacts,
    sectionOrder,
    awards,
    certifications,
  } = resume || {};

  const skillsList: string[] = (resume as any)?.skills || header?.skills || [];
  const order = useMemo(
    () => normalizeSectionOrder(sectionOrder),
    [sectionOrder],
  );

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
  const sortedWriting = useMemo(() => sortByDateDesc(writing), [writing]);
  const sortedExhibitions = useMemo(
    () => sortByDateDesc(exhibitions),
    [exhibitions],
  );
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
      <div className="page-break-inside-avoid mb-12 grid grid-cols-12 items-baseline gap-8">
        <div className="col-span-4 text-sm text-black">{title}</div>
        <div className="col-span-8 flex flex-col gap-6">{content}</div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        'mx-auto w-full max-w-4xl bg-surface-1 px-8 py-12 text-black',
        className,
      )}
    >
      {/* Header */}
      <div className="mb-16 grid grid-cols-12 gap-8">
        <div className="col-span-4 flex flex-col justify-start">
          <h1 className="text-sm text-black">{header?.name}</h1>
          <p className="mt-1 text-sm text-black">{header?.shortAbout}</p>
        </div>
        <div className="col-span-8">
          {/* About section is rendered here if not hidden */}
          {!printHiddenSections.includes('summary') &&
            summary &&
            summary !== '<p></p>' && (
              <div
                className="prose prose-sm max-w-none text-sm leading-relaxed text-black prose-p:mb-2 prose-p:mt-0 prose-a:text-black"
                dangerouslySetInnerHTML={{ __html: summary }}
              />
            )}
        </div>
      </div>

      {/* Sections */}
      {order.map((sectionId) => {
        switch (sectionId) {
          case 'awards':
            if (!awards?.length) return null;
            return (
              <div key="awards">
                {renderSection(
                  'awards',
                  'Awards',
                  sortedAwards.map((award: any) => (
                    <div
                      key={award.id || award.title}
                      className="flex items-baseline gap-4"
                    >
                      <div className="w-24 shrink-0 text-sm text-black">
                        {award.year}
                      </div>
                      <div>
                        <p className="text-sm">
                          {award.title} from {award.issuer}
                        </p>
                        {award.description &&
                          award.description !== '<p></p>' && (
                            <div
                              className="prose prose-sm mt-2 max-w-none text-sm text-black prose-p:my-1"
                              dangerouslySetInnerHTML={{
                                __html: award.description,
                              }}
                            />
                          )}
                      </div>
                    </div>
                  )),
                )}
              </div>
            );
          case 'certifications':
            if (!certifications?.length) return null;
            return (
              <div key="certifications">
                {renderSection(
                  'certifications',
                  'Certifications',
                  sortedCertifications.map((cert: any) => (
                    <div
                      key={cert.id || cert.title}
                      className="flex items-baseline gap-4"
                    >
                      <div className="w-24 shrink-0 text-sm text-black">
                        {cert.year}
                      </div>
                      <div>
                        <p className="text-sm">
                          {cert.title} from {cert.issuer}
                        </p>
                        {cert.description && cert.description !== '<p></p>' && (
                          <div
                            className="prose prose-sm mt-2 max-w-none text-sm text-black prose-p:my-1"
                            dangerouslySetInnerHTML={{
                              __html: cert.description,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  )),
                )}
              </div>
            );
          case 'work':
            if (!workExperience?.length) return null;
            return (
              <div key="work">
                {renderSection(
                  'work',
                  'Work Experience',
                  sortedWork.map((w: any) => (
                    <div
                      key={w.id || w.company}
                      className="flex items-baseline gap-4"
                    >
                      <div className="w-24 shrink-0 text-sm text-black">
                        {w.start} — {w.end}
                      </div>
                      <div>
                        <p className="text-sm">
                          {w.title} at {w.company}
                        </p>
                        {w.location && (
                          <p className="mt-0.5 text-sm text-black">
                            {w.location}
                          </p>
                        )}
                        {w.description && w.description !== '<p></p>' && (
                          <div
                            className="prose prose-sm mt-2 max-w-none text-sm text-black prose-p:my-1"
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
                    <div
                      key={p.id || p.title}
                      className="flex items-baseline gap-4"
                    >
                      <div className="w-24 shrink-0 text-sm text-black">
                        {p.year}
                      </div>
                      <div>
                        <p className="text-sm">{p.title}</p>
                        {p.description && p.description !== '<p></p>' && (
                          <div
                            className="prose prose-sm mt-2 max-w-none text-sm text-black prose-p:my-1"
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
                    <div
                      key={p.id || p.title}
                      className="flex items-baseline gap-4"
                    >
                      <div className="w-24 shrink-0 text-sm text-black">
                        {p.year}
                      </div>
                      <div>
                        <p className="text-sm">{p.title}</p>
                        {p.description && p.description !== '<p></p>' && (
                          <div
                            className="prose prose-sm mt-2 max-w-none text-sm text-black prose-p:my-1"
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
                    <div
                      key={f.id || f.title}
                      className="flex items-baseline gap-4"
                    >
                      <div className="w-24 shrink-0 text-sm text-black">
                        {f.year}
                      </div>
                      <div>
                        <p className="text-sm">
                          {f.title}
                          {f.location ? ` on ${f.location}` : ''}
                        </p>
                        {f.description && f.description !== '<p></p>' && (
                          <div
                            className="prose prose-sm mt-2 max-w-none text-sm text-black prose-p:my-1"
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
                    <div
                      key={v.id || v.organization}
                      className="flex items-baseline gap-4"
                    >
                      <div className="w-24 shrink-0 text-sm text-black">
                        {v.startYear} — {v.endYear}
                      </div>
                      <div>
                        <p className="text-sm">
                          {v.role} at {v.organization}
                        </p>
                        {v.location && (
                          <p className="mt-0.5 text-sm text-black">
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
                    <div
                      key={s.id || s.title}
                      className="flex items-baseline gap-4"
                    >
                      <div className="w-24 shrink-0 text-sm text-black">
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
          case 'writing':
            if (!writing?.length) return null;
            return (
              <div key="writing">
                {renderSection(
                  'writing',
                  'Writing',
                  sortedWriting.map((s: any) => (
                    <div
                      key={s.id || s.title}
                      className="flex items-baseline gap-4"
                    >
                      <div className="w-24 shrink-0 text-sm text-black">
                        {s.year}
                      </div>
                      <div>
                        <p className="text-sm">
                          {s.title}
                          {s.publication ? `, ${s.publication}` : ''}
                        </p>
                        {s.description && s.description !== '<p></p>' && (
                          <div
                            className="mt-1 text-sm text-black"
                            dangerouslySetInnerHTML={{ __html: s.description }}
                          />
                        )}
                      </div>
                    </div>
                  )),
                )}
              </div>
            );
          case 'exhibitions':
            if (!exhibitions?.length) return null;
            return (
              <div key="exhibitions">
                {renderSection(
                  'exhibitions',
                  'Exhibitions',
                  sortedExhibitions.map((s: any) => (
                    <div
                      key={s.id || s.title}
                      className="flex items-baseline gap-4"
                    >
                      <div className="w-24 shrink-0 text-sm text-black">
                        {s.year}
                      </div>
                      <div>
                        <p className="text-sm">
                          {s.title}
                          {s.organization ? ` at ${s.organization}` : ''}
                        </p>
                        {s.location && (
                          <p className="mt-0.5 text-sm text-black">
                            {s.location}
                          </p>
                        )}
                        {s.description && s.description !== '<p></p>' && (
                          <div
                            className="mt-1 text-sm text-black"
                            dangerouslySetInnerHTML={{ __html: s.description }}
                          />
                        )}
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
                    <div
                      key={e.id || e.school}
                      className="flex items-baseline gap-4"
                    >
                      <div className="w-24 shrink-0 text-sm text-black">
                        {e.start} — {e.end}
                      </div>
                      <div>
                        <p className="text-sm">
                          {e.degree} at {e.school}
                        </p>
                        {e.location && (
                          <p className="mt-0.5 text-sm text-black">
                            {e.location}
                          </p>
                        )}
                        {e.description && e.description !== '<p></p>' && (
                          <div
                            className="prose prose-sm mt-2 max-w-none text-sm text-black prose-p:my-1"
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
                      <span key={skill} className="text-sm text-black">
                        {skill}
                      </span>
                    ))}
                  </div>,
                )}
              </div>
            );
          case 'contact':
            const visibleContacts = contacts?.filter((c: any) => !c.hidden);
            if (!visibleContacts?.length) return null;
            return (
              <div key="contact">
                {renderSection(
                  'contact',
                  'Contact',
                  <div className="flex flex-col gap-3">
                    {visibleContacts.map((c: any) => (
                      <div
                        key={c.id || c.link}
                        className="flex items-baseline gap-4"
                      >
                        <div className="w-24 shrink-0 text-sm capitalize text-black">
                          {c.platform}:
                        </div>
                        <div>
                          <a
                            href={
                              c.link.startsWith('http') ||
                              c.link.startsWith('mailto:') ||
                              c.link.startsWith('tel:')
                                ? c.link
                                : `https://${c.link}`
                            }
                            className="text-sm text-black hover:underline hover:underline-offset-4"
                          >
                            {c.link.replace(/^mailto:/, '').replace(/^tel:/, '')}
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
