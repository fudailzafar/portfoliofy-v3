'use client';

import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { PublicEmptyProfileState } from './preview/PublicEmptyProfileState';
import { PublicWritingList } from './preview/PublicWritingList';
import { normalizeSectionOrder } from '@/lib/resume';
import { ResumePagesProvider } from '@/lib/ResumePagesContext';

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
  username,
  hideSocialFeatures = false,
  isPersonalDomainView = false,
}: {
  resume: ResumeData;
  profilePicture?: string;
  isOwner?: boolean;
  userProfile?: UserProfile;
  username: string;
  hideSocialFeatures?: boolean;
  isPersonalDomainView?: boolean;
}) => {
  const [activeTab, setActiveTab] = useState<'about' | 'writing'>('about');
  const order = normalizeSectionOrder(resume.sectionOrder);

  const tabBarRef = useRef<HTMLDivElement>(null);
  const pendingScrollAnchorRef = useRef<number | null>(null);

  const handleTabChange = (tab: 'about' | 'writing') => {
    if (tabBarRef.current) {
      pendingScrollAnchorRef.current =
        tabBarRef.current.getBoundingClientRect().top;
    }
    setActiveTab(tab);
  };

  // Re-pins the tab bar to wherever it was on screen right before the
  // switch, undoing any scroll clamp caused by the content height changing.
  // Called from two places: immediately on the state change (useLayoutEffect
  // below), and again from AnimatePresence's onExitComplete — the fade-out
  // keeps the old (tall) content in the DOM for the duration of the exit
  // animation, so the actual height/scroll-clamp doesn't happen until it's
  // removed, well after the state change and the first correction already
  // ran. Doesn't clear the pending ref itself so both call sites can use it.
  const correctScrollAnchor = useCallback(() => {
    if (pendingScrollAnchorRef.current === null || !tabBarRef.current) return;
    const newTop = tabBarRef.current.getBoundingClientRect().top;
    const delta = newTop - pendingScrollAnchorRef.current;
    if (delta !== 0) {
      window.scrollBy(0, delta);
    }
  }, []);

  useLayoutEffect(() => {
    correctScrollAnchor();
  }, [activeTab, correctScrollAnchor]);

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

  const isWritingEnabled =
    resume.preferences?.writingEnabled !== false &&
    (resume.pages || []).some((p) => !p.hidden);

  // Same emptiness check as Summary.tsx itself — kept in sync here so the
  // tab bar's own visibility decision matches what Summary would actually
  // render, without duplicating that component's render logic.
  const hasSummary = !(
    !resume.summary ||
    resume.summary === '' ||
    resume.summary === '<p></p>'
  );

  // If writing gets disabled (or its last published page is removed) while
  // the writing tab is selected, its button disappears from the row below —
  // fall back to About rather than leaving the user stuck on a tab with no
  // way back to it.
  useEffect(() => {
    if (!isWritingEnabled && activeTab === 'writing') {
      setActiveTab('about');
    }
  }, [isWritingEnabled, activeTab]);

  return (
    <ResumePagesProvider pages={resume.pages || []}>
      <section
        className="mx-auto my-8 w-full max-w-[540px] space-y-8 bg-theme-bg px-4 min-[481px]:px-12 min-[637px]:px-0 print:space-y-4"
        aria-label="Resume Content"
      >
        <Header
          header={resume.header}
          picture={profilePicture}
          isOwner={isOwner}
          userProfile={userProfile}
          hideSocialFeatures={hideSocialFeatures}
        />

        {isWritingEnabled ? (
          <div
            ref={tabBarRef}
            className="flex w-full items-center gap-6 pt-2 print:hidden"
          >
            <button
              onClick={() => handleTabChange('about')}
              className={`relative pb-1 text-sm transition-all ${
                activeTab === 'about'
                  ? 'text-theme-primary'
                  : 'text-theme-muted'
              }`}
            >
              About
              {activeTab === 'about' && (
                <motion.div
                  layoutId="publicProfileTabIndicator"
                  className="absolute -bottom-[1px] left-0 right-0 h-[1.5px] bg-theme-primary"
                />
              )}
            </button>
            <button
              onClick={() => handleTabChange('writing')}
              className={`relative pb-1 text-sm transition-all ${
                activeTab === 'writing'
                  ? 'text-theme-primary'
                  : 'text-theme-muted'
              }`}
            >
              Writing
              {activeTab === 'writing' && (
                <motion.div
                  layoutId="publicProfileTabIndicator"
                  className="absolute -bottom-[1px] left-0 right-0 h-[1.5px] bg-theme-primary"
                />
              )}
            </button>
          </div>
        ) : hasSummary ? (
          <div className="flex w-full items-center gap-6 pt-2 print:hidden">
            <span className="pb-1 text-sm text-theme-primary">About</span>
          </div>
        ) : null}

        <AnimatePresence
          mode="wait"
          onExitComplete={() => {
            correctScrollAnchor();
            pendingScrollAnchorRef.current = null;
          }}
        >
          {activeTab === 'about' ? (
            <motion.div
              key="about"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-6"
            >
              <Summary summary={resume.summary} />

              {isOwner && isEmptyProfile && <EmptyProfileState />}
              {!isOwner && isEmptyProfile && (
                <PublicEmptyProfileState name={resume.header.name} />
              )}

              {order.map((sectionId) => {
                const Component = SECTION_COMPONENTS[sectionId];
                if (!Component) return null;
                return (
                  <Component key={sectionId} {...getSectionProps(sectionId)} />
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="writing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <PublicWritingList
                resume={resume}
                username={username}
                isPersonalDomainView={isPersonalDomainView}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </ResumePagesProvider>
  );
};
