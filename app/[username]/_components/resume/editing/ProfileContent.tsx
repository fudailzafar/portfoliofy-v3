import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { useResumeStore } from '@/store/useResumeStore';
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
  onCancel: () => void;
  onDone: () => void;
  isClosing: boolean;
  onConfirmDeleteAccount: () => void;
  isDeletingAccount: boolean;
  createdAt?: Date | null;
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
  isSaving,
  isValidUname,
  checkUsernameMutationIsPending,
  isValidUsername,
  years,
  setProjectToDelete,
  handlePictureUpload,
  removePicture,
  onSave,
  onCancel,
  onDone,
  isClosing,
  onConfirmDeleteAccount,
  isDeletingAccount,
  createdAt,
}: ProfileContentProps) {
  const hasUnsavedChanges = useResumeStore((state) => state.hasUnsavedChanges);
  const activeFormValid = useResumeStore((state) => state.activeFormValid);
  // Whether a list-tab form (Work Experience, Awards, etc.) is currently
  // open — while it is, the bottom bar shows that form's own Cancel/Save
  // pair instead of the resume-wide one, per the "chevron-back is gone,
  // Cancel does that job now" flow.
  const isEditingTab = useResumeStore((state) => state.isEditingTab);
  const activeFormDirty = useResumeStore((state) => state.activeFormDirty);
  const activeFormCancel = useResumeStore((state) => state.activeFormCancel);
  // Bumped by the global Cancel button — used as a remount key on each list
  // tab so an in-progress add/edit form (and its local draft) is dropped
  // along with the rest of the discarded changes.
  const saveTrigger = useResumeStore((state) => state.saveTrigger);

  return (
    <div
      className={cn(
        'relative h-full min-w-0 flex-1 flex-col bg-surface-1',
        !showMobileMenu ? 'flex' : 'hidden sm:flex',
      )}
    >
      <div className="scrollbar-hide w-full min-w-0 flex-1 overflow-y-auto p-4 sm:p-8 md:p-12">
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
            key={saveTrigger}
            years={years}
            setProjectToDelete={setProjectToDelete('project')}
          />
        )}
        {activeTab === 'side_projects' && (
          <SideProjectsTab
            key={saveTrigger}
            years={years}
            setProjectToDelete={setProjectToDelete('sideProject')}
          />
        )}
        {activeTab === 'work' && (
          <WorkExperienceTab
            key={saveTrigger}
            years={years}
            setProjectToDelete={setProjectToDelete('work')}
          />
        )}
        {activeTab === 'education' && (
          <EducationTab
            key={saveTrigger}
            years={years}
            setProjectToDelete={setProjectToDelete('education')}
          />
        )}
        {activeTab === 'volunteering' && (
          <VolunteeringTab
            key={saveTrigger}
            years={years}
            setProjectToDelete={setProjectToDelete('volunteering')}
          />
        )}
        {activeTab === 'speaking' && (
          <SpeakingTab
            key={saveTrigger}
            years={years}
            setProjectToDelete={setProjectToDelete('speaking')}
          />
        )}
        {activeTab === 'features' && (
          <FeaturesTab
            key={saveTrigger}
            years={years}
            setProjectToDelete={setProjectToDelete('feature')}
          />
        )}
        {activeTab === 'certifications' && (
          <CertificationsTab
            key={saveTrigger}
            years={years}
            setProjectToDelete={setProjectToDelete('certification')}
          />
        )}
        {activeTab === 'writing' && (
          <WritingTab
            key={saveTrigger}
            years={years}
            setProjectToDelete={setProjectToDelete('writing')}
          />
        )}
        {activeTab === 'exhibitions' && (
          <ExhibitionsTab
            key={saveTrigger}
            years={years}
            setProjectToDelete={setProjectToDelete('exhibitions')}
          />
        )}
        {activeTab === 'awards' && (
          <AwardsTab
            key={saveTrigger}
            years={years}
            setProjectToDelete={setProjectToDelete('award')}
          />
        )}
        {activeTab === 'contact' && (
          <ContactsTab
            key={saveTrigger}
            setProjectToDelete={setProjectToDelete('contact')}
          />
        )}
        {activeTab === 'print' && <PrintTab />}
        {activeTab === 'personal_domain' && (
          <PersonalDomainTab username={username} />
        )}
        {activeTab === 'insights' && <InsightsTab />}
        {activeTab === 'settings' && (
          <SettingsTab
            username={username}
            onConfirmDelete={onConfirmDeleteAccount}
            isDeletingAccount={isDeletingAccount}
            createdAt={createdAt}
          />
        )}
        {activeTab === 'import_data' && <ImportDataTab />}
      </div>

      {/* Bottom action bar — one global Cancel/Save (or Done, when nothing's
          changed) instead of a separate pair inside every tab's own form.
          The print tab is a standalone action screen, not part of the save
          flow, so it only ever shows its own Print button. */}
      <div className="flex-none bg-surface-1 px-4 pb-4 sm:px-8 md:px-12 md:pb-6">
        <div className="flex w-full items-center justify-end gap-3 border-t border-border-subtle pt-4">
          {activeTab === 'print' ? (
            <button
              onClick={() => window.print()}
              className="h-9 rounded-md border border-border-strong bg-surface-1 px-6 text-[14px] font-medium text-content-primary shadow-sm transition-all active:bg-surface-2 dark:border-none dark:bg-border-subtle dark:active:bg-border-strong"
            >
              Print
            </button>
          ) : isEditingTab ? (
            <>
              <button
                onClick={() => activeFormCancel?.()}
                disabled={isSaving}
                className="px-4 text-[14px] font-medium text-content-primary hover:underline hover:underline-offset-4 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={
                  isSaving ||
                  !isValidUname ||
                  checkUsernameMutationIsPending ||
                  !activeFormValid ||
                  !activeFormDirty
                }
                className="h-9 rounded-md border border-border-strong bg-surface-1 px-6 text-[14px] font-medium text-content-primary shadow-sm transition-all active:bg-surface-2 disabled:opacity-50 dark:border-none dark:bg-border-subtle dark:active:bg-border-strong"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <Spinner size={14} className="text-content-primary" />
                  </div>
                ) : (
                  'Save'
                )}
              </button>
            </>
          ) : hasUnsavedChanges ? (
            <>
              <button
                onClick={onCancel}
                disabled={isSaving}
                className="px-4 text-[14px] font-medium text-content-primary hover:underline hover:underline-offset-4 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={
                  isSaving ||
                  !isValidUname ||
                  checkUsernameMutationIsPending ||
                  !activeFormValid
                }
                className="h-9 rounded-md border border-border-strong bg-surface-1 px-6 text-[14px] font-medium text-content-primary shadow-sm transition-all active:bg-surface-2 dark:border-none dark:bg-border-subtle dark:active:bg-border-strong"
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <Spinner size={14} className="text-content-primary" />
                  </div>
                ) : (
                  'Save'
                )}
              </button>
            </>
          ) : (
            <button
              onClick={onDone}
              disabled={isClosing}
              className="h-9 rounded-md border border-border-strong bg-surface-1 px-6 text-[14px] font-medium text-content-primary shadow-sm transition-all active:bg-surface-2 disabled:opacity-80 dark:border-none dark:bg-border-subtle dark:active:bg-border-strong"
            >
              {isClosing ? (
                <div className="flex items-center gap-2">
                  <Spinner size={14} className="text-content-primary" />
                </div>
              ) : (
                'Done'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
