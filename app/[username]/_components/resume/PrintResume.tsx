import React, { useMemo } from 'react';
import { ResumeData } from '@/lib/server/dbActions';
import {
  sortByDateDesc,
  normalizeSectionOrder,
  SECTION_LABELS,
} from '@/lib/resume';
import { cn, ensureHttps } from '@/lib/utils';
import { PrintListItem } from './print/PrintListItem';

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

  const visibleContacts = contacts?.filter((c: any) => !c.hidden);

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

  // Each entry's `content` mirrors what that section actually looks like on
  // the page — the field mapping is inherently section-specific, but the
  // guard-and-wrap boilerplate around it is not, so `order.map` below only
  // has to do that once.
  const sections: Record<string, { title: string; content: React.ReactNode }> =
    {
      awards: {
        title: SECTION_LABELS['awards'],
        content: awards?.length
          ? sortedAwards.map((award: any) => (
              <PrintListItem
                key={award.id || award.title}
                leftContent={award.year}
                title={award.title}
                subtitle={`from ${award.issuer}`}
                description={award.description}
              />
            ))
          : null,
      },
      certifications: {
        title: SECTION_LABELS['certifications'],
        content: certifications?.length
          ? sortedCertifications.map((cert: any) => (
              <PrintListItem
                key={cert.id || cert.title}
                leftContent={cert.year}
                title={cert.title}
                subtitle={`from ${cert.issuer}`}
                description={cert.description}
              />
            ))
          : null,
      },
      work: {
        title: SECTION_LABELS['work'],
        content: workExperience?.length
          ? sortedWork.map((w: any) => (
              <PrintListItem
                key={w.id || w.company}
                leftContent={`${w.start} — ${w.end}`}
                title={w.title}
                subtitle={`at ${w.company}`}
                location={w.location}
                description={w.description}
              />
            ))
          : null,
      },
      projects: {
        title: SECTION_LABELS['projects'],
        content: projects?.length
          ? sortedProjects.map((p: any) => (
              <PrintListItem
                key={p.id || p.title}
                leftContent={p.year}
                title={p.title}
                description={p.description}
              />
            ))
          : null,
      },
      side_projects: {
        title: SECTION_LABELS['side_projects'],
        content: sideProjects?.length
          ? sortedSideProjects.map((p: any) => (
              <PrintListItem
                key={p.id || p.title}
                leftContent={p.year}
                title={p.title}
                description={p.description}
              />
            ))
          : null,
      },
      features: {
        title: SECTION_LABELS['features'],
        content: features?.length
          ? sortedFeatures.map((f: any) => (
              <PrintListItem
                key={f.id || f.title}
                leftContent={f.year}
                title={f.title}
                subtitle={f.location ? `on ${f.location}` : undefined}
                description={f.description}
              />
            ))
          : null,
      },
      volunteering: {
        title: SECTION_LABELS['volunteering'],
        content: volunteering?.length
          ? sortedVolunteering.map((v: any) => (
              <PrintListItem
                key={v.id || v.organization}
                leftContent={`${v.startYear} — ${v.endYear}`}
                title={v.role}
                subtitle={`at ${v.organization}`}
                location={v.location}
              />
            ))
          : null,
      },
      speaking: {
        title: SECTION_LABELS['speaking'],
        content: speaking?.length
          ? sortedSpeaking.map((s: any) => (
              <PrintListItem
                key={s.id || s.title}
                leftContent={s.year}
                title={s.title}
                subtitle={s.location ? `at ${s.location}` : undefined}
              />
            ))
          : null,
      },
      writing: {
        title: SECTION_LABELS['writing'],
        content: writing?.length
          ? sortedWriting.map((s: any) => (
              <PrintListItem
                key={s.id || s.title}
                leftContent={s.year}
                title={s.title}
                subtitle={s.publication ? `, ${s.publication}` : undefined}
                description={s.description}
              />
            ))
          : null,
      },
      exhibitions: {
        title: SECTION_LABELS['exhibitions'],
        content: exhibitions?.length
          ? sortedExhibitions.map((s: any) => (
              <PrintListItem
                key={s.id || s.title}
                leftContent={s.year}
                title={s.title}
                subtitle={s.organization ? `at ${s.organization}` : undefined}
                location={s.location}
                description={s.description}
              />
            ))
          : null,
      },
      education: {
        title: SECTION_LABELS['education'],
        content: education?.length
          ? sortedEducation.map((e: any) => (
              <PrintListItem
                key={e.id || e.school}
                leftContent={`${e.start} — ${e.end}`}
                title={e.degree}
                subtitle={`at ${e.school}`}
                location={e.location}
                description={e.description}
              />
            ))
          : null,
      },
      skills: {
        title: SECTION_LABELS['skills'],
        content: skillsList?.length ? (
          <div className="flex flex-wrap gap-2">
            {skillsList.map((skill: string) => (
              <span key={skill} className="text-sm text-black">
                {skill}
              </span>
            ))}
          </div>
        ) : null,
      },
      contact: {
        title: SECTION_LABELS['contact'],
        content: visibleContacts?.length ? (
          <div className="flex flex-col gap-3">
            {visibleContacts.map((c: any) => (
              <div key={c.id || c.link} className="flex items-baseline gap-4">
                <div className="w-24 shrink-0 text-sm capitalize text-black">
                  {c.platform}:
                </div>
                <div>
                  <a
                    href={
                      c.link.startsWith('mailto:') || c.link.startsWith('tel:')
                        ? c.link
                        : ensureHttps(c.link)
                    }
                    className="text-sm text-black hover:underline hover:underline-offset-4"
                  >
                    {c.link.replace(/^mailto:/, '').replace(/^tel:/, '')}
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : null,
      },
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
                className="prose prose-sm max-w-none text-sm leading-relaxed text-black prose-p:mb-2 prose-p:mt-0 prose-a:text-black prose-ol:pl-0 prose-ul:pl-0 prose-li:pl-0"
                dangerouslySetInnerHTML={{ __html: summary }}
              />
            )}
        </div>
      </div>

      {/* Sections */}
      {order.map((sectionId) => {
        const section = sections[sectionId];
        if (!section) return null;
        return (
          <React.Fragment key={sectionId}>
            {renderSection(sectionId, section.title, section.content)}
          </React.Fragment>
        );
      })}
    </div>
  );
};
