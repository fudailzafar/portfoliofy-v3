'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
} from './tabs';
import { SortableSidebarItem } from './SortableSidebarItem';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { ResumeData } from '@/lib/server/redisActions';
import { useUserActions } from '@/hooks/useUserActions';
import { useS3Upload } from 'next-s3-upload';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ---------------------------------------------------------------------------
// Constants — hoisted outside the component so they are never reallocated
// ---------------------------------------------------------------------------

const DEFAULT_SECTION_ORDER = [
  'work',
  'side_projects',
  'speaking',
  'projects',
  'skills',
  'education',
  'contact',
  'awards',
  'volunteering',
  'features',
];

const TAB_DEFINITIONS: Record<string, { label: string; disabled: boolean }> = {
  work:         { label: 'Work Experience', disabled: false },
  side_projects:{ label: 'Side Projects',   disabled: false },
  speaking:     { label: 'Speaking',        disabled: false },
  projects:     { label: 'Projects',        disabled: false },
  skills:       { label: 'Skills',          disabled: false },
  education:    { label: 'Education',       disabled: false },
  contact:      { label: 'Contact',         disabled: false },
  awards:       { label: 'Awards',          disabled: true  },
  volunteering: { label: 'Volunteering',    disabled: false },
  features:     { label: 'Features',        disabled: false },
};

type DeleteTarget =
  | { type: 'project';     id: string }
  | { type: 'sideProject'; id: string }
  | { type: 'speaking';    id: string }
  | { type: 'volunteering';id: string }
  | { type: 'feature';     id: string }
  | { type: 'education';   id: string }
  | { type: 'work';        id: string }
  | { type: 'contact';     id: string };

const DELETE_DESCRIPTIONS: Record<DeleteTarget['type'], string> = {
  project:      'This will permanently delete this project. This action cannot be undone.',
  sideProject:  'This will permanently delete this side project. This action cannot be undone.',
  speaking:     'This will permanently delete this speaking engagement. This action cannot be undone.',
  work:         'This will permanently delete this work experience. This action cannot be undone.',
  contact:      'This will permanently delete this contact. This action cannot be undone.',
  volunteering: 'This will permanently delete this volunteering entry. This action cannot be undone.',
  feature:      'This will permanently delete this feature. This action cannot be undone.',
  education:    'This will permanently delete this education entry. This action cannot be undone.',
};

// ---------------------------------------------------------------------------

