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
import { Writing } from './preview/Writing';
import { Exhibitions } from './preview/Exhibitions';
import { Projects } from './preview/Projects';
import { Contact } from './preview/Contact';
import { Features } from './preview/Features';
import { Volunteering } from './preview/Volunteering';
import { EmptyProfileState } from './preview/EmptyProfileState';
import { DEFAULT_SECTION_ORDER, normalizeSectionOrder } from '@/lib/resume';

export const FullResume = ({
  resume,
  profilePicture,
  isOwner,
  userProfile,
}: {
  resume: ResumeData;
  profilePicture?: string;
  isOwner?: boolean;
  userProfile?: UserProfile;
}) => {
  const order = useMemo(
    () => normalizeSectionOrder(resume.sectionOrder),
    [resume.sectionOrder],
  );

  const sortedWork = useMemo(
    () => sortByDateDesc(resume.workExperience),
    [resume.workExperience],
  );
  const sortedSideProjects = useMemo(
    () => sortByDateDesc(resume.sideProjects),
    [resume.sideProjects],
  );
  const sortedSpeaking = useMemo(
    () => sortByDateDesc(resume.speaking),
    [resume.speaking],
  );
  const sortedWriting = useMemo(
    () => sortByDateDesc(resume.writing),
    [resume.writing],
  );
  const sortedExhibitions = useMemo(
    () => sortByDateDesc(resume.exhibitions),
    [resume.exhibitions],
  );
  const sortedFeatures = useMemo(
    () => sortByDateDesc(resume.features),
    [resume.features],
  );
  const sortedVolunteering = useMemo(
    () => sortByDateDesc(resume.volunteering),
    [resume.volunteering],
  );
  const sortedProjects = useMemo(
    () => sortByDateDesc(resume.projects),
    [resume.projects],
  );
  const sortedEducation = useMemo(
    () => sortByDateDesc(resume.education),
    [resume.education],
  );
  const sortedAwards = useMemo(
    () => sortByDateDesc(resume.awards),
    [resume.awards],
  );

  const sortedCertifications = useMemo(
    () => sortByDateDesc(resume.certifications),
    [resume.certifications],
  );

  // TEMPORARY OVERRIDE FOR TESTING: Change this to `true` to see the empty state always
  const isEmptyProfile =
    (!resume.summary || resume.summary.trim() === '') &&
    resume.workExperience.length === 0 &&
    resume.sideProjects.length === 0 &&
    resume.projects.length === 0 &&
    (!resume.header?.skills || resume.header.skills.length === 0) &&
    resume.education.length === 0 &&
    resume.volunteering.length === 0 &&
    resume.speaking.length === 0 &&
    resume.features.length === 0 &&
    resume.awards.length === 0 &&
    resume.certifications.length === 0 &&
    (!resume.contacts || resume.contacts.length === 0);

  return (
    <section
      className="mx-auto my-8 w-full max-w-xl space-y-8 bg-theme-bg px-6 md:px-4 print:space-y-4"
      aria-label="Resume Content"
    >
      <Header
        header={resume.header}
        picture={profilePicture}
        isOwner={isOwner}
        userProfile={userProfile}
      />

      <div className="flex flex-col gap-6">
        <Summary summary={resume.summary} />

        {isOwner && isEmptyProfile && <EmptyProfileState />}

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
            case 'writing':
              return <Writing key={sectionId} writing={sortedWriting} />;
            case 'exhibitions':
              return <Exhibitions key={sectionId} exhibitions={sortedExhibitions} />;
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
              return (
                <Certifications
                  key={sectionId}
                  certifications={sortedCertifications}
                />
              );
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
