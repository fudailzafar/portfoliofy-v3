'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
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
import { Pencil } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';
import { ResumeData } from '@/lib/server/dbActions';
import { useUserActions } from '@/hooks/useUserActions';
import { useS3Upload } from 'next-s3-upload';
import { DEFAULT_SECTION_ORDER } from '@/lib/resume';
import { toast } from 'sonner';
import { ProfileSidebar } from './ProfileSidebar';
import { ProfileContent } from './ProfileContent';
import { DeleteConfirmDialog, UnsavedChangesDialog } from './dialogs';

// ---------------------------------------------------------------------------
// Constants — hoisted outside the component so they are never reallocated
// ---------------------------------------------------------------------------

const TAB_DEFINITIONS: Record<string, { label: string; disabled: boolean }> = {
  work: { label: 'Work Experience', disabled: false },
  side_projects: { label: 'Side Projects', disabled: false },
  speaking: { label: 'Speaking', disabled: false },
  projects: { label: 'Projects', disabled: false },
  skills: { label: 'Skills', disabled: false },
  education: { label: 'Education', disabled: false },
  contact: { label: 'Contact', disabled: false },
  awards: { label: 'Awards', disabled: true },
  volunteering: { label: 'Volunteering', disabled: false },
  features: { label: 'Features', disabled: false },
  print: { label: 'Print', disabled: false },
};

type DeleteTarget =
  | { type: 'project'; id: string }
  | { type: 'sideProject'; id: string }
  | { type: 'speaking'; id: string }
  | { type: 'volunteering'; id: string }
  | { type: 'feature'; id: string }
  | { type: 'education'; id: string }
  | { type: 'work'; id: string }
  | { type: 'contact'; id: string };

