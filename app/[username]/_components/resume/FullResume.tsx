import LoadingFallback from '@/components/common/LoadingFallback';
import { ResumeData } from '@/lib/server/dbActions';
import { sortByDateDesc } from '@/lib/resume';
import { Education } from './preview/Education';
import { Header } from './preview/Header';
import { Skills } from './preview/Skills';
import { Summary } from './preview/Summary';
import { WorkExperience } from './preview/WorkExperience';
import { SideProjects } from './preview/SideProjects';
import { Speaking } from './preview/Speaking';
import { Projects } from './preview/Projects';
import { Contact } from './preview/Contact';
import { Features } from './preview/Features';
import { Volunteering } from './preview/Volunteering';

const DEFAULT_ORDER = [
  'work',
  'side_projects',
  'speaking',
  'features',
  'projects',
  'skills',
  'education',
  'contact',
  'awards',
  'exhibitions',
];

export const FullResume = ({
  resume,
  profilePicture,
}: {
  resume?: ResumeData | null;
  profilePicture?: string;
}) => {
  if (!resume) {
    return <LoadingFallback message="Loading Resume..." />;
  }

  const order = (resume.sectionOrder || DEFAULT_ORDER).map((id) =>
    id === 'writing' ? 'features' : id === 'exhibitions' ? 'volunteering' : id,
  );

  return (
    <section
      className="mx-auto my-8 w-full max-w-xl space-y-8 bg-theme-bg px-6 md:px-4 print:space-y-4"
      aria-label="Resume Content"
    >
      <Header header={resume?.header} picture={profilePicture} />

      <div className="flex flex-col gap-6">
        <Summary summary={resume?.summary} />

        {order.map((sectionId) => {
          switch (sectionId) {
            case 'work':
              return (
                <WorkExperience
                  key={sectionId}
                  work={sortByDateDesc(resume?.workExperience)}
                />
              );
            case 'side_projects':
              return (
                <SideProjects
                  key={sectionId}
                  sideProjects={sortByDateDesc(resume?.sideProjects)}
                />
              );
            case 'speaking':
              return (
                <Speaking
                  key={sectionId}
                  speaking={sortByDateDesc(resume?.speaking)}
                />
              );
            case 'features':
              return (
                <Features
                  key={sectionId}
                  features={sortByDateDesc(resume?.features)}
                />
              );
            case 'volunteering':
              return (
                <Volunteering
                  key={sectionId}
                  volunteering={sortByDateDesc(resume?.volunteering)}
                />
              );
            case 'projects':
              return (
                <Projects
                  key={sectionId}
                  projects={sortByDateDesc(resume?.projects)}
                />
              );
            case 'education':
              return (
                <Education
                  key={sectionId}
                  educations={sortByDateDesc(resume?.education)}
                />
              );
            case 'contact':
              return <Contact key={sectionId} contacts={resume?.contacts} />;
            case 'skills':
              return <Skills key={sectionId} skills={resume?.header?.skills} />;
            default:
              return null; // For awards, exhibitions which are not implemented yet
          }
        })}
      </div>
    </section>
  );
};
