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
  PrintTab,
  SettingsTab,
  AwardsTab,
  CertificationsTab,
} from './tabs';

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
        'relative h-full flex-1 flex-col bg-surface-1',
        !showMobileMenu ? 'flex' : 'hidden sm:flex',
      )}
    >
      <div className="scrollbar-hide flex-1 overflow-y-auto p-4 sm:p-8 md:p-12">
        <div className="mb-6 flex items-center sm:hidden">
          <button
            onClick={() => setShowMobileMenu(true)}
            className="flex items-center text-sm font-medium text-content-secondary hover:text-content-primary"
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
            Back to Menu
          </button>
        </div>

        {activeTab === 'general' && (
          <GeneralTab
            initialUsername={username}
            localPicture={localPicture}
            isUploadingPicture={isUploadingPicture}
            handlePictureUpload={handlePictureUpload}
            removePicture={removePicture}
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
        {activeTab === 'settings' && (
          <SettingsTab
            onDeleteAccount={() => setShowDeleteAccountWarning(true)}
          />
        )}
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
                {isSaving ? 'Saving…' : 'Done'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