const DELETE_DESCRIPTIONS: Record<DeleteTarget['type'], string> = {
  project:
    'This will permanently delete this project. This action cannot be undone.',
  sideProject:
    'This will permanently delete this side project. This action cannot be undone.',
  speaking:
    'This will permanently delete this speaking engagement. This action cannot be undone.',
  work: 'This will permanently delete this work experience. This action cannot be undone.',
  contact:
    'This will permanently delete this contact. This action cannot be undone.',
  volunteering:
    'This will permanently delete this volunteering entry. This action cannot be undone.',
  feature:
    'This will permanently delete this feature. This action cannot be undone.',
  education:
    'This will permanently delete this education entry. This action cannot be undone.',
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
  const [showDeleteAccountWarning, setShowDeleteAccountWarning] =
    useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialUsername = uname === username;

  const {
    saveResumeDataMutation,
    updateUsernameMutation,
    checkUsernameMutation,
  } = useUserActions();

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
  }, [uname, isInitialUsername, checkUsernameMutation]);

  // Section order — normalise legacy ids on first load only
  const [sectionOrder, setSectionOrder] = useState<string[]>(
    () => resume.sectionOrder || DEFAULT_SECTION_ORDER,
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
    (type: DeleteTarget['type']) => (id: string) =>
      setPendingDelete({ type, id }),
    [],
  );

  const setDeleteProject = useMemo(
    () => makeDeleteSetter('project'),
    [makeDeleteSetter],
  );
  const setDeleteSideProject = useMemo(
    () => makeDeleteSetter('sideProject'),
    [makeDeleteSetter],
  );
  const setDeleteSpeaking = useMemo(
    () => makeDeleteSetter('speaking'),
    [makeDeleteSetter],
  );
  const setDeleteWork = useMemo(
    () => makeDeleteSetter('work'),
    [makeDeleteSetter],
  );
  const setDeleteEducation = useMemo(
    () => makeDeleteSetter('education'),
    [makeDeleteSetter],
  );
  const setDeleteVolunteering = useMemo(
    () => makeDeleteSetter('volunteering'),
    [makeDeleteSetter],
  );
  const setDeleteFeature = useMemo(
    () => makeDeleteSetter('feature'),
    [makeDeleteSetter],
  );
  const setDeleteContact = useMemo(
    () => makeDeleteSetter('contact'),
    [makeDeleteSetter],
  );

  // ---------------------------------------------------------------------------
  // Delete handlers — stable; reads store at call-time so no stale closure
  // ---------------------------------------------------------------------------
  const DELETE_HANDLERS = useMemo<
    Record<DeleteTarget['type'], (id: string) => void>
  >(
    () => ({
      project: (id) => {
        const s = useResumeStore.getState();
        s.updateResume({
          projects: s.resume?.projects?.filter((p: any) => p.id !== id),
        });
      },
      sideProject: (id) => {
        const s = useResumeStore.getState();
        s.updateResume({
          sideProjects: s.resume?.sideProjects?.filter((p: any) => p.id !== id),
        });
      },
      speaking: (id) => {
        const s = useResumeStore.getState();
        s.updateResume({
          speaking: s.resume?.speaking?.filter((p: any) => p.id !== id),
        });
      },
      work: (id) => {
        const s = useResumeStore.getState();
        s.updateResume({
          workExperience: s.resume?.workExperience?.filter(
            (p: any) => p.id !== id,
          ),
        });
      },
      contact: (id) => {
        const s = useResumeStore.getState();
        s.updateResume({
          contacts: s.resume?.contacts?.filter((p: any) => p.id !== id),
        });
      },
      volunteering: (id) => {
        const s = useResumeStore.getState();
        s.updateResume({
          volunteering: s.resume?.volunteering?.filter((p: any) => p.id !== id),
        });
      },
      feature: (id) => {
        const s = useResumeStore.getState();
        s.updateResume({
          features: s.resume?.features?.filter((p: any) => p.id !== id),
        });
      },
      education: (id) => {
        const s = useResumeStore.getState();
        s.updateResume({
          education: s.resume?.education?.filter((p: any) => p.id !== id),
        });
      },
    }),
    [],
  );

  // ---------------------------------------------------------------------------
  // Avatar
  // ---------------------------------------------------------------------------
  const handleAvatarUpload = useCallback(
    async (file: File) => {
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
    },
    [uploadToS3, picture],
  );

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
        }
      }
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  }, [
    uname,
    username,
    updateUsernameMutation,
    saveResumeDataMutation,
    setHasUnsavedChanges,
    router,
  ]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = sectionOrder.indexOf(active.id as string);
        const newIndex = sectionOrder.indexOf(over.id as string);
        const newOrder = arrayMove(sectionOrder, oldIndex, newIndex);

        setSectionOrder(newOrder);
        useResumeStore.getState().updateResume({ sectionOrder: newOrder });
        setHasUnsavedChanges(true);
      }
    },
    [sectionOrder, setHasUnsavedChanges],
  );

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
                  style={{
                    position: 'fixed',
                    bottom: '24px',
                    left: '80px',
                    zIndex: 50,
                  }}
                  className="flex size-[48px] items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm outline-none transition-colors dark:border-[#333] dark:bg-[#121212] dark:hover:bg-[#1f1f1f]"
                >
                  <Pencil
                    className="h-[18px] w-[18px] text-[#111] dark:text-gray-200"
                    strokeWidth={1.5}
                  />
                </motion.button>
              </TooltipTrigger>
            </DialogTrigger>
            <TooltipContent
              side="top"
              sideOffset={12}
              className="flex items-center gap-1.5 rounded-lg border-none bg-[#111] px-3 py-1.5 text-[13px] font-medium text-white shadow-md"
            >
              <span>Edit profile</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DialogContent className="flex h-[85vh] max-w-5xl flex-col gap-0 overflow-hidden overscroll-contain bg-white p-0 sm:flex-row dark:border-[#333] dark:bg-[#121212]">
          <DialogTitle className="sr-only">Edit Profile</DialogTitle>

          {/* Sidebar */}
          <ProfileSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            setShowMobileMenu={setShowMobileMenu}
            showMobileMenu={showMobileMenu}
            sectionOrder={sectionOrder}
            setSectionOrder={setSectionOrder}
            tabDefinitions={TAB_DEFINITIONS}
            onDragEnd={handleDragEnd}
          />

          {/* Content Area */}
          <ProfileContent
            activeTab={activeTab}
            showMobileMenu={showMobileMenu}
            setShowMobileMenu={setShowMobileMenu}
            username={username}
            localPicture={localPicture}
            isUploadingPicture={isUploadingPicture}
            isEditingTab={isEditingTab}
            isSaving={isSaving}
            isValidUname={isValidUname}
            checkUsernameMutationIsPending={checkUsernameMutation.isPending}
            years={years}
            setProjectToDelete={(type) => (id) => {
              const handlers: Record<string, (id: string) => void> = {
                project: setDeleteProject,
                sideProject: setDeleteSideProject,
                speaking: setDeleteSpeaking,
                work: setDeleteWork,
                education: setDeleteEducation,
                volunteering: setDeleteVolunteering,
                feature: setDeleteFeature,
                contact: setDeleteContact,
              };
              return handlers[type]?.(id);
            }}
            handlePictureUpload={handlePictureUpload}
            removePicture={handleAvatarRemove}
            onSave={handleGlobalSave}
            onDeleteAccount={handleDeleteAccount}
            setShowDeleteAccountWarning={setShowDeleteAccountWarning}
          />
        </DialogContent>
      </Dialog>

      {/* Dialogs */}
      <DeleteConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        description={
          pendingDelete ? DELETE_DESCRIPTIONS[pendingDelete.type] : ''
        }
        onConfirm={() => {
          if (pendingDelete) {
            DELETE_HANDLERS[pendingDelete.type](pendingDelete.id);
            setPendingDelete(null);
          }
        }}
        isLoading={isSaving}
      />

      <DeleteConfirmDialog
        open={showDeleteAccountWarning}
        onOpenChange={setShowDeleteAccountWarning}
        description="Are you absolutely sure? This will permanently delete your account, resume data, and username. This action cannot be undone."
        onConfirm={handleDeleteAccount}
        isLoading={isDeletingAccount}
        confirmLabel="Delete Account"
        loadingLabel="Deleting…"
      />

      <UnsavedChangesDialog
        open={showUnsavedWarning}
        onOpenChange={setShowUnsavedWarning}
        onLeaveAnyway={() => {
          setHasUnsavedChanges(false);
          setShowUnsavedWarning(false);
          setOpen(false);
          initResume(resume, username);
        }}
      />
    </>
  );
}
