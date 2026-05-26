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

  return (
    <section
      className="mx-auto w-full max-w-2xl space-y-8 bg-white print:space-y-4 my-8 px-4"
      aria-label="Resume Content"
    >
      <Header header={resume?.header} picture={profilePicture} />

      <div className="flex flex-col gap-6">
        <Summary summary={resume?.summary} />

        <WorkExperience work={resume?.workExperience} />

        <SideProjects sideProjects={resume?.sideProjects} />

        <Speaking speaking={resume?.speaking} />

        <Projects projects={resume?.projects} />

        <Education educations={resume.education} />

        <Contact contacts={resume.contacts} />

        <Skills skills={resume.header.skills} />
      </div>
    </section>
  );
};
