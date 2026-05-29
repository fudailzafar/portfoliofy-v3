import LoadingFallback from '../LoadingFallback';
import { ResumeData } from '../../lib/server/redisActions';
import { Education } from './Education';
import { Header } from './Header';
import { Skills } from './Skills';
import { Summary } from './Summary';
import { WorkExperience } from './WorkExperience';
import { SideProjects } from './SideProjects';
import { Speaking } from './Speaking';
import { Projects } from './Projects';
import { Contact } from './Contact';
import { Features } from './Features';
import { Volunteering } from './Volunteering';

const DEFAULT_ORDER = ['work', 'side_projects', 'speaking', 'features', 'projects', 'skills', 'education', 'contact', 'awards', 'exhibitions'];

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

  const order = (resume.sectionOrder || DEFAULT_ORDER).map(id => id === 'writing' ? 'features' : id === 'exhibitions' ? 'volunteering' : id);

  return (
    <section
      className="mx-auto w-full max-w-2xl space-y-8 bg-theme-bg print:space-y-4 my-8 px-4"
      aria-label="Resume Content"
    >
      <Header header={resume?.header} picture={profilePicture} />

      <div className="flex flex-col gap-6">
        <Summary summary={resume?.summary} />

        {order.map((sectionId) => {
          switch (sectionId) {
            case 'work':
              return <WorkExperience key={sectionId} work={resume?.workExperience} />;
            case 'side_projects':
              return <SideProjects key={sectionId} sideProjects={resume?.sideProjects} />;
            case 'speaking':
              return <Speaking key={sectionId} speaking={resume?.speaking} />;
            case 'features':
              return <Features key={sectionId} features={resume?.features} />;
            case 'volunteering':
              return <Volunteering key={sectionId} volunteering={resume?.volunteering} />;
            case 'projects':
              return <Projects key={sectionId} projects={resume?.projects} />;
            case 'education':
              return <Education key={sectionId} educations={resume?.education} />;
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
