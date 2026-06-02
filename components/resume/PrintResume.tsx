import React from 'react';
import { ResumeData } from '../../lib/server/redisActions';
import { sortByDateDesc } from '../../lib/resume';
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
  if (!resume) return null;

  const { header, summary, workExperience, education, projects, sideProjects, speaking, features, volunteering, skills, contacts, sectionOrder } = resume;

  const DEFAULT_ORDER = ['work', 'side_projects', 'speaking', 'features', 'projects', 'skills', 'education', 'contact', 'awards', 'exhibitions'];
  const order = (sectionOrder || DEFAULT_ORDER).map(id => id === 'writing' ? 'features' : id === 'exhibitions' ? 'volunteering' : id);

  const renderSection = (id: string, title: string, content: React.ReactNode) => {
    if (printHiddenSections.includes(id)) return null;
    if (!content) return null;

    return (
      <div className="grid grid-cols-12 gap-8 mb-12 page-break-inside-avoid">
        <div className="col-span-4 text-sm text-gray-900 pt-1">
          {title}
        </div>
        <div className="col-span-8 flex flex-col gap-6">
          {content}
        </div>
      </div>
    );
  };

  return (
    <div className={cn('max-w-4xl mx-auto w-full bg-white text-black py-12 px-8', className)}>
      {/* Header */}
      <div className="grid grid-cols-12 gap-8 mb-16">
        <div className="col-span-4 flex flex-col justify-start">
          <h1 className="text-xl text-black">{header?.name}</h1>
          <p className="text-sm text-gray-600 mt-1">{header?.shortAbout}</p>
        </div>
        <div className="col-span-8">
          {/* About section is rendered here if not hidden */}
          {!printHiddenSections.includes('summary') && summary && summary !== '<p></p>' && (
            <div
              className="text-sm text-gray-800 leading-relaxed prose prose-sm max-w-none prose-p:my-2 prose-a:text-black"
              dangerouslySetInnerHTML={{ __html: summary }}
            />
          )}
        </div>
      </div>

      {/* Sections */}
      {order.map((sectionId) => {
        switch (sectionId) {
          case 'work':
            if (!workExperience?.length) return null;
            return renderSection('work', 'Work Experience', sortByDateDesc(workExperience).map((w: any) => (
              <div key={w.id || w.company} className="flex gap-4">
                <div className="w-24 shrink-0 text-xs text-gray-500 pt-0.5">{w.start} — {w.end}</div>
                <div>
                  <p className="text-sm">{w.title} at {w.company}</p>
                  {w.location && <p className="text-xs text-gray-500 mt-0.5">{w.location}</p>}
                  {w.description && w.description !== '<p></p>' && (
                    <div className="mt-2 text-xs text-gray-600 prose prose-sm max-w-none prose-p:my-1" dangerouslySetInnerHTML={{ __html: w.description }} />
                  )}
                </div>
              </div>
            )));
          case 'projects':
            if (!projects?.length) return null;
            return renderSection('projects', 'Projects', sortByDateDesc(projects).map((p: any) => (
              <div key={p.id || p.title} className="flex gap-4">
                <div className="w-24 shrink-0 text-xs text-gray-500 pt-0.5">{p.year}</div>
                <div>
                  <p className="text-sm">{p.title}</p>
                  {p.description && p.description !== '<p></p>' && (
                    <div className="mt-2 text-xs text-gray-600 prose prose-sm max-w-none prose-p:my-1" dangerouslySetInnerHTML={{ __html: p.description }} />
                  )}
                </div>
              </div>
            )));
          case 'side_projects':
            if (!sideProjects?.length) return null;
            return renderSection('side_projects', 'Side Projects', sortByDateDesc(sideProjects).map((p: any) => (
              <div key={p.id || p.title} className="flex gap-4">
                <div className="w-24 shrink-0 text-xs text-gray-500 pt-0.5">{p.year}</div>
                <div>
                  <p className="text-sm">{p.title}</p>
                  {p.description && p.description !== '<p></p>' && (
                    <div className="mt-2 text-xs text-gray-600 prose prose-sm max-w-none prose-p:my-1" dangerouslySetInnerHTML={{ __html: p.description }} />
                  )}
                </div>
              </div>
            )));
          case 'features':
            if (!features?.length) return null;
            return renderSection('features', 'Features', sortByDateDesc(features).map((f: any) => (
              <div key={f.id || f.title} className="flex gap-4">
                <div className="w-24 shrink-0 text-xs text-gray-500 pt-0.5">{f.year}</div>
                <div>
                  <p className="text-sm">{f.title}{f.location ? ` on ${f.location}` : ''}</p>
                  {f.description && f.description !== '<p></p>' && (
                    <div className="mt-2 text-xs text-gray-600 prose prose-sm max-w-none prose-p:my-1" dangerouslySetInnerHTML={{ __html: f.description }} />
                  )}
                </div>
              </div>
            )));
          case 'volunteering':
            if (!volunteering?.length) return null;
            return renderSection('volunteering', 'Exhibitions', sortByDateDesc(volunteering).map((v: any) => (
              <div key={v.id || v.organization} className="flex gap-4">
                <div className="w-24 shrink-0 text-xs text-gray-500 pt-0.5">{v.startYear} — {v.endYear}</div>
                <div>
                  <p className="text-sm">{v.role} at {v.organization}</p>
                  {v.location && <p className="text-xs text-gray-500 mt-0.5">{v.location}</p>}
                </div>
              </div>
            )));
          case 'speaking':
            if (!speaking?.length) return null;
            return renderSection('speaking', 'Speaking', sortByDateDesc(speaking).map((s: any) => (
              <div key={s.id || s.title} className="flex gap-4">
                <div className="w-24 shrink-0 text-xs text-gray-500 pt-0.5">{s.year}</div>
                <div>
                  <p className="text-sm">{s.title}{s.location ? ` at ${s.location}` : ''}</p>
                </div>
              </div>
            )));
          case 'education':
            if (!education?.length) return null;
            return renderSection('education', 'Education', sortByDateDesc(education).map((e: any) => (
              <div key={e.id || e.school} className="flex gap-4">
                <div className="w-24 shrink-0 text-xs text-gray-500 pt-0.5">{e.start} — {e.end}</div>
                <div>
                  <p className="text-sm">{e.degree} at {e.school}</p>
                  {e.location && <p className="text-xs text-gray-500 mt-0.5">{e.location}</p>}
                </div>
              </div>
            )));
          case 'skills':
            if (!skills?.length) return null;
            return renderSection('skills', 'Skills', (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill: string) => (
                  <span key={skill} className="text-sm text-gray-800">{skill}</span>
                ))}
              </div>
            ));
          case 'contact':
            if (!contacts?.length) return null;
            return renderSection('contact', 'Contact', (
              <div className="flex flex-col gap-3">
                {contacts.map((c: any) => (
                  <div key={c.id || c.link} className="flex gap-4 items-start">
                    <div className="w-24 shrink-0 text-sm text-gray-800 capitalize pt-0.5">
                      {c.platform}:
                    </div>
                    <div>
                      <a href={c.link.startsWith('http') ? c.link : `https://${c.link}`} className="text-sm text-black hover:underline">
                        {c.link}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ));
          default:
            return null;
        }
      })}
    </div>
  );
};
