'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useDebounce } from 'use-debounce';
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
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Pencil } from 'lucide-react';
import { useSidebarStore } from '@/store/useSidebarStore';
import { createPortal } from 'react-dom';
import { useResumeStore } from '@/store/useResumeStore';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';
import { ResumeData } from '@/lib/server/dbActions';
import { useUserActions } from '@/hooks/useUserActions';
import {
  normalizeSectionOrder,
  DEFAULT_SECTION_ORDER,
  SECTION_LABELS,
  getUsedPageSlugs,
} from '@/lib/resume';
import { getOptimizedImageUrl } from '@/lib/utils';
import { useS3Upload } from 'next-s3-upload';
import { toast } from 'sonner';
import { isValidWebsite } from '@/lib/validation/url';
import { ProfileSidebar } from './ProfileSidebar';
import { ProfileContent } from './ProfileContent';
import { DeleteConfirmDialog, UnsavedChangesDialog } from './dialogs';

const PageEditorView = dynamic(
  () =>
    import('@/components/composite/PageEditorView').then(
      (mod) => mod.PageEditorView,
    ),
  { ssr: false },
);

// ---------------------------------------------------------------------------
// Constants — hoisted outside the component so they are never reallocated
// ---------------------------------------------------------------------------

const TAB_DEFINITIONS: Record<string, { label: string; disabled: boolean }> = {
  ...Object.fromEntries(
    DEFAULT_SECTION_ORDER.map((sectionId) => [
      sectionId,
      { label: SECTION_LABELS[sectionId], disabled: false },
    ]),
  ),
  print: { label: 'Print', disabled: false },
};

type DeleteTarget =
  | { type: 'project'; id: string }
  | { type: 'sideProject'; id: string }
  | { type: 'speaking'; id: string }
  | { type: 'writing'; id: string }
  | { type: 'exhibitions'; id: string }
  | { type: 'volunteering'; id: string }
  | { type: 'feature'; id: string }
  | { type: 'education'; id: string }
  | { type: 'work'; id: string }
  | { type: 'award'; id: string }
  | { type: 'certification'; id: string }
  | { type: 'contact'; id: string };

const DELETE_DESCRIPTIONS: Record<DeleteTarget['type'], string> = {
  project:
    'This will permanently delete this project. This action cannot be undone.',
  sideProject:
    'This will permanently delete this side project. This action cannot be undone.',
  speaking:
    'This will permanently delete this speaking engagement. This action cannot be undone.',
  writing:
    'This will permanently delete this writing piece. This action cannot be undone.',
  exhibitions:
    'This will permanently delete this exhibition. This action cannot be undone.',
  work: 'This will permanently delete this work experience. This action cannot be undone.',
  contact:
    'This will permanently delete this contact. This action cannot be undone.',
  volunteering:
    'This will permanently delete this volunteering entry. This action cannot be undone.',
  feature:
    'This will permanently delete this feature. This action cannot be undone.',
  award:
    'This will permanently delete this award. This action cannot be undone.',
  certification:
    'This will permanently delete this certification. This action cannot be undone.',
  education:
    'This will permanently delete this education entry. This action cannot be undone.',
};