export function EditProfileDialog({
  resume,
  username,
  picture,
}: {
  resume: ResumeData;
  username: string;
  picture?: string;
}) {
  const {
    uname,
    activeTab,
    setActiveTab,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    initResume,
    isEditingTab,
  } = useResumeStore();

  useEffect(() => {
    initResume(resume, username);
  }, [resume, username, initResume]);

  const [open, setOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [localPicture, setLocalPicture] = useState<string | undefined>(picture);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<DeleteTarget | null>(null);
  const [showDeleteAccountWarning, setShowDeleteAccountWarning] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialUsername = uname === username;

  const { saveResumeDataMutation, updateUsernameMutation, checkUsernameMutation } =
    useUserActions();

  const isValidUname =
    /^[a-zA-Z0-9-]+$/.test(uname) &&
    uname.length > 0 &&
    ((isInitialUsername || checkUsernameMutation.data?.available) ?? false);

  // Username availability debounce — lives here only; GeneralTab renders the input
  useEffect(() => {
    if (!isInitialUsername && uname) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        checkUsernameMutation.mutateAsync(uname);
      }, 500);
    }
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [uname, isInitialUsername, checkUsernameMutation.mutateAsync]);

  // Section order — normalise legacy ids on first load only
  const [sectionOrder, setSectionOrder] = useState<string[]>(() =>
    (resume.sectionOrder || DEFAULT_SECTION_ORDER).map((id) =>
      id === 'writing' ? 'features' : id === 'exhibitions' ? 'volunteering' : id,
    ),
  );

  // Years list — stable; only computed once
  const years = useMemo(() => {
    const current = new Date().getFullYear();
    // Start from current year and go down to 1980
    return Array.from({ length: current - 1980 + 1 }, (_, i) => current - i);
  }, []);

  const { uploadToS3 } = useS3Upload();
  const router = useRouter();

  // ---------------------------------------------------------------------------
  // Stable delete setters — prevent inline arrow re-creation on every render
  // ---------------------------------------------------------------------------
  const makeDeleteSetter = useCallback(
    (type: DeleteTarget['type']) =>
      (id: string) =>
        setPendingDelete({ type, id }),
    [],
  );

  const setDeleteProject     = useMemo(() => makeDeleteSetter('project'),     [makeDeleteSetter]);
  const setDeleteSideProject = useMemo(() => makeDeleteSetter('sideProject'), [makeDeleteSetter]);
  const setDeleteSpeaking    = useMemo(() => makeDeleteSetter('speaking'),    [makeDeleteSetter]);
  const setDeleteWork        = useMemo(() => makeDeleteSetter('work'),        [makeDeleteSetter]);
  const setDeleteEducation   = useMemo(() => makeDeleteSetter('education'),   [makeDeleteSetter]);
  const setDeleteVolunteering= useMemo(() => makeDeleteSetter('volunteering'),[makeDeleteSetter]);
  const setDeleteFeature     = useMemo(() => makeDeleteSetter('feature'),     [makeDeleteSetter]);
  const setDeleteContact     = useMemo(() => makeDeleteSetter('contact'),     [makeDeleteSetter]);

  // ---------------------------------------------------------------------------
  // Delete handlers — stable; reads store at call-time so no stale closure
  // ---------------------------------------------------------------------------
  const DELETE_HANDLERS = useMemo<Record<DeleteTarget['type'], (id: string) => void>>(
    () => ({
      project: (id) => {
        const s = useResumeStore.getState();
        s.updateResume({ projects: s.resume?.projects?.filter((p: any) => p.id !== id) });
      },
      sideProject: (id) => {
        const s = useResumeStore.getState();
        s.updateResume({ sideProjects: s.resume?.sideProjects?.filter((p: any) => p.id !== id) });
      },
      speaking: (id) => {
        const s = useResumeStore.getState();
        s.updateResume({ speaking: s.resume?.speaking?.filter((p: any) => p.id !== id) });
      },
      work: (id) => {
        const s = useResumeStore.getState();
        s.updateResume({ workExperience: s.resume?.workExperience?.filter((p: any) => p.id !== id) });
      },
      contact: (id) => {
        const s = useResumeStore.getState();
        s.updateResume({ contacts: s.resume?.contacts?.filter((p: any) => p.id !== id) });
      },
      volunteering: (id) => {
        const s = useResumeStore.getState();
        s.updateResume({ volunteering: s.resume?.volunteering?.filter((p: any) => p.id !== id) });
      },
      feature: (id) => {
        const s = useResumeStore.getState();
        s.updateResume({ features: s.resume?.features?.filter((p: any) => p.id !== id) });
      },
      education: (id) => {
        const s = useResumeStore.getState();
        s.updateResume({ education: s.resume?.education?.filter((p: any) => p.id !== id) });
      },
    }),
    [],
  );

  // ---------------------------------------------------------------------------
  // Avatar
  // ---------------------------------------------------------------------------
  const handleAvatarUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    const blobUrl = URL.createObjectURL(file);
    setLocalPicture(blobUrl);
    setIsUploadingPicture(true);
    try {
      const { url } = await uploadToS3(file, {
        endpoint: { request: { url: '/api/s3-upload' } },
      });
      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error('Failed to save avatar');
      setLocalPicture(url);
      URL.revokeObjectURL(blobUrl);
      toast.success('Profile picture updated');
    } catch {
      setLocalPicture(picture);
      URL.revokeObjectURL(blobUrl);
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingPicture(false);
    }
  }, [uploadToS3, picture]);

  const handleAvatarRemove = useCallback(async () => {
    setIsUploadingPicture(true);
    setLocalPicture(undefined);
    try {
      const res = await fetch('/api/user/avatar', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove');
      toast.success('Profile picture removed');
    } catch {
      setLocalPicture(picture);
      toast.error('Failed to remove image');
    } finally {
      setIsUploadingPicture(false);
    }
  }, [picture]);

  // Stable wrapper: GeneralTab passes a ChangeEvent; we extract the File
  const handlePictureUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) return handleAvatarUpload(file);
      return Promise.resolve();
    },
    [handleAvatarUpload],
  );

  // ---------------------------------------------------------------------------
  // Account deletion
  // ---------------------------------------------------------------------------
  const handleDeleteAccount = useCallback(async () => {
    setIsDeletingAccount(true);
    try {
      const res = await fetch('/api/user', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete account');
      toast.success('Account deleted successfully');
      setOpen(false);
      await signOut({ callbackUrl: '/' });
      window.location.href = '/';
    } catch (error) {
      toast.error('Failed to delete account');
      console.error(error);
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteAccountWarning(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Global save
  // ---------------------------------------------------------------------------
  const handleGlobalSave = useCallback(async () => {
    setIsSaving(true);
    try {
      if (uname !== username) {
        const unameRes = await updateUsernameMutation.mutateAsync(uname);
        if (!unameRes) {
          toast.error('Username update failed. It might be taken.');
          setIsSaving(false);
          return;
        }
      }
      const newResumeData = useResumeStore.getState().resume;
      if (newResumeData) {
        await saveResumeDataMutation.mutateAsync(newResumeData);
        setHasUnsavedChanges(false);
        toast.success('Profile updated successfully');
        setOpen(false);
        if (uname !== username) {
          router.push(`/${uname}`);
        } else {
          router.refresh();
        }
      }
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  }, [uname, username, updateUsernameMutation, saveResumeDataMutation, setHasUnsavedChanges, router]);

  // ---------------------------------------------------------------------------
  // DnD
  // ---------------------------------------------------------------------------
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sectionOrder.indexOf(active.id as string);
      const newIndex = sectionOrder.indexOf(over.id as string);
      const newOrder = arrayMove(sectionOrder, oldIndex, newIndex);
      
      setSectionOrder(newOrder);
      useResumeStore.getState().updateResume({ sectionOrder: newOrder });
      setHasUnsavedChanges(true);
    }
  }, [sectionOrder, setHasUnsavedChanges]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(val) => {
          if (!val && hasUnsavedChanges) {
            setShowUnsavedWarning(true);
            return;
          }
          setOpen(val);
        }}
      >
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <DialogTrigger asChild>
              <TooltipTrigger asChild>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  aria-label="Edit Profile"
                  style={{ position: 'fixed', bottom: '24px', left: '80px', zIndex: 50 }}
                  className="size-[48px] rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center outline-none transition-colors"
                >
                  <Pencil className="h-[18px] w-[18px] text-[#111]" strokeWidth={1.5} />
                </motion.button>
              </TooltipTrigger>
            </DialogTrigger>
            <TooltipContent
              side="top"
              sideOffset={12}
              className="bg-[#111] text-white text-[13px] font-medium rounded-lg px-3 py-1.5 border-none shadow-md flex items-center gap-1.5"
            >
              <span>Edit profile</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden flex flex-col sm:flex-row gap-0 bg-white overscroll-contain">
          <DialogTitle className="sr-only">Edit Profile</DialogTitle>

          {/* Sidebar */}
          <div className={cn(
            "w-full sm:w-64 border-r border-gray-100 bg-white flex-col h-full overflow-y-auto scrollbar-hide shrink-0 py-6",
            showMobileMenu ? "flex" : "hidden sm:flex"
          )}>
            <div className="flex flex-col px-4 gap-1">
              <div className="text-xs text-gray-400 font-semibold mt-4 mb-2 uppercase tracking-wider px-3">
                Profile
              </div>

              <button
                onClick={() => { setActiveTab('general'); setShowMobileMenu(false); }}
                className={cn(
                  'text-left px-3 py-2 rounded-md text-sm transition-colors',
                  activeTab === 'general'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50',
                )}
              >
                General
              </button>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
                  {sectionOrder.map((id) => {
                    const def = TAB_DEFINITIONS[id];
                    if (!def) return null;
                    return (
                      <SortableSidebarItem
                        key={id}
                        id={id}
                        label={def.label}
                        disabled={def.disabled}
                        isActive={activeTab === id}
                        onClick={() => { setActiveTab(id); setShowMobileMenu(false); }}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>

              <div className="text-xs text-gray-400 font-semibold mt-4 mb-2 uppercase tracking-wider px-3">
                Account
              </div>

              <button
                onClick={() => { setActiveTab('personal_domain'); setShowMobileMenu(false); }}
                className={cn(
                  'text-left px-3 py-2 rounded-md text-sm transition-colors',
                  activeTab === 'personal_domain'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50',
                )}
              >
                Personal Domain
              </button>
              <button
                onClick={() => { setActiveTab('settings'); setShowMobileMenu(false); }}
                className={cn(
                  'text-left px-3 py-2 rounded-md text-sm transition-colors',
                  activeTab === 'settings'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:bg-gray-50',
                )}
              >
                Settings
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className={cn(
            "flex-1 flex-col h-full bg-white relative",
            !showMobileMenu ? "flex" : "hidden sm:flex"
          )}>
            <div className="flex-1 overflow-y-auto scrollbar-hide p-4 sm:p-8 md:p-12">
              <div className="sm:hidden mb-6 flex items-center">
                <button
                  onClick={() => setShowMobileMenu(true)}
                  className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
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
                  removePicture={handleAvatarRemove}
                />
              )}
              {activeTab === 'skills'       && <SkillsTab />}
              {activeTab === 'projects'     && <ProjectsTab       years={years} setProjectToDelete={setDeleteProject} />}
              {activeTab === 'side_projects'&& <SideProjectsTab   years={years} setProjectToDelete={setDeleteSideProject} />}
              {activeTab === 'work'         && <WorkExperienceTab years={years} setProjectToDelete={setDeleteWork} />}
              {activeTab === 'education'    && <EducationTab      years={years} setProjectToDelete={setDeleteEducation} />}
              {activeTab === 'volunteering' && <VolunteeringTab   years={years} setProjectToDelete={setDeleteVolunteering} />}
              {activeTab === 'speaking'     && <SpeakingTab       years={years} setProjectToDelete={setDeleteSpeaking} />}
              {activeTab === 'features'     && <FeaturesTab       years={years} setProjectToDelete={setDeleteFeature} />}
              {activeTab === 'contact'      && <ContactsTab               setProjectToDelete={setDeleteContact} />}

              {activeTab === 'personal_domain' && <PersonalDomainTab username={username} />}

              {activeTab === 'settings' && (
                <div className="max-w-2xl mx-auto h-full flex flex-col pt-8">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                  </div>
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-red-200 bg-red-50/50 rounded-xl shadow-sm gap-4">
                          <div className="space-y-1">
                            <h4 className="text-red-900 font-semibold text-sm">Danger Zone</h4>
                            <p className="text-red-600/80 text-xs">
                              Permanently delete your account and all associated data. This action
                              cannot be undone.
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            onClick={() => setShowDeleteAccountWarning(true)}
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm whitespace-nowrap px-6"
                          >
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom action bar */}
            {!isEditingTab && (
              <div className="flex-none p-4 md:px-8 border-t border-gray-100 bg-white">
                <div className="flex justify-end">
                  <Button
                    onClick={handleGlobalSave}
                    disabled={isSaving || !isValidUname || checkUsernameMutation.isPending}
                    className="bg-[#2A2A2A] hover:bg-[#1A1A1A] text-white h-9 px-6 rounded-md shadow-sm border-none font-medium"
                  >
                    {isSaving ? 'Saving…' : 'Done'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete item confirmation */}
      <DeleteConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        description={pendingDelete ? DELETE_DESCRIPTIONS[pendingDelete.type] : ''}
        onConfirm={() => {
          if (pendingDelete) {
            DELETE_HANDLERS[pendingDelete.type](pendingDelete.id);
            setPendingDelete(null);
          }
        }}
        isLoading={isSaving}
      />

      {/* Delete account confirmation */}
      <DeleteConfirmDialog
        open={showDeleteAccountWarning}
        onOpenChange={setShowDeleteAccountWarning}
        description="Are you absolutely sure? This will permanently delete your account, resume data, and username. This action cannot be undone."
        onConfirm={handleDeleteAccount}
        isLoading={isDeletingAccount}
        confirmLabel="Delete Account"
        loadingLabel="Deleting…"
      />

      {/* Unsaved changes warning */}
      <AlertDialog open={showUnsavedWarning} onOpenChange={setShowUnsavedWarning}>
        <AlertDialogContent className="max-w-sm rounded-xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">
              Unsaved changes
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500 mt-2">
              You have unsaved changes, leave anyway?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex gap-2 sm:justify-end">
            <AlertDialogCancel className="rounded-md px-5 border border-gray-200 bg-white hover:bg-gray-50 h-9 text-sm font-medium text-gray-700 m-0">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setHasUnsavedChanges(false);
                setShowUnsavedWarning(false);
                setOpen(false);
                initResume(resume, username);
              }}
              className="rounded-md px-5 bg-gray-900 hover:bg-black text-white h-9 text-sm font-medium border-none m-0"
            >
              Leave anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
