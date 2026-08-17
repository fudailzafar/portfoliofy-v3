import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  GeneralTab,
  SkillsTab,
  ProjectsTab,
  SideProjectsTab,
  WorkExperienceTab,
  EducationTab,
  VolunteeringTab,
  SpeakingTab,
  FeaturesTab,
  ContactsTab,
  PersonalDomainTab,
  InsightsTab,
  PrintTab,
  SettingsTab,
  AwardsTab,
  CertificationsTab,
  WritingTab,
  ExhibitionsTab,
} from './tabs';
import { ImportDataTab } from './ImportDataTab';

interface ProfileContentProps {
  activeTab: string;
  showMobileMenu: boolean;
  setShowMobileMenu: (show: boolean) => void;
  username: string;
  localPicture?: string;
  isUploadingPicture: boolean;
  isEditingTab: boolean;
  isSaving: boolean;
  isValidUname: boolean;
  checkUsernameMutationIsPending: boolean;
  isValidUsername: boolean;
  years: number[];
  setProjectToDelete: (type: any) => (id: string) => void;
  handlePictureUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => Promise<void>;
  removePicture: () => Promise<void>;
  onSave: () => Promise<void>;
  onDeleteAccount: () => void;
  setShowDeleteAccountWarning: (show: boolean) => void;
}

const TAB_TITLES: Record<string, string> = {
  general: 'Personal Domain',
  insights: 'Insights',
  workExperience: 'Work Experience',
  education: 'Education',
  projects: 'Projects',
  sideProjects: 'Side Projects',
  speaking: 'Speaking',
  writing_published: 'Writing',
  writing_drafts: 'Writing',
  exhibitions: 'Exhibitions',
  features: 'Features',
  volunteering: 'Volunteering',
  awards: 'Awards',
  certifications: 'Certifications',
  contacts: 'Contacts',
  settings: 'Settings',
};

export function ProfileContent({
  activeTab,
  showMobileMenu,
  setShowMobileMenu,
  username,
  localPicture,
  isUploadingPicture,
  isEditingTab,
  isSaving,
  isValidUname,
  checkUsernameMutationIsPending,
  isValidUsername,
  years,
  setProjectToDelete,
  handlePictureUpload,
  removePicture,
  onSave,
  onDeleteAccount,
  setShowDeleteAccountWarning,
}: ProfileContentProps) {
  return (
    <div
      className={cn(
        'relative h-full min-w-0 flex-1 flex-col bg-surface-1',
        !showMobileMenu ? 'flex' : 'hidden sm:flex',
      )}
    >
      <div
        className={cn(
          'scrollbar-hide w-full min-w-0 flex-1 overflow-y-auto p-4 sm:p-8 md:p-12',
          isEditingTab && 'pb-24 sm:pb-28 md:pb-32',
        )}
      >
        <div className="mb-6 flex items-center sm:hidden">
          <button
            onClick={() => setShowMobileMenu(true)}
            className="flex items-center text-sm font-medium text-content-primary hover:text-content-secondary"
          >
            <svg
              className="mr-1 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        {activeTab === 'general' && (
          <GeneralTab
            initialUsername={username}
            localPicture={localPicture}
            isUploadingPicture={isUploadingPicture}
            handlePictureUpload={handlePictureUpload}
            removePicture={removePicture}
            isValidUsername={isValidUsername}
            isCheckingUsername={checkUsernameMutationIsPending}
          />
        )}
        {activeTab === 'skills' && <SkillsTab />}
        {activeTab === 'projects' && (
          <ProjectsTab
            years={years}
            setProjectToDelete={setProjectToDelete('project')}
          />
        )}
        {activeTab === 'side_projects' && (
          <SideProjectsTab
            years={years}
            setProjectToDelete={setProjectToDelete('sideProject')}
          />
        )}
        {activeTab === 'work' && (
          <WorkExperienceTab
            years={years}
            setProjectToDelete={setProjectToDelete('work')}
          />
        )}
        {activeTab === 'education' && (
          <EducationTab
            years={years}
            setProjectToDelete={setProjectToDelete('education')}
          />
        )}
        {activeTab === 'volunteering' && (
          <VolunteeringTab
            years={years}
            setProjectToDelete={setProjectToDelete('volunteering')}
          />
        )}
        {activeTab === 'speaking' && (
          <SpeakingTab
            years={years}
            setProjectToDelete={setProjectToDelete('speaking')}
          />
        )}
        {activeTab === 'features' && (
          <FeaturesTab
            years={years}
            setProjectToDelete={setProjectToDelete('feature')}
          />
        )}
        {activeTab === 'certifications' && (
          <CertificationsTab
            years={years}
            setProjectToDelete={setProjectToDelete('certification')}
          />
        )}
        {activeTab === 'writing' && (
          <WritingTab
            years={years}
            setProjectToDelete={setProjectToDelete('writing')}
          />
        )}
        {activeTab === 'exhibitions' && (
          <ExhibitionsTab
            years={years}
            setProjectToDelete={setProjectToDelete('exhibitions')}
          />
        )}
        {activeTab === 'awards' && (
          <AwardsTab
            years={years}
            setProjectToDelete={setProjectToDelete('award')}
          />
        )}
        {activeTab === 'contact' && (
          <ContactsTab setProjectToDelete={setProjectToDelete('contact')} />
        )}
        {activeTab === 'print' && <PrintTab />}
        {activeTab === 'personal_domain' && (
          <PersonalDomainTab username={username} />
        )}
        {activeTab === 'insights' && <InsightsTab />}
        {activeTab === 'settings' && (
          <SettingsTab
            onDeleteAccount={() => setShowDeleteAccountWarning(true)}
          />
        )}
        {activeTab === 'import_data' && <ImportDataTab />}
      </div>

      {/* Bottom action bar */}
      {!isEditingTab && (
        <div className="flex-none bg-surface-1 px-4 pb-4 sm:px-8 md:px-12 md:pb-6">
          <div className="flex w-full justify-end gap-3 border-t border-border-subtle pt-4">
            {activeTab === 'print' ? (
              <Button
                onClick={() => window.print()}
                variant="outline"
                className="h-9 rounded-md border border-border-strong bg-surface-card px-6 font-medium text-content-primary shadow-sm"
              >
                Print
              </Button>
            ) : (
              <Button
                onClick={onSave}
                disabled={
                  isSaving || !isValidUname || checkUsernameMutationIsPending
                }
                variant="outline"
                className="h-9 rounded-md border border-border-strong bg-surface-card px-6 font-medium text-content-primary shadow-sm"
              >
                {isSaving ? 'Saving…' : 'Save'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