export function EditProfileDialog({
  resume,
  username,
  picture,
  createdAt,
}: {
  resume: ResumeData;
  username: string;
  picture?: string;
  createdAt?: Date | null;
}) {
  const {
    uname,
    activeTab,
    setActiveTab,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    initResume,
    triggerSave,
    activeFormValid,
    editingPage,
    setEditingPage,
  } = useResumeStore();

  const currentResume = useResumeStore((state) => state.resume);
  const usedPageSlugs = useMemo(
    () => getUsedPageSlugs(currentResume, editingPage?.attachment?.id),
    [currentResume, editingPage],
  );

  const {
    saveResumeDataMutation,
    updateUsernameMutation,
    checkUsernameMutation,
    resumeQuery,
  } = useUserActions();

  // Use React Query's fresh data if available, otherwise fallback to server component's initial data
  const freshResume = resumeQuery.data?.resume?.resumeData || resume;

  useEffect(() => {
    initResume(freshResume, username);
  }, [freshResume, username, initResume]);

  const [open, setOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [localPicture, setLocalPicture] = useState<string | undefined>(picture);
  // Tracks the last avatar that actually saved successfully — a failed
  // upload/removal rolls back here, not to the static page-load `picture`
  // prop, so an earlier successful change in the same session isn't lost.
  const lastSavedPictureRef = useRef(picture);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<DeleteTarget | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleOpenEditor = () => setOpen(true);
    window.addEventListener('open-editor', handleOpenEditor);
    return () => window.removeEventListener('open-editor', handleOpenEditor);
  }, []);

  const { isOpen: isSidebarOpen } = useSidebarStore();

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialUsername = uname === username;

  const isValidUname =
    /^[a-zA-Z0-9-]+$/.test(uname) &&
    uname.length > 0 &&
    ((isInitialUsername || checkUsernameMutation.data?.available) ?? false);

  // Also block Save when the website field contains an invalid URL
  const resumeWebsite = useResumeStore.getState().resume?.header?.website ?? '';
  const isValidSiteUrl = isValidWebsite(resumeWebsite);

  const [debouncedUname] = useDebounce(uname, 500);

  // Username availability debounce — lives here only; GeneralTab renders the input
  useEffect(() => {
    if (!isInitialUsername && debouncedUname) {
      checkUsernameMutation.mutateAsync(debouncedUname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedUname, isInitialUsername]);

  const [sectionOrder, setSectionOrder] = useState<string[]>(() =>
    normalizeSectionOrder(resume.sectionOrder),
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
  const setDeleteWriting = useMemo(
    () => makeDeleteSetter('writing'),
    [makeDeleteSetter],
  );
  const setDeleteExhibitions = useMemo(
    () => makeDeleteSetter('exhibitions'),
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
  const setDeleteAward = useMemo(
    () => makeDeleteSetter('award'),
    [makeDeleteSetter],
  );
  const setDeleteCertification = useMemo(
    () => makeDeleteSetter('certification'),
    [makeDeleteSetter],
  );
  const setDeleteContact = useMemo(
    () => makeDeleteSetter('contact'),
    [makeDeleteSetter],
  );

  // ---------------------------------------------------------------------------
  // Delete handlers — stable; reads store at call-time so no stale closure
  // ---------------------------------------------------------------------------
  const SECTION_MAP: Record<DeleteTarget['type'], any> = useMemo(
    () => ({
      project: 'projects',
      sideProject: 'sideProjects',
      speaking: 'speaking',
      writing: 'writing',
      exhibitions: 'exhibitions',
      work: 'workExperience',
      contact: 'contacts',
      volunteering: 'volunteering',
      feature: 'features',
      award: 'awards',
      certification: 'certifications',
      education: 'education',
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
        lastSavedPictureRef.current = url;
        URL.revokeObjectURL(blobUrl);
        toast.success('Profile picture updated');
      } catch {
        setLocalPicture(lastSavedPictureRef.current);
        URL.revokeObjectURL(blobUrl);
        toast.error('Failed to upload image');
      } finally {
        setIsUploadingPicture(false);
      }
    },
    [uploadToS3],
  );

  const handleAvatarRemove = useCallback(async () => {
    setIsUploadingPicture(true);
    setLocalPicture(undefined);
    try {
      const res = await fetch('/api/user/avatar', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove');
      lastSavedPictureRef.current = undefined;
    } catch {
      setLocalPicture(lastSavedPictureRef.current);
      toast.error('Failed to remove image');
    } finally {
      setIsUploadingPicture(false);
    }
  }, []);

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
      setIsDeletingAccount(false);
    }
    // No `finally` resetting isDeletingAccount on success — the tab is about
    // to navigate away (signOut + redirect), so it should stay disabled
    // rather than flash back to normal for the instant before that happens.
  }, []);

  // ---------------------------------------------------------------------------
  // Global save
  // ---------------------------------------------------------------------------
  const handleGlobalSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // Flush whatever item is currently being added/edited (if any) into
      // the resume before persisting — there's no separate per-item commit
      // step anymore, Save always captures everything on screen.
      useResumeStore.getState().activeFormCommit?.();

      if (uname !== username) {
        try {
          await updateUsernameMutation.mutateAsync(uname);
        } catch {
          toast.error('Username update failed. It might be taken.');
          setIsSaving(false);
          return;
        }
      }
      const newResumeData = useResumeStore.getState().resume;
      if (newResumeData) {
        await saveResumeDataMutation.mutateAsync(newResumeData);
        setHasUnsavedChanges(false);
        triggerSave();
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  }, [
    uname,
    username,
    updateUsernameMutation,
    saveResumeDataMutation,
    setHasUnsavedChanges,
    triggerSave,
  ]);

  const handleDone = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
      if (uname !== username) {
        router.push(`/${uname}`);
      } else {
        router.refresh();
      }
    }, 600);
  }, [uname, username, router]);

  // ---------------------------------------------------------------------------
  // Global cancel — discards every unsaved change (including whatever item
  // is currently being added/edited) back to the last-saved-on-server state.
  // ---------------------------------------------------------------------------
  const handleGlobalCancel = useCallback(() => {
    setHasUnsavedChanges(false);
    initResume(resume, username);
    setSectionOrder(normalizeSectionOrder(resume.sectionOrder));
    // Remounts the currently-active tab so any in-progress add/edit form
    // (and its local draft) is dropped along with everything else.
    triggerSave();
  }, [resume, username, initResume, setHasUnsavedChanges, triggerSave]);

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
  const editButton = mounted
    ? createPortal(
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <DialogTrigger asChild>
              <TooltipTrigger asChild>
                <motion.button
                  initial={false}
                  animate={{ x: isSidebarOpen ? 330 : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Edit Profile"
                  style={{
                    position: 'fixed',
                    bottom: '24px',
                    left: '80px',
                    zIndex: 50,
                  }}
                  className="flex size-[48px] items-center justify-center rounded-full border border-border-strong bg-surface-1 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1 dark:border-none dark:bg-[#333] print:hidden"
                >
                  <Pencil
                    className="h-[18px] w-[18px] text-content-primary"
                    strokeWidth={1.5}
                  />
                </motion.button>
              </TooltipTrigger>
            </DialogTrigger>
            <TooltipContent side="top" sideOffset={12}>
              <span>Edit profile</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>,
        document.body,
      )
    : null;

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
        {editButton}

        <DialogContent
          hideCloseButton
          className="flex h-[85vh] max-w-4xl flex-col gap-0 overflow-hidden overscroll-contain bg-surface-1 p-0"
        >
          <DialogTitle className="sr-only">Edit Profile</DialogTitle>

          {/* The page editor renders as an overlay, not a ternary swap —
              the sidebar/content tree (and whichever tab's in-progress
              local draft, e.g. an item mid-edit with the form still open)
              stays mounted underneath the whole time. Unmounting it while
              the page editor was open used to reset the tab back to its
              list view and drop the very draft the new page was just
              added to. */}
          {editingPage && (
            <div className="flex flex-1 flex-col overflow-hidden">
              <PageEditorView
                page={editingPage.attachment}
                usedSlugs={usedPageSlugs}
                onSave={editingPage.onSave}
                onClose={() => setEditingPage(null)}
              />
            </div>
          )}

          <div
            className={
              editingPage
                ? 'hidden'
                : 'flex flex-1 flex-col overflow-hidden sm:flex-row'
            }
          >
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
              localPicture={getOptimizedImageUrl(localPicture) || localPicture}
              isUploadingPicture={isUploadingPicture}
              isSaving={isSaving}
              isValidUname={isValidUname && isValidSiteUrl}
              checkUsernameMutationIsPending={checkUsernameMutation.isPending}
              isValidUsername={isValidUname}
              years={years}
              setProjectToDelete={(type) => (id) => {
                const handlers: Record<string, (id: string) => void> = {
                  project: setDeleteProject,
                  sideProject: setDeleteSideProject,
                  speaking: setDeleteSpeaking,
                  writing: setDeleteWriting,
                  exhibitions: setDeleteExhibitions,
                  work: setDeleteWork,
                  education: setDeleteEducation,
                  volunteering: setDeleteVolunteering,
                  feature: setDeleteFeature,
                  award: setDeleteAward,
                  certification: setDeleteCertification,
                  contact: setDeleteContact,
                };
                return handlers[type]?.(id);
              }}
              handlePictureUpload={handlePictureUpload}
              removePicture={handleAvatarRemove}
              onSave={handleGlobalSave}
              onCancel={handleGlobalCancel}
              onDone={handleDone}
              isClosing={isClosing}
              onConfirmDeleteAccount={handleDeleteAccount}
              isDeletingAccount={isDeletingAccount}
              createdAt={createdAt}
            />
          </div>

          {/* Mobile Sidebar Action Bar — hidden while the page editor is
              open, since it has its own Close/Save bar. */}
          {!editingPage && showMobileMenu && (
            <div className="flex-none bg-surface-1 px-4 pb-4 sm:hidden">
              <div className="flex w-full items-center justify-end gap-3 border-t border-border-subtle pt-4">
                {hasUnsavedChanges ? (
                  <>
                    <button
                      onClick={handleGlobalCancel}
                      disabled={isSaving}
                      className="px-4 text-sm font-medium text-content-primary hover:underline hover:underline-offset-4 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleGlobalSave}
                      disabled={
                        isSaving ||
                        !isValidUname ||
                        !isValidSiteUrl ||
                        checkUsernameMutation.isPending ||
                        !activeFormValid
                      }
                      className="h-9 rounded-md border border-border-strong bg-surface-card px-6 text-sm font-medium text-content-primary shadow-sm active:bg-surface-2 dark:border-none dark:bg-border-subtle dark:active:bg-border-strong"
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
                    onClick={handleDone}
                    disabled={isClosing}
                    className="h-9 rounded-md border border-border-strong bg-surface-card px-6 text-sm font-medium text-content-primary shadow-sm active:bg-surface-2 dark:border-none dark:bg-border-subtle dark:active:bg-border-strong"
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
          )}
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
            const storeKey = SECTION_MAP[pendingDelete.type];
            useResumeStore
              .getState()
              .deleteItemFromSection(storeKey, pendingDelete.id);
            setPendingDelete(null);
          }
        }}
        isLoading={isSaving}
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
