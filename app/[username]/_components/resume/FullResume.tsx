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
import { normalizeSectionOrder } from '@/lib/resume';

const SECTION_COMPONENTS: Record<string, React.FC<any>> = {
  work: WorkExperience,
  side_projects: SideProjects,
  speaking: Speaking,
  writing: Writing,
  exhibitions: Exhibitions,
  features: Features,
  volunteering: Volunteering,
  awards: Awards,
  certifications: Certifications,
  projects: Projects,
  education: Education,
  contact: Contact,
  skills: Skills,
};

export const FullResume = ({
  resume,
  profilePicture,
  isOwner,
  userProfile,
  hideSocialFeatures = false,
}: {
  resume: ResumeData;
  profilePicture?: string;
  isOwner?: boolean;
  userProfile?: UserProfile;
  hideSocialFeatures?: boolean;
}) => {
  const order = normalizeSectionOrder(resume.sectionOrder);

  const sortedWork = sortByDateDesc(resume.workExperience);
  const sortedSideProjects = sortByDateDesc(resume.sideProjects);
  const sortedSpeaking = sortByDateDesc(resume.speaking);
  const sortedWriting = sortByDateDesc(resume.writing);
  const sortedExhibitions = sortByDateDesc(resume.exhibitions);
  const sortedFeatures = sortByDateDesc(resume.features);
  const sortedVolunteering = sortByDateDesc(resume.volunteering);
  const sortedProjects = sortByDateDesc(resume.projects);
  const sortedEducation = sortByDateDesc(resume.education);
  const sortedAwards = sortByDateDesc(resume.awards);
  const sortedCertifications = sortByDateDesc(resume.certifications);

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

  const getSectionProps = (sectionId: string) => {
    switch (sectionId) {
      case 'work':
        return { work: sortedWork };
      case 'side_projects':
        return { sideProjects: sortedSideProjects };
      case 'speaking':
        return { speaking: sortedSpeaking };
      case 'writing':
        return { writing: sortedWriting };
      case 'exhibitions':
        return { exhibitions: sortedExhibitions };
      case 'features':
        return { features: sortedFeatures };
      case 'volunteering':
        return { volunteering: sortedVolunteering };
      case 'awards':
        return { awards: sortedAwards };
      case 'certifications':
        return { certifications: sortedCertifications };
      case 'projects':
        return { projects: sortedProjects };
      case 'education':
        return { educations: sortedEducation };
      case 'contact':
        return { contacts: resume?.contacts };
      case 'skills':
        return { skills: resume?.header?.skills };
      default:
        return {};
    }
  };

  return (
    <section
      className="mx-auto my-8 w-full max-w-[540px] space-y-8 bg-theme-bg px-6 sm:px-0 print:space-y-4"
      aria-label="Resume Content"
    >
      <Header
        header={resume.header}
        picture={profilePicture}
        isOwner={isOwner}
        userProfile={userProfile}
        hideSocialFeatures={hideSocialFeatures}
      />

      <div className="flex flex-col gap-6">
        <Summary summary={resume.summary} />

        {isOwner && isEmptyProfile && <EmptyProfileState />}

        {order.map((sectionId) => {
          const Component = SECTION_COMPONENTS[sectionId];
          if (!Component) return null;
          return <Component key={sectionId} {...getSectionProps(sectionId)} />;
        })}
      </div>
    </section>
  );
};
