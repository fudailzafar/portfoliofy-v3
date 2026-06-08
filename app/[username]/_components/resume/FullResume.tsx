import { useMemo } from 'react';
import LoadingFallback from '@/components/common/LoadingFallback';
import { ResumeData } from '@/lib/server/dbActions';
import { UserProfile } from '@/lib/server/cachedFunctions';
import { sortByDateDesc } from '@/lib/resume';
import { Education } from './preview/Education';
import { Header } from './preview/Header';
import { Awards } from './preview/Awards';
import { Certifications } from './preview/Certifications';
import { Skills } from './preview/Skills';
import { Summary } from './preview/Summary';
import { WorkExperience } from './preview/WorkExperience';
import { SideProjects } from './preview/SideProjects';
import { Speaking } from './preview/Speaking';
import { Projects } from './preview/Projects';
import { Contact } from './preview/Contact';
import { Features } from './preview/Features';
import { Volunteering } from './preview/Volunteering';
import { DEFAULT_SECTION_ORDER, normalizeSectionOrder } from '@/lib/resume';

export const FullResume = ({
  resume,
  profilePicture,
  isOwner,
  userProfile,
}: {
  resume?: ResumeData | null;
  profilePicture?: string;
  isOwner?: boolean;
  userProfile?: UserProfile;
}) => {
  const order = useMemo(
    () => normalizeSectionOrder(resume?.sectionOrder),
    [resume?.sectionOrder],
  );

  const sortedWork = useMemo(
    () => sortByDateDesc(resume?.workExperience),
    [resume?.workExperience],
  );
  const sortedSideProjects = useMemo(
    () => sortByDateDesc(resume?.sideProjects),
    [resume?.sideProjects],
  );
  const sortedSpeaking = useMemo(
    () => sortByDateDesc(resume?.speaking),
    [resume?.speaking],
  );
  const sortedFeatures = useMemo(
    () => sortByDateDesc(resume?.features),
    [resume?.features],
  );
  const sortedVolunteering = useMemo(
    () => sortByDateDesc(resume?.volunteering),
    [resume?.volunteering],
  );
  const sortedProjects = useMemo(
    () => sortByDateDesc(resume?.projects),
    [resume?.projects],
  );
  const sortedEducation = useMemo(
    () => sortByDateDesc(resume?.education),
    [resume?.education],
  );
  const sortedAwards = useMemo(
    () => sortByDateDesc(resume?.awards),
    [resume?.awards],
  );

  const sortedCertifications = useMemo(
    () => sortByDateDesc(resume?.certifications),
    [resume?.certifications],
  );

  if (!resume) {
    return <LoadingFallback message="Loading Resume..." />;
  }

  return (
    <section
      className="mx-auto my-8 w-full max-w-xl space-y-8 bg-theme-bg px-6 md:px-4 print:space-y-4"
      aria-label="Resume Content"
    >
      <Header
        header={resume?.header}
        picture={profilePicture}
        isOwner={isOwner}
        userProfile={userProfile}
      />

      <div className="flex flex-col gap-6">
        <Summary summary={resume?.summary} />

        {order.map((sectionId) => {
          switch (sectionId) {
            case 'work':
              return <WorkExperience key={sectionId} work={sortedWork} />;
            case 'side_projects':
              return (
                <SideProjects
                  key={sectionId}
                  sideProjects={sortedSideProjects}
                />
              );
            case 'speaking':
              return <Speaking key={sectionId} speaking={sortedSpeaking} />;
            case 'features':
              return <Features key={sectionId} features={sortedFeatures} />;
            case 'volunteering':
              return (
                <Volunteering
                  key={sectionId}
                  volunteering={sortedVolunteering}
                />
              );
            case 'awards':
              return <Awards key={sectionId} awards={sortedAwards} />;
            case 'certifications':
              return <Certifications key={sectionId} certifications={sortedCertifications} />;
            case 'projects':
              return <Projects key={sectionId} projects={sortedProjects} />;
            case 'education':
              return <Education key={sectionId} educations={sortedEducation} />;
            case 'contact':
              return <Contact key={sectionId} contacts={resume?.contacts} />;
            case 'skills':
              return <Skills key={sectionId} skills={resume?.header?.skills} />;
            default:
              return null;
          }
        })}
      </div>
    </section>
  );
};
