'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { ResumeData } from '@/lib/server/redisActions';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { useUserActions } from '@/hooks/useUserActions';
import { useS3Upload } from 'next-s3-upload';
import { toast } from 'sonner';
import {
  Pencil,
  FolderCode,
  Plus,
  Trash2,
  GraduationCap,
  Briefcase,
  ArrowUpRight,
  MessageCircle,
  LogOut,
} from 'lucide-react';
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
import { SortableSidebarItem } from './SortableSidebarItem';

import { buildContactUrl, extractUsername } from '@/utils/extractUsername';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function EditProfileDialog({
  resume,
  username,
  picture,
}: {
  resume: ResumeData;
  username: string;
  picture?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  // Avatar state — tracks real-time preview separate from the server-side picture prop
  const [localPicture, setLocalPicture] = useState<string | undefined>(picture);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

  // Local state for skills tab
  const [skills, setSkills] = useState<string[]>(resume.header.skills || []);
  const [skillInput, setSkillInput] = useState('');

  // Local state for the general tab
  const [uname, setUname] = useState(username);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isInitialUsername = uname === username;

  useEffect(() => {
    if (!isInitialUsername && uname) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        checkUsernameMutation.mutateAsync(uname);
      }, 500);
    }
  }, [uname, isInitialUsername]);

  const {
    saveResumeDataMutation,
    updateUsernameMutation,
    checkUsernameMutation,
  } = useUserActions();

  const isValidUname =
    /^[a-zA-Z0-9-]+$/.test(uname) &&
    uname.length > 0 &&
    ((isInitialUsername || checkUsernameMutation.data?.available) ?? false);
  const [displayName, setDisplayName] = useState(resume.header.name || '');
  const [shortAbout, setShortAbout] = useState(resume.header.shortAbout || '');
  const [location, setLocation] = useState(resume.header.location || '');
  const [pronouns, setPronouns] = useState(resume.header.pronouns || '');
  const [website, setWebsite] = useState(resume.header.website || '');
  const [summary, setSummary] = useState(resume.summary || '');

  // Local state for projects tab
  const [projects, setProjects] = useState(resume.projects || []);
  const [projectsView, setProjectsView] = useState<'list' | 'form'>('list');
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // Local state for side projects tab
  const [sideProjects, setSideProjects] = useState(resume.sideProjects || []);
  const [sideProjectsView, setSideProjectsView] = useState<'list' | 'form'>(
    'list',
  );
  const [currentSideProject, setCurrentSideProject] = useState<any>(null);
  const [sideProjectToDelete, setSideProjectToDelete] = useState<string | null>(
    null,
  );

  // Local state for speaking tab
  const [speaking, setSpeaking] = useState(resume.speaking || []);
  const [speakingView, setSpeakingView] = useState<'list' | 'form'>('list');
  const [currentSpeaking, setCurrentSpeaking] = useState<any>(null);
  const [speakingToDelete, setSpeakingToDelete] = useState<string | null>(null);

  // Local state for education tab
  const [education, setEducation] = useState(resume.education || []);
  const [eduView, setEduView] = useState<'list' | 'form'>('list');
  const [currentEdu, setCurrentEdu] = useState<any>(null);
  const [eduToDelete, setEduToDelete] = useState<string | null>(null);

  // Local state for work experience tab
  const [work, setWork] = useState(resume.workExperience || []);
  const [workView, setWorkView] = useState<'list' | 'form'>('list');
  const [currentWork, setCurrentWork] = useState<any>(null);
  const [workToDelete, setWorkToDelete] = useState<string | null>(null);

  // Local state for contact tab
  const [contacts, setContacts] = useState(resume.contacts || []);
  const [contactView, setContactView] = useState<'list' | 'form'>('list');
  const [currentContact, setCurrentContact] = useState<any>(null);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState('general');

  // Custom Domain state
  const [customDomain, setCustomDomain] = useState('');
  const [domainStatus, setDomainStatus] = useState<any>(null);
  const [isVerifyingDomain, setIsVerifyingDomain] = useState(false);

  const fetchDomain = async () => {
    setIsVerifyingDomain(true);
    try {
      const res = await fetch('/api/domain');
      const data = await res.json();
      if (data.domain) {
        setCustomDomain(data.domain);
        setDomainStatus(data.status === 'success' ? data.data : null);
      } else {
        setCustomDomain('');
        setDomainStatus(null);
      }
    } catch (e) {}
    setIsVerifyingDomain(false);
  };

  useEffect(() => {
    if (activeTab === 'settings' && open) {
      fetchDomain();
    }
  }, [activeTab, open]);

  const handleDomainSave = async () => {
    if (!customDomain) return;
    setIsVerifyingDomain(true);
    try {
      const res = await fetch('/api/domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: customDomain }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success('Domain added successfully');
        fetchDomain();
      }
    } catch (e) {
      toast.error('Failed to add domain');
    }
    setIsVerifyingDomain(false);
  };

  const handleDomainRemove = async () => {
    setIsVerifyingDomain(true);
    try {
      const res = await fetch('/api/domain', { method: 'DELETE' });
      if (res.ok) {
        toast.success('Domain removed');
        setCustomDomain('');
        setDomainStatus(null);
      }
    } catch (e) {
      toast.error('Failed to remove domain');
    }
    setIsVerifyingDomain(false);
  };

  const DEFAULT_ORDER = [
    'work',
    'side_projects',
    'speaking',
    'projects',
    'skills',
    'education',
    'contact',
    'awards',
    'exhibitions',
    'writing',
  ];
  const [sectionOrder, setSectionOrder] = useState<string[]>(
    resume.sectionOrder || DEFAULT_ORDER,
  );

  const [typography, setTypography] = useState<'sans' | 'serif' | 'mono'>(
    resume.design?.typography || 'sans'
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSectionOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        setHasUnsavedChanges(true);
        return newOrder;
      });
    }
  };

  const TAB_DEFINITIONS: Record<string, { label: string; disabled: boolean }> =
    {
      work: { label: 'Work Experience', disabled: false },
      side_projects: { label: 'Side Projects', disabled: false },
      speaking: { label: 'Speaking', disabled: false },
      projects: { label: 'Projects', disabled: false },
      skills: { label: 'Skills', disabled: false },
      education: { label: 'Education', disabled: false },
      contact: { label: 'Contact', disabled: false },
      awards: { label: 'Awards', disabled: true },
      exhibitions: { label: 'Exhibitions', disabled: true },
      writing: { label: 'Writing', disabled: true },
    };

  const [showDeleteAccountWarning, setShowDeleteAccountWarning] =
    useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const { uploadToS3 } = useS3Upload();
  const router = useRouter();

  const handleDeleteAccount = async () => {
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
  };

  const handleAvatarUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    // Instant local preview — keep blob URL alive until upload completes
    const blobUrl = URL.createObjectURL(file);
    setLocalPicture(blobUrl);
    setIsUploadingPicture(true);

    try {
      // Use the same uploadToS3 hook that resume PDFs use — guaranteed correct URL
      const { url } = await uploadToS3(file, {
        endpoint: { request: { url: '/api/s3-upload' } },
      });

      // Save the S3 URL to Redis via our API
      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error('Failed to save avatar');

      // Now swap blob for real S3 URL
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
  };

  const handleAvatarRemove = async () => {
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
  };

  const handleGlobalSave = async () => {
    setIsSaving(true);
    try {
      // 1. Update username if changed
      if (uname !== username) {
        const unameRes = await updateUsernameMutation.mutateAsync(uname);
        if (!unameRes) {
          toast.error('Username update failed. It might be taken.');
          setIsSaving(false);
          return;
        }
      }

      // 2. Save resume data
      const newResumeData: ResumeData = {
        ...resume,
        header: {
          ...resume.header,
          name: displayName,
          skills,
          shortAbout,
          location,
          pronouns,
          website,
        },
        summary,
        projects,
        sideProjects,
        speaking,
        education,
        workExperience: work,
        contacts,
        sectionOrder,
        design: {
          typography,
        },
      };

      await saveResumeDataMutation.mutateAsync(newResumeData);
      setHasUnsavedChanges(false);
      toast.success('Profile updated successfully');
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProject = () => {
    if (!currentProject.title || !currentProject.year) return;

    const isEdit = !!currentProject.id;
    const newProject = isEdit
      ? currentProject
      : { ...currentProject, id: Date.now().toString() };

    const newProjects = isEdit
      ? projects.map((p: any) => (p.id === newProject.id ? newProject : p))
      : [...projects, newProject];

    setProjects(newProjects);
    setHasUnsavedChanges(true);
    toast.success('Project saved');
    setProjectsView('list');
    setCurrentProject(null);
  };

  const handleDeleteProject = (id: string) => {
    const newProjects = projects.filter((p: any) => p.id !== id);
    setProjects(newProjects);
    setHasUnsavedChanges(true);
    toast.success('Project deleted');
    setProjectsView('list');
    setCurrentProject(null);
    setProjectToDelete(null);
  };

  const handleSaveSideProject = () => {
    if (!currentSideProject.title || !currentSideProject.year) return;

    const isEdit = !!currentSideProject.id;
    const newProject = isEdit
      ? currentSideProject
      : { ...currentSideProject, id: Date.now().toString() };

    const newSideProjects = isEdit
      ? sideProjects.map((p: any) => (p.id === newProject.id ? newProject : p))
      : [...sideProjects, newProject];

    setSideProjects(newSideProjects);
    setHasUnsavedChanges(true);
    toast.success('Side project saved');
    setSideProjectsView('list');
    setCurrentSideProject(null);
  };

  const handleDeleteSideProject = (id: string) => {
    const newSideProjects = sideProjects.filter((p: any) => p.id !== id);
    setSideProjects(newSideProjects);
    setHasUnsavedChanges(true);
    toast.success('Side project deleted');
    setSideProjectsView('list');
    setCurrentSideProject(null);
    setSideProjectToDelete(null);
  };

  const handleSaveSpeaking = () => {
    if (!currentSpeaking.title || !currentSpeaking.year) return;

    const isEdit = !!currentSpeaking.id;
    const newSpeaking = isEdit
      ? currentSpeaking
      : { ...currentSpeaking, id: Date.now().toString() };

    const newSpeakingList = isEdit
      ? speaking.map((p: any) => (p.id === newSpeaking.id ? newSpeaking : p))
      : [...speaking, newSpeaking];

    setSpeaking(newSpeakingList);
    setHasUnsavedChanges(true);
    toast.success('Speaking engagement saved');
    setSpeakingView('list');
    setCurrentSpeaking(null);
  };

  const handleDeleteSpeaking = (id: string) => {
    const newSpeakingList = speaking.filter((p: any) => p.id !== id);
    setSpeaking(newSpeakingList);
    setHasUnsavedChanges(true);
    toast.success('Speaking engagement deleted');
    setSpeakingView('list');
    setCurrentSpeaking(null);
    setSpeakingToDelete(null);
  };

  const handleSaveWork = () => {
    if (
      !currentWork.company ||
      !currentWork.title ||
      !currentWork.start ||
      !currentWork.end
    )
      return;

    const isEdit = !!currentWork.id;
    const newWorkItem = isEdit
      ? currentWork
      : { ...currentWork, id: Date.now().toString() };

    const newWork = isEdit
      ? work.map((w: any) => (w.id === newWorkItem.id ? newWorkItem : w))
      : [...work, newWorkItem];

    setWork(newWork);
    setHasUnsavedChanges(true);
    toast.success('Work experience saved');
    setWorkView('list');
    setCurrentWork(null);
  };

  const handleDeleteWork = (id: string) => {
    const newWork = work.filter((w: any) => w.id !== id);
    setWork(newWork);
    setHasUnsavedChanges(true);
    toast.success('Work experience deleted');
    setWorkView('list');
    setCurrentWork(null);
    setWorkToDelete(null);
  };

  const handleSaveContact = () => {
    if (!currentContact.platform || !currentContact.link) return;

    const isEdit = !!currentContact.id;
    const newContactItem = isEdit
      ? currentContact
      : { ...currentContact, id: Date.now().toString() };

    const newContacts = isEdit
      ? contacts.map((c: any) =>
          c.id === newContactItem.id ? newContactItem : c,
        )
      : [...contacts, newContactItem];

    setContacts(newContacts);
    setHasUnsavedChanges(true);
    toast.success('Contact saved');
    setContactView('list');
    setCurrentContact(null);
  };

  const handleDeleteContact = (id: string) => {
    const newContacts = contacts.filter((c: any) => c.id !== id);
    setContacts(newContacts);
    setHasUnsavedChanges(true);
    toast.success('Contact deleted');
    setContactView('list');
    setCurrentContact(null);
    setContactToDelete(null);
  };

  const handleSaveEdu = () => {
    if (!currentEdu.school || !currentEdu.degree || !currentEdu.end) return;

    const isEdit = !!currentEdu.id;
    const newEduItem = isEdit
      ? currentEdu
      : { ...currentEdu, id: Date.now().toString() };

    const newEducation = isEdit
      ? education.map((e: any) => (e.id === newEduItem.id ? newEduItem : e))
      : [...education, newEduItem];

    setEducation(newEducation);
    setHasUnsavedChanges(true);
    toast.success('Education saved');
    setEduView('list');
    setCurrentEdu(null);
  };

  const handleDeleteEdu = (id: string) => {
    const newEducation = education.filter((e: any) => e.id !== id);
    setEducation(newEducation);
    setHasUnsavedChanges(true);
    toast.success('Education deleted');
    setEduView('list');
    setCurrentEdu(null);
    setEduToDelete(null);
  };

  const SIDEBAR_TABS = [
    { label: 'Profile', isLabel: true },
    { id: 'general', label: 'General', disabled: false },
    { id: 'work', label: 'Work Experience', disabled: false },
    { id: 'side_projects', label: 'Side Projects', disabled: false },
    { id: 'speaking', label: 'Speaking', disabled: false },
    { id: 'projects', label: 'Projects', disabled: false },
    { id: 'skills', label: 'Skills', disabled: false },
    { id: 'education', label: 'Education', disabled: false },
    { id: 'contact', label: 'Contact', disabled: false },
    { id: 'awards', label: 'Awards', disabled: true },
    { id: 'exhibitions', label: 'Exhibitions', disabled: true },
    { id: 'writing', label: 'Writing', disabled: true },
    { label: 'Account', isLabel: true },
    { id: 'settings', label: 'Settings', disabled: false },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from(new Array(50), (val, index) =>
    (currentYear - index).toString(),
  );
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const isFormView =
    (activeTab === 'projects' && projectsView === 'form') ||
    (activeTab === 'side_projects' && sideProjectsView === 'form') ||
    (activeTab === 'speaking' && speakingView === 'form') ||
    (activeTab === 'work' && workView === 'form') ||
    (activeTab === 'education' && eduView === 'form') ||
    (activeTab === 'contact' && contactView === 'form');

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
                  className="size-[48px] rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center outline-none transition-all"
                >
                  <Pencil
                    className="h-[18px] w-[18px] text-[#111]"
                    strokeWidth={1.5}
                  />
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

        <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden flex flex-col sm:flex-row gap-0 bg-white">
          <DialogTitle className="sr-only">Edit Profile</DialogTitle>

          {/* Sidebar */}
          <div className="w-full sm:w-64 border-r border-gray-100 bg-white flex flex-col h-full overflow-y-auto scrollbar-hide shrink-0 py-6">
            <div className="flex flex-col px-4 gap-1">
              <div className="text-xs text-gray-400 font-semibold mt-4 mb-2 uppercase tracking-wider px-3">
                Profile
              </div>

              <button
                onClick={() => setActiveTab('general')}
                className={cn(
                  'text-left px-3 py-2 rounded-md text-sm transition-colors',
                  activeTab === 'general'
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
                )}
              >
                General
              </button>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={sectionOrder}
                  strategy={verticalListSortingStrategy}
                >
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
                        onClick={() => {
                          setActiveTab(id);
                          if (id === 'projects') setProjectsView('list');
                          if (id === 'education') setEduView('list');
                          if (id === 'work') setWorkView('list');
                          if (id === 'side_projects')
                            setSideProjectsView('list');
                          if (id === 'speaking') setSpeakingView('list');
                          if (id === 'contact') setContactView('list');
                        }}
                      />
                    );
                  })}
                </SortableContext>
              </DndContext>

              <div className="text-xs text-gray-400 font-semibold mt-4 mb-2 uppercase tracking-wider px-3">
                Account
              </div>

              <button
                onClick={() => setActiveTab('settings')}
                className={cn(
                  'text-left px-3 py-2 rounded-md text-sm transition-colors',
                  activeTab === 'settings'
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
                )}
              >
                Settings
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col h-full bg-white relative">
            <div className="flex-1 overflow-y-auto scrollbar-hide p-8 md:p-12">
              {activeTab === 'general' && (
                <div className="max-w-2xl mx-auto space-y-8">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    {/* Hidden file input — always present */}
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAvatarUpload(file);
                        e.target.value = '';
                      }}
                    />

                    {localPicture ? (
                      /* ── Has image: static avatar (not clickable) ── */
                      <div className="size-20 rounded-full overflow-hidden shrink-0 relative">
                        {isUploadingPicture && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full z-10">
                            <svg
                              className="animate-spin size-5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                              />
                            </svg>
                          </div>
                        )}
                        <img
                          src={localPicture}
                          alt="Profile picture"
                          className="size-full object-cover"
                        />
                      </div>
                    ) : (
                      /* ── No image: clickable camera placeholder ── */
                      <label
                        htmlFor="avatar-upload"
                        className="size-20 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer shrink-0 relative group overflow-hidden"
                      >
                        {isUploadingPicture ? (
                          <svg
                            className="animate-spin size-6 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8H4z"
                            />
                          </svg>
                        ) : (
                          <>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="size-8 text-gray-400 group-hover:text-gray-500 transition-colors"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={1.5}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                              />
                            </svg>
                            {/* Subtle ring on hover */}
                            <div className="absolute inset-0 rounded-full ring-2 ring-inset ring-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </>
                        )}
                      </label>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2">
                      {localPicture ? (
                        /* Image exists: only show Remove */
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs text-gray-600 hover:text-red-600 hover:border-red-200 transition-colors"
                          onClick={handleAvatarRemove}
                          disabled={isUploadingPicture}
                        >
                          {isUploadingPicture ? 'Uploading…' : 'Remove image'}
                        </Button>
                      ) : (
                        /* No image: show Upload image */
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() =>
                              document.getElementById('avatar-upload')?.click()
                            }
                            disabled={isUploadingPicture}
                          >
                            {isUploadingPicture ? 'Removing…' : 'Upload image'}
                          </Button>
                          <p className="text-[11px] text-gray-400 leading-tight">
                            JPG, PNG or GIF · max 5MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="uname" className="text-gray-600 text-xs">
                        Username*
                      </Label>
                      <div className="relative flex items-center bg-white border border-gray-200 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-black">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 select-none text-sm z-10">
                          portfoliofy.me/
                        </span>
                        <Input
                          id="uname"
                          value={uname}
                          onChange={(e) =>
                            setUname(
                              e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9-]/g, ''),
                            )
                          }
                          className="pl-[112px] border-none focus-visible:ring-0 shadow-none bg-transparent rounded-none h-10"
                        />
                        <div className="pr-3 flex items-center">
                          {isInitialUsername ? null : checkUsernameMutation.isPending ? (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-black animate-spin" />
                          ) : isValidUname ? (
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M20 6L9 17L4 12"
                                stroke="#009505"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4 text-[#950000]"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M18 6 6 18" />
                              <path d="m6 6 12 12" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label
                          htmlFor="displayName"
                          className="text-gray-600 text-xs"
                        >
                          Display name*
                        </Label>
                        <span className="text-xs text-gray-400">
                          {displayName.length} of 48
                        </span>
                      </div>
                      <Input
                        id="displayName"
                        maxLength={48}
                        value={displayName}
                        onChange={(e) => {
                          setDisplayName(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label
                          htmlFor="shortAbout"
                          className="text-gray-600 text-xs"
                        >
                          What do you do?
                        </Label>
                        <span className="text-xs text-gray-400">
                          {shortAbout.length} of 32
                        </span>
                      </div>
                      <Input
                        id="shortAbout"
                        maxLength={32}
                        value={shortAbout}
                        onChange={(e) => {
                          setShortAbout(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label
                          htmlFor="location"
                          className="text-gray-600 text-xs"
                        >
                          Location
                        </Label>
                        <span className="text-xs text-gray-400">
                          {location.length} of 32
                        </span>
                      </div>
                      <Input
                        id="location"
                        maxLength={32}
                        value={location}
                        onChange={(e) => {
                          setLocation(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label
                          htmlFor="pronouns"
                          className="text-gray-600 text-xs"
                        >
                          Pronouns
                        </Label>
                        <span className="text-xs text-gray-400">
                          {pronouns.length} of 12
                        </span>
                      </div>
                      <Input
                        id="pronouns"
                        maxLength={12}
                        value={pronouns}
                        onChange={(e) => {
                          setPronouns(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label
                          htmlFor="website"
                          className="text-gray-600 text-xs"
                        >
                          Website
                        </Label>
                        <span className="text-xs text-gray-400">
                          {website.length} of 96
                        </span>
                      </div>
                      <Input
                        id="website"
                        placeholder="https://example.com"
                        maxLength={96}
                        value={website}
                        onChange={(e) => {
                          setWebsite(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>

                    <div className="space-y-2 pt-4 border-t border-gray-100">
                      <Label className="text-gray-600 text-xs">About</Label>
                      <RichTextEditor
                        content={summary}
                        onChange={(val) => {
                          setSummary(val);
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'projects' && (
                <div className="max-w-3xl mx-auto h-full flex flex-col">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                    <h2 className="text-2xl font-bold">Projects</h2>
                    {projectsView === 'list' && (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setCurrentProject({
                            title: '',
                            year: currentYear.toString(),
                            company: '',
                            link: '',
                            description: '',
                          });
                          setProjectsView('form');
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none h-8 text-xs px-4 rounded-md"
                      >
                        Add project
                      </Button>
                    )}
                  </div>

                  {projectsView === 'list' && projects.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-80 mt-12">
                      <div className="p-8 bg-gray-50 rounded-full">
                        <FolderCode
                          className="w-16 h-16 text-gray-400"
                          strokeWidth={1}
                        />
                      </div>
                      <Button
                        variant="secondary"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none rounded-md px-6 py-5 h-auto text-sm"
                        onClick={() => {
                          setCurrentProject({
                            title: '',
                            year: currentYear.toString(),
                            company: '',
                            link: '',
                            description: '',
                          });
                          setProjectsView('form');
                        }}
                      >
                        Add a work project you're proud of
                      </Button>
                    </div>
                  )}

                  {projectsView === 'list' && projects.length > 0 && (
                    <div className="space-y-8">
                      {projects.map((project: any) => (
                        <div
                          key={project.id}
                          className="flex flex-col sm:flex-row gap-4 sm:gap-12"
                        >
                          <div className="sm:w-16 shrink-0 text-gray-400 font-mono text-sm pt-0.5">
                            {project.year}
                          </div>

                          <div className="flex-1 flex flex-col justify-start items-start">
                            <p className="text-base font-semibold text-gray-900 font-mono">
                              {project.title}
                              {project.company && (
                                <span className="font-normal text-gray-900">
                                  {' '}
                                  at {project.company}
                                </span>
                              )}
                            </p>

                            {project.description &&
                              project.description !== '<p></p>' && (
                                <div
                                  className="mt-1 text-sm text-gray-500 font-mono line-clamp-2"
                                  dangerouslySetInnerHTML={{
                                    __html: project.description,
                                  }}
                                />
                              )}

                            <div className="flex items-center gap-4 mt-3 text-xs font-medium text-gray-400">
                              <button
                                onClick={() => {
                                  setCurrentProject(project);
                                  setProjectsView('form');
                                }}
                                className="hover:text-gray-900 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setProjectToDelete(project.id)}
                                className="hover:text-red-600 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {projectsView === 'form' && currentProject && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-gray-600 text-xs">
                            Title*
                          </Label>
                          <Input
                            value={currentProject.title}
                            onChange={(e) =>
                              setCurrentProject({
                                ...currentProject,
                                title: e.target.value,
                              })
                            }
                            placeholder="My Great Project"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-600 text-xs">Year*</Label>
                          <Select
                            value={currentProject.year}
                            onValueChange={(val) =>
                              setCurrentProject({
                                ...currentProject,
                                year: val,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                              {years.map((y) => (
                                <SelectItem key={y} value={y}>
                                  {y}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-gray-600 text-xs">
                            Company or client
                          </Label>
                          <Input
                            value={currentProject.company || ''}
                            onChange={(e) =>
                              setCurrentProject({
                                ...currentProject,
                                company: e.target.value,
                              })
                            }
                            placeholder="Acme inc."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-600 text-xs">
                            Link to project
                          </Label>
                          <Input
                            value={currentProject.link || ''}
                            onChange={(e) =>
                              setCurrentProject({
                                ...currentProject,
                                link: e.target.value,
                              })
                            }
                            placeholder="https://example.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <Label className="text-gray-600 text-xs">
                          Description
                        </Label>
                        <RichTextEditor
                          content={currentProject.description || ''}
                          onChange={(val) =>
                            setCurrentProject({
                              ...currentProject,
                              description: val,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'side_projects' && (
                <div className="max-w-3xl mx-auto h-full flex flex-col">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                    <h2 className="text-2xl font-bold">Side Projects</h2>
                    {sideProjectsView === 'list' && (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setCurrentSideProject({
                            title: '',
                            year: currentYear.toString(),
                            link: '',
                            description: '',
                          });
                          setSideProjectsView('form');
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none h-8 text-xs px-4 rounded-md"
                      >
                        Add side project
                      </Button>
                    )}
                  </div>

                  {sideProjectsView === 'list' && sideProjects.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-80 mt-12">
                      <div className="p-8 bg-gray-50 rounded-full">
                        <FolderCode
                          className="w-16 h-16 text-gray-400"
                          strokeWidth={1}
                        />
                      </div>
                      <Button
                        variant="secondary"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none rounded-md px-6 py-5 h-auto text-sm"
                        onClick={() => {
                          setCurrentSideProject({
                            title: '',
                            year: currentYear.toString(),
                            link: '',
                            description: '',
                          });
                          setSideProjectsView('form');
                        }}
                      >
                        Add a side project you're proud of
                      </Button>
                    </div>
                  )}

                  {sideProjectsView === 'list' && sideProjects.length > 0 && (
                    <div className="space-y-8">
                      {sideProjects.map((project: any) => (
                        <div
                          key={project.id}
                          className="flex flex-col sm:flex-row gap-4 sm:gap-12"
                        >
                          <div className="sm:w-16 shrink-0 text-gray-400 text-sm pt-0.5">
                            {project.year}
                          </div>

                          <div className="flex-1 flex flex-col justify-start items-start">
                            <p className="text-base font-semibold text-gray-900">
                              {project.title}
                            </p>

                            {project.description &&
                              project.description !== '<p></p>' && (
                                <div
                                  className="mt-1 text-sm text-gray-500 line-clamp-2"
                                  dangerouslySetInnerHTML={{
                                    __html: project.description,
                                  }}
                                />
                              )}

                            <div className="flex items-center gap-4 mt-3 text-xs font-medium text-gray-400">
                              <button
                                onClick={() => {
                                  setCurrentSideProject(project);
                                  setSideProjectsView('form');
                                }}
                                className="hover:text-gray-900 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  setSideProjectToDelete(project.id)
                                }
                                className="hover:text-red-600 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {sideProjectsView === 'form' && currentSideProject && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-gray-600 text-xs">
                            Title*
                          </Label>
                          <Input
                            value={currentSideProject.title}
                            onChange={(e) =>
                              setCurrentSideProject({
                                ...currentSideProject,
                                title: e.target.value,
                              })
                            }
                            placeholder="My Great Project"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-600 text-xs">Year*</Label>
                          <Select
                            value={currentSideProject.year}
                            onValueChange={(val) =>
                              setCurrentSideProject({
                                ...currentSideProject,
                                year: val,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                              {years.map((y) => (
                                <SelectItem key={y} value={y}>
                                  {y}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-gray-600 text-xs">
                            Link to side project
                          </Label>
                          <Input
                            value={currentSideProject.link || ''}
                            onChange={(e) =>
                              setCurrentSideProject({
                                ...currentSideProject,
                                link: e.target.value,
                              })
                            }
                            placeholder="https://example.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <Label className="text-gray-600 text-xs">
                          Description
                        </Label>
                        <RichTextEditor
                          content={currentSideProject.description || ''}
                          onChange={(val) =>
                            setCurrentSideProject({
                              ...currentSideProject,
                              description: val,
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'speaking' && (
                <div className="max-w-3xl mx-auto h-full flex flex-col">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                    <h2 className="text-2xl font-bold">Speaking</h2>
                    {speakingView === 'list' && (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setCurrentSpeaking({
                            title: '',
                            year: currentYear.toString(),
                            link: '',
                            location: '',
                          });
                          setSpeakingView('form');
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none h-8 text-xs px-4 rounded-md"
                      >
                        Add engagement
                      </Button>
                    )}
                  </div>

                  {speakingView === 'list' && speaking.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-80 mt-12">
                      <div className="p-8 bg-gray-50 rounded-full">
                        <FolderCode
                          className="w-16 h-16 text-gray-400"
                          strokeWidth={1}
                        />
                      </div>
                      <Button
                        variant="secondary"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none rounded-md px-6 py-5 h-auto text-sm"
                        onClick={() => {
                          setCurrentSpeaking({
                            title: '',
                            year: currentYear.toString(),
                            link: '',
                            location: '',
                          });
                          setSpeakingView('form');
                        }}
                      >
                        Add a speaking engagement
                      </Button>
                    </div>
                  )}

                  {speakingView === 'list' && speaking.length > 0 && (
                    <div className="space-y-8">
                      {speaking.map((engagement: any) => (
                        <div
                          key={engagement.id}
                          className="flex flex-col sm:flex-row gap-4 sm:gap-12"
                        >
                          <div className="sm:w-16 shrink-0 text-gray-400 text-sm pt-0.5">
                            {engagement.year}
                          </div>

                          <div className="flex-1 flex flex-col justify-start items-start">
                            <p className="text-base font-semibold text-gray-900">
                              {engagement.title}
                            </p>

                            {engagement.location && (
                              <div className="mt-1 text-sm text-gray-500 line-clamp-2">
                                {engagement.location}
                              </div>
                            )}

                            <div className="flex items-center gap-4 mt-3 text-xs font-medium text-gray-400">
                              <button
                                onClick={() => {
                                  setCurrentSpeaking(engagement);
                                  setSpeakingView('form');
                                }}
                                className="hover:text-gray-900 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() =>
                                  setSpeakingToDelete(engagement.id)
                                }
                                className="hover:text-red-600 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {speakingView === 'form' && currentSpeaking && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-gray-600 text-xs">
                            Title*
                          </Label>
                          <Input
                            value={currentSpeaking.title}
                            onChange={(e) =>
                              setCurrentSpeaking({
                                ...currentSpeaking,
                                title: e.target.value,
                              })
                            }
                            placeholder="React Conf 2024"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-600 text-xs">Year*</Label>
                          <Select
                            value={currentSpeaking.year}
                            onValueChange={(val) =>
                              setCurrentSpeaking({
                                ...currentSpeaking,
                                year: val,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                              {years.map((y) => (
                                <SelectItem key={y} value={y}>
                                  {y}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-gray-600 text-xs">
                            Location
                          </Label>
                          <Input
                            value={currentSpeaking.location || ''}
                            onChange={(e) =>
                              setCurrentSpeaking({
                                ...currentSpeaking,
                                location: e.target.value,
                              })
                            }
                            placeholder="Las Vegas, NV"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-600 text-xs">Link</Label>
                          <Input
                            value={currentSpeaking.link || ''}
                            onChange={(e) =>
                              setCurrentSpeaking({
                                ...currentSpeaking,
                                link: e.target.value,
                              })
                            }
                            placeholder="https://example.com"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'education' && (
                <div className="max-w-3xl mx-auto h-full flex flex-col">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                    <h2 className="text-2xl font-bold">Education</h2>
                    {eduView === 'list' && (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setCurrentEdu({
                            school: '',
                            degree: '',
                            start: '',
                            end: currentYear.toString(),
                            location: '',
                          });
                          setEduView('form');
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none h-8 text-xs px-4 rounded-md"
                      >
                        Add experience
                      </Button>
                    )}
                  </div>

                  {eduView === 'list' && education.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-80 mt-12">
                      <div className="p-8 bg-gray-50 rounded-full">
                        <GraduationCap
                          className="w-16 h-16 text-gray-400"
                          strokeWidth={1}
                        />
                      </div>
                      <Button
                        variant="secondary"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none rounded-md px-6 py-5 h-auto text-sm"
                        onClick={() => {
                          setCurrentEdu({
                            school: '',
                            degree: '',
                            start: '',
                            end: currentYear.toString(),
                            location: '',
                          });
                          setEduView('form');
                        }}
                      >
                        Add a school you attended
                      </Button>
                    </div>
                  )}

                  {eduView === 'list' && education.length > 0 && (
                    <div className="space-y-8">
                      {education.map((edu: any) => (
                        <div
                          key={edu.id || edu.school}
                          className="flex flex-col sm:flex-row gap-4 sm:gap-12"
                        >
                          <div className="sm:w-32 shrink-0 text-gray-400 font-mono text-sm pt-0.5">
                            {edu.start ? `${edu.start} — ${edu.end}` : edu.end}
                          </div>

                          <div className="flex-1 flex flex-col justify-start items-start">
                            <p className="text-base font-semibold text-gray-900 font-mono">
                              {edu.degree} at {edu.school}
                            </p>
                            {edu.location && (
                              <p className="text-sm text-gray-500 font-mono mt-1">
                                {edu.location}
                              </p>
                            )}

                            <div className="flex items-center gap-4 mt-3 text-xs font-medium text-gray-400">
                              <button
                                onClick={() => {
                                  setCurrentEdu(edu);
                                  setEduView('form');
                                }}
                                className="hover:text-gray-900 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setEduToDelete(edu.id)}
                                className="hover:text-red-600 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {eduView === 'form' && currentEdu && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-gray-600 text-xs">
                            School*
                          </Label>
                          <Input
                            value={currentEdu.school}
                            onChange={(e) =>
                              setCurrentEdu({
                                ...currentEdu,
                                school: e.target.value,
                              })
                            }
                            placeholder="Rhode Island School of Design"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-600 text-xs">
                            Degree*
                          </Label>
                          <Input
                            value={currentEdu.degree}
                            onChange={(e) =>
                              setCurrentEdu({
                                ...currentEdu,
                                degree: e.target.value,
                              })
                            }
                            placeholder="Bachelor's in Graphic Design"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-gray-600 text-xs">
                            Start Year
                          </Label>
                          <Select
                            value={currentEdu.start || ''}
                            onValueChange={(val) =>
                              setCurrentEdu({
                                ...currentEdu,
                                start: val === 'none' ? '' : val,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {years.map((y) => (
                                <SelectItem key={y} value={y}>
                                  {y}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-600 text-xs">
                            End Year*
                          </Label>
                          <Select
                            value={currentEdu.end || ''}
                            onValueChange={(val) =>
                              setCurrentEdu({ ...currentEdu, end: val })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Present">Present</SelectItem>
                              {years.map((y) => (
                                <SelectItem key={y} value={y}>
                                  {y}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-gray-600 text-xs">
                            Location
                          </Label>
                          <Input
                            value={currentEdu.location || ''}
                            onChange={(e) =>
                              setCurrentEdu({
                                ...currentEdu,
                                location: e.target.value,
                              })
                            }
                            placeholder="Providence, RI"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'work' && (
                <div className="max-w-3xl mx-auto h-full flex flex-col">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                    <h2 className="text-2xl font-bold">Work Experience</h2>
                    {workView === 'list' && (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setCurrentWork({
                            company: '',
                            title: '',
                            startMonth: 'January',
                            start: currentYear.toString(),
                            endMonth: 'January',
                            end: 'Now',
                            location: '',
                            description: '',
                          });
                          setWorkView('form');
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none h-8 text-xs px-4 rounded-md"
                      >
                        Add workplace
                      </Button>
                    )}
                  </div>

                  {workView === 'list' && work.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-80 mt-12">
                      <div className="p-8 bg-gray-50 rounded-full">
                        <Briefcase
                          className="w-16 h-16 text-gray-400"
                          strokeWidth={1}
                        />
                      </div>
                      <Button
                        variant="secondary"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none rounded-md px-6 py-5 h-auto text-sm"
                        onClick={() => {
                          setCurrentWork({
                            company: '',
                            title: '',
                            startMonth: 'January',
                            start: currentYear.toString(),
                            endMonth: 'January',
                            end: 'Now',
                            location: '',
                            description: '',
                          });
                          setWorkView('form');
                        }}
                      >
                        Add a job you've had
                      </Button>
                    </div>
                  )}

                  {workView === 'list' && work.length > 0 && (
                    <div className="space-y-8">
                      {work.map((w: any) => (
                        <div
                          key={w.id || w.company}
                          className="flex flex-col sm:flex-row gap-4 sm:gap-12"
                        >
                          <div className="sm:w-32 shrink-0 text-gray-400 font-mono text-sm pt-0.5">
                            {w.start} — {w.end}
                          </div>

                          <div className="flex-1 flex flex-col justify-start items-start">
                            {w.link ? (
                              <a
                                href={
                                  w.link.startsWith('http')
                                    ? w.link
                                    : `https://${w.link}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline inline-block"
                              >
                                <span className="text-base font-semibold text-gray-900 font-mono">
                                  {w.title} at {w.company}
                                  <ArrowUpRight className="inline-block ml-1 w-4 h-4 text-gray-900 relative -top-0.5" />
                                </span>
                              </a>
                            ) : (
                              <p className="text-base font-semibold text-gray-900 font-mono">
                                {w.title} at {w.company}
                              </p>
                            )}
                            {w.location && (
                              <p className="text-sm text-gray-500 font-mono mt-1">
                                {w.location}
                              </p>
                            )}

                            {w.description && w.description !== '<p></p>' && (
                              <div
                                className="mt-1 text-sm text-gray-500 font-mono prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{
                                  __html: w.description,
                                }}
                              />
                            )}

                            <div className="flex items-center gap-4 mt-3 text-xs font-medium text-gray-400">
                              <button
                                onClick={() => {
                                  setCurrentWork(w);
                                  setWorkView('form');
                                }}
                                className="hover:text-gray-900 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setWorkToDelete(w.id)}
                                className="hover:text-red-600 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {workView === 'form' && currentWork && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-gray-600 text-xs">
                            Company*
                          </Label>
                          <Input
                            value={currentWork.company}
                            onChange={(e) =>
                              setCurrentWork({
                                ...currentWork,
                                company: e.target.value,
                              })
                            }
                            placeholder="Acme Design Studio"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-600 text-xs">
                            Position*
                          </Label>
                          <Input
                            value={currentWork.title}
                            onChange={(e) =>
                              setCurrentWork({
                                ...currentWork,
                                title: e.target.value,
                              })
                            }
                            placeholder="Senior Product Designer"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-gray-600 text-xs">
                            Start Date*
                          </Label>
                          <div className="flex gap-2">
                            <Select
                              value={currentWork.startMonth || ''}
                              onValueChange={(val) =>
                                setCurrentWork({
                                  ...currentWork,
                                  startMonth: val,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Month" />
                              </SelectTrigger>
                              <SelectContent>
                                {months.map((m) => (
                                  <SelectItem key={m} value={m}>
                                    {m}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select
                              value={currentWork.start || ''}
                              onValueChange={(val) =>
                                setCurrentWork({ ...currentWork, start: val })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Year" />
                              </SelectTrigger>
                              <SelectContent>
                                {years.map((y) => (
                                  <SelectItem key={y} value={y}>
                                    {y}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-600 text-xs">
                            End Date*
                          </Label>
                          <div className="flex gap-2">
                            {currentWork.end !== 'Now' && (
                              <Select
                                value={currentWork.endMonth || ''}
                                onValueChange={(val) =>
                                  setCurrentWork({
                                    ...currentWork,
                                    endMonth: val,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                  {months.map((m) => (
                                    <SelectItem key={m} value={m}>
                                      {m}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            <Select
                              value={currentWork.end || ''}
                              onValueChange={(val) =>
                                setCurrentWork({ ...currentWork, end: val })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Year" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Now">Now</SelectItem>
                                {years.map((y) => (
                                  <SelectItem key={y} value={y}>
                                    {y}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-gray-600 text-xs">
                            Location
                          </Label>
                          <Input
                            value={currentWork.location || ''}
                            onChange={(e) =>
                              setCurrentWork({
                                ...currentWork,
                                location: e.target.value,
                              })
                            }
                            placeholder="San Francisco, CA"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-600 text-xs">Link</Label>
                          <Input
                            value={currentWork.link || ''}
                            onChange={(e) =>
                              setCurrentWork({
                                ...currentWork,
                                link: e.target.value,
                              })
                            }
                            placeholder="https://example.com"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 pt-2">
                        <Label className="text-gray-600 text-xs">
                          Description
                        </Label>
                        <RichTextEditor
                          content={currentWork.description || ''}
                          onChange={(val) =>
                            setCurrentWork({ ...currentWork, description: val })
                          }
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="max-w-3xl mx-auto h-full flex flex-col">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                    <h2 className="text-2xl font-bold">Skills</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="flex gap-3">
                      <Input
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (
                              skillInput.trim() &&
                              !skills.includes(skillInput.trim())
                            ) {
                              setSkills([...skills, skillInput.trim()]);
                              setSkillInput('');
                            }
                          }
                        }}
                        placeholder="e.g. Software Development"
                        className="flex-1"
                      />
                      <Button
                        onClick={() => {
                          if (
                            skillInput.trim() &&
                            !skills.includes(skillInput.trim())
                          ) {
                            setSkills([...skills, skillInput.trim()]);
                            setSkillInput('');
                          }
                        }}
                        variant="secondary"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none px-6"
                      >
                        Add
                      </Button>
                    </div>

                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-4">
                        {skills.map((skill, index) => (
                          <div
                            key={index}
                            className="flex items-center bg-gray-100/80 text-gray-900 text-sm font-mono px-3 py-1.5 rounded-full"
                          >
                            <span className="mr-2">{skill}</span>
                            <button
                              onClick={() =>
                                setSkills(skills.filter((_, i) => i !== index))
                              }
                              className="text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center rounded-full focus:outline-none"
                              aria-label={`Remove ${skill}`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'contact' && (
                <div className="max-w-3xl mx-auto h-full flex flex-col">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                    <h2 className="text-2xl font-bold">Contact</h2>
                    {contactView === 'list' && (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setCurrentContact({ platform: '', link: '' });
                          setContactView('form');
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none h-8 text-xs px-4 rounded-md"
                      >
                        Add link
                      </Button>
                    )}
                  </div>

                  {contactView === 'list' && contacts.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-80 mt-12">
                      <div className="p-8 bg-gray-50 rounded-full">
                        <MessageCircle
                          className="w-16 h-16 text-gray-400"
                          strokeWidth={1}
                        />
                      </div>
                      <Button
                        variant="secondary"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none rounded-md px-6 py-5 h-auto text-sm"
                        onClick={() => {
                          setCurrentContact({ platform: '', link: '' });
                          setContactView('form');
                        }}
                      >
                        Let others know how to reach you
                      </Button>
                    </div>
                  )}

                  {contactView === 'list' && contacts.length > 0 && (
                    <div className="space-y-8">
                      {contacts.map((c: any) => (
                        <div
                          key={c.id || c.platform}
                          className="flex flex-col sm:flex-row gap-4 sm:gap-12"
                        >
                          <div className="sm:w-32 shrink-0 text-gray-400 font-mono text-sm pt-0.5">
                            {c.platform}
                          </div>

                          <div className="flex-1 flex flex-col justify-start items-start">
                            <a
                              href={buildContactUrl(c.link, c.platform)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline inline-block"
                            >
                              <span className="text-base font-semibold text-gray-900 font-mono">
                                {extractUsername(c.link, c.platform)}
                                <ArrowUpRight className="inline-block ml-1 w-4 h-4 text-gray-900 relative -top-0.5" />
                              </span>
                            </a>

                            <div className="flex items-center gap-4 mt-3 text-xs font-medium text-gray-400">
                              <button
                                onClick={() => {
                                  setCurrentContact(c);
                                  setContactView('form');
                                }}
                                className="hover:text-gray-900 transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setContactToDelete(c.id)}
                                className="hover:text-red-600 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {contactView === 'form' && currentContact && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-gray-600 text-xs">
                            Platform*
                          </Label>
                          <Select
                            value={currentContact.platform || ''}
                            onValueChange={(val) =>
                              setCurrentContact({
                                ...currentContact,
                                platform: val,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                'Website',
                                'Email',
                                'LinkedIn',
                                'GitHub',
                                'X',
                                'Threads',
                                'Figma',
                                'Instagram',
                                'Bluesky',
                                'Mastodon',
                                'Other',
                              ].map((p) => (
                                <SelectItem key={p} value={p}>
                                  {p}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-600 text-xs">Link*</Label>
                          <Input
                            value={currentContact.link || ''}
                            onChange={(e) =>
                              setCurrentContact({
                                ...currentContact,
                                link: e.target.value,
                              })
                            }
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'settings' && (
                <div className="max-w-2xl mx-auto h-full flex flex-col pt-8">
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Settings
                    </h2>
                  </div>

                  <div className="space-y-10">
                    {/* Personal Domain Section */}
                    <div className="space-y-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-4">
                          <div className="space-y-1">
                            <h4 className="text-gray-900 text-[14px]">
                              Custom domain
                            </h4>
                            <p className="text-[#888888] text-[13px]">
                              Optionally set a domain other than{' '}
                              <a
                                href={`https://portfoliofy.me/${username}`}
                                className="text-gray-900 hover:underline underline-offset-2"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                portfoliofy.me/{username}
                              </a>
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="relative flex-1 max-w-[320px]">
                              {domainStatus?.verified ? (
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center z-10">
                                  <div className="bg-[#7cb44d] rounded-full p-[2px]">
                                    <svg
                                      className="w-[10px] h-[10px] text-white"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="3"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                  </div>
                                </div>
                              ) : domainStatus ? (
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center z-10">
                                  <div className="bg-[#ebd955] text-white rounded-full w-[14px] h-[14px] flex items-center justify-center text-[10px] font-bold">
                                    ?
                                  </div>
                                </div>
                              ) : null}
                              <Input
                                value={customDomain}
                                onChange={(e) =>
                                  setCustomDomain(e.target.value.toLowerCase())
                                }
                                placeholder="yourname.com"
                                className={`w-full bg-[#f2f2f2] border-0 focus-visible:ring-0 shadow-none text-[13px] h-9 ${domainStatus ? 'pl-9 text-gray-700' : ''}`}
                                disabled={!!domainStatus}
                              />
                            </div>
                            {!domainStatus ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 border-gray-200 text-gray-500 font-normal text-[13px] hover:text-gray-900 rounded-lg"
                                onClick={handleDomainSave}
                                disabled={isVerifyingDomain || !customDomain}
                              >
                                {isVerifyingDomain ? 'Saving...' : 'Save'}
                              </Button>
                            ) : (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-9 border-gray-200 text-gray-400 font-normal text-[13px] rounded-lg"
                                  disabled={true}
                                >
                                  Save
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-9 border-gray-200 text-gray-500 font-normal text-[13px] hover:text-gray-900 rounded-lg"
                                  onClick={handleDomainRemove}
                                  disabled={isVerifyingDomain}
                                >
                                  Reset
                                </Button>
                              </>
                            )}
                          </div>

                          {domainStatus && (
                            <>
                              {domainStatus.verified ? (
                                <div className="mt-1 relative max-w-[400px]">
                                  <div className="absolute -top-[6px] left-8 w-3 h-3 bg-[#e8eedd] rotate-45 transform origin-center" />
                                  <div className="relative bg-[#e8eedd] text-[#6b8949] text-[13px] px-4 py-2.5 rounded-lg">
                                    Your site is published at{' '}
                                    <a
                                      href={`https://${customDomain}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:underline font-medium decoration-[#6b8949] underline-offset-2"
                                    >
                                      {customDomain}
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-1 relative max-w-[500px]">
                                  <div className="absolute -top-[6px] left-8 w-3 h-3 bg-[#f0eed9] rotate-45 transform origin-center" />
                                  <div className="relative bg-[#f0eed9] rounded-xl overflow-hidden px-5 py-4">
                                    <p className="text-[#645c38] text-[13px] mb-4">
                                      Set the following record on your DNS
                                      provider to continue.
                                    </p>

                                    <div className="grid grid-cols-4 gap-2 text-[13px] font-medium text-[#7d754b] mb-1.5">
                                      <div>Type</div>
                                      <div>Name</div>
                                      <div className="col-span-2">Value</div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-2 text-[13px] text-[#4a4529] items-center">
                                      <div>
                                        {domainStatus.verification?.length > 0
                                          ? domainStatus.verification[0].type
                                          : 'A'}
                                      </div>
                                      <div>
                                        {domainStatus.verification?.length > 0
                                          ? domainStatus.verification[0].domain
                                          : '@'}
                                      </div>
                                      <div className="col-span-2 flex items-center justify-between group">
                                        <div
                                          className="bg-[#e4e0c7] px-1.5 py-0.5 rounded cursor-pointer selection:bg-transparent"
                                          onClick={() => {
                                            navigator.clipboard.writeText(
                                              domainStatus.verification
                                                ?.length > 0
                                                ? domainStatus.verification[0]
                                                    .value
                                                : '76.76.21.21',
                                            );
                                            toast.success(
                                              'Copied to clipboard',
                                            );
                                          }}
                                        >
                                          {domainStatus.verification?.length > 0
                                            ? domainStatus.verification[0].value
                                            : '76.76.21.21'}
                                        </div>
                                        <button
                                          className="text-[12px] font-medium opacity-60 hover:opacity-100 transition-opacity"
                                          onClick={() => {
                                            navigator.clipboard.writeText(
                                              domainStatus.verification
                                                ?.length > 0
                                                ? domainStatus.verification[0]
                                                    .value
                                                : '76.76.21.21',
                                            );
                                            toast.success(
                                              'Copied to clipboard',
                                            );
                                          }}
                                        >
                                          Copy
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-3 text-[12px] text-[#a0a0a0] leading-relaxed">
                                    Please note that changing DNS settings can
                                    take several minutes to take effect. If
                                    you've already updated your DNS settings{' '}
                                    <button
                                      onClick={fetchDomain}
                                      disabled={isVerifyingDomain}
                                      className="text-gray-700 hover:text-black font-medium underline decoration-gray-300 underline-offset-2 disabled:opacity-50"
                                    >
                                      click here to manually refresh
                                    </button>
                                    , or visit this page for help.
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Typography Section */}
                    <div className="space-y-4 pt-4">
                      <h4 className="text-gray-900 text-[14px]">Typography</h4>
                      
                      <div className="flex flex-col gap-5">
                        {/* Sans */}
                        <div 
                          className="flex items-center gap-4 cursor-pointer group"
                          onClick={() => { setTypography('sans'); setHasUnsavedChanges(true); }}
                        >
                          <div className={`flex items-center justify-center w-[60px] h-[60px] rounded-[16px] shrink-0 transition-colors ${typography === 'sans' ? 'border-[2.5px] border-[#3b82f6] bg-white' : 'border border-gray-200 bg-white group-hover:border-gray-300'}`}>
                            <span className="text-[22px] font-medium font-sans text-gray-900 tracking-tight">Aa</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[14px] text-gray-900 font-medium">Sans</span>
                            <span className="text-[14px] text-[#737373]">Graphik, designed by Christian Schwartz in 2009.</span>
                          </div>
                        </div>

                        {/* Serif */}
                        <div 
                          className="flex items-center gap-4 cursor-pointer group"
                          onClick={() => { setTypography('serif'); setHasUnsavedChanges(true); }}
                        >
                          <div className={`flex items-center justify-center w-[60px] h-[60px] rounded-[16px] shrink-0 transition-colors ${typography === 'serif' ? 'border-[2.5px] border-[#3b82f6] bg-white' : 'border border-gray-200 bg-white group-hover:border-gray-300'}`}>
                            <span className="text-[22px] font-medium font-serif text-gray-900 tracking-tight">Aa</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[14px] text-gray-900 font-medium">Serif</span>
                            <span className="text-[14px] text-[#737373]">Signifier, designed by Kris Sowersby in 2020.</span>
                          </div>
                        </div>

                        {/* Mono */}
                        <div 
                          className="flex items-center gap-4 cursor-pointer group"
                          onClick={() => { setTypography('mono'); setHasUnsavedChanges(true); }}
                        >
                          <div className={`flex items-center justify-center w-[60px] h-[60px] rounded-[16px] shrink-0 transition-colors ${typography === 'mono' ? 'border-[2.5px] border-[#3b82f6] bg-white' : 'border border-gray-200 bg-white group-hover:border-gray-300'}`}>
                            <span className="text-[22px] font-medium font-mono text-gray-900 tracking-tight">Aa</span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[14px] text-gray-900 font-medium">Mono</span>
                            <span className="text-[14px] text-[#737373]">Diatype Mono, designed by Dinamo in 2020.</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Account Section */}
                    <div className="space-y-6">
                      <div className="flex flex-col gap-4">
                        {/* Danger Zone Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-red-200 bg-red-50/50 rounded-xl shadow-sm gap-4">
                          <div className="space-y-1">
                            <h4 className="text-red-900 font-semibold text-sm">
                              Danger Zone
                            </h4>
                            <p className="text-red-600/80 text-xs">
                              Permanently delete your account and all associated
                              data. This action cannot be undone.
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
            {/* Bottom Fixed Action Bar */}
            <div className="flex-none p-4 md:px-8 border-t border-gray-100 bg-white">
              {!isFormView && (
                <div className="flex justify-end">
                  <Button
                    onClick={handleGlobalSave}
                    disabled={
                      isSaving ||
                      !isValidUname ||
                      checkUsernameMutation.isPending
                    }
                    className="bg-[#2A2A2A] hover:bg-[#1A1A1A] text-white h-9 px-6 rounded-md shadow-sm border-none font-medium"
                  >
                    {isSaving ? 'Saving...' : 'Done'}
                  </Button>
                </div>
              )}

              {activeTab === 'projects' && projectsView === 'form' && (
                <div className="flex justify-between items-center">
                  <div className="pointer-events-auto">
                    {currentProject?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setProjectToDelete(currentProject.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                        disabled={isSaving}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => {
                        setProjectsView('list');
                        setCurrentProject(null);
                      }}
                      variant="ghost"
                      className="rounded-full text-gray-500 hover:text-gray-700"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveProject}
                      disabled={
                        isSaving ||
                        !currentProject?.title ||
                        !currentProject?.year
                      }
                      variant="default"
                      className="bg-design-black hover:bg-design-black/90 text-white rounded-md px-6"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'side_projects' && sideProjectsView === 'form' && (
                <div className="flex justify-between items-center">
                  <div className="pointer-events-auto">
                    {currentSideProject?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setSideProjectToDelete(currentSideProject.id)
                        }
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                        disabled={isSaving}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => {
                        setSideProjectsView('list');
                        setCurrentSideProject(null);
                      }}
                      variant="ghost"
                      className="rounded-full text-gray-500 hover:text-gray-700"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveSideProject}
                      disabled={
                        isSaving ||
                        !currentSideProject?.title ||
                        !currentSideProject?.year
                      }
                      variant="default"
                      className="bg-design-black hover:bg-design-black/90 text-white rounded-md px-6"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'work' && workView === 'form' && (
                <div className="flex justify-between items-center">
                  <div className="pointer-events-auto">
                    {currentWork?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setWorkToDelete(currentWork.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                        disabled={isSaving}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => {
                        setWorkView('list');
                        setCurrentWork(null);
                      }}
                      variant="ghost"
                      className="rounded-full text-gray-500 hover:text-gray-700"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveWork}
                      disabled={
                        isSaving ||
                        !currentWork?.company ||
                        !currentWork?.title ||
                        !currentWork?.start ||
                        !currentWork?.end
                      }
                      variant="default"
                      className="bg-design-black hover:bg-design-black/90 text-white rounded-md px-6"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'speaking' && speakingView === 'form' && (
                <div className="flex justify-between items-center">
                  <div className="pointer-events-auto">
                    {currentSpeaking?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSpeakingToDelete(currentSpeaking.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                        disabled={isSaving}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => {
                        setSpeakingView('list');
                        setCurrentSpeaking(null);
                      }}
                      variant="ghost"
                      className="rounded-full text-gray-500 hover:text-gray-700"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveSpeaking}
                      disabled={
                        isSaving ||
                        !currentSpeaking?.title ||
                        !currentSpeaking?.year
                      }
                      variant="default"
                      className="bg-design-black hover:bg-design-black/90 text-white rounded-md px-6"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'education' && eduView === 'form' && (
                <div className="flex justify-between items-center">
                  <div className="pointer-events-auto">
                    {currentEdu?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEduToDelete(currentEdu.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                        disabled={isSaving}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => {
                        setEduView('list');
                        setCurrentEdu(null);
                      }}
                      variant="ghost"
                      className="rounded-full text-gray-500 hover:text-gray-700"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveEdu}
                      disabled={
                        isSaving ||
                        !currentEdu?.school ||
                        !currentEdu?.degree ||
                        !currentEdu?.end
                      }
                      variant="default"
                      className="bg-design-black hover:bg-design-black/90 text-white rounded-md px-6"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              )}
              {activeTab === 'contact' && contactView === 'form' && (
                <div className="flex justify-between items-center">
                  <div className="pointer-events-auto">
                    {currentContact?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setContactToDelete(currentContact.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                        disabled={isSaving}
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => {
                        setContactView('list');
                        setCurrentContact(null);
                      }}
                      variant="ghost"
                      className="rounded-full text-gray-500 hover:text-gray-700"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveContact}
                      disabled={
                        isSaving ||
                        !currentContact?.platform ||
                        !currentContact?.link
                      }
                      variant="default"
                      className="bg-design-black hover:bg-design-black/90 text-white rounded-md px-6"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              )}
            </div>{' '}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!projectToDelete}
        onOpenChange={(open) => !open && setProjectToDelete(null)}
      >
        <AlertDialogContent className="">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                projectToDelete && handleDeleteProject(projectToDelete)
              }
              disabled={isSaving}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSaving ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showDeleteAccountWarning}
        onOpenChange={setShowDeleteAccountWarning}
      >
        <AlertDialogContent className=" max-w-sm rounded-xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500 mt-2">
              Are you absolutely sure? This will permanently delete your
              account, resume data, and username. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex gap-3 sm:justify-end">
            <AlertDialogCancel
              disabled={isDeletingAccount}
              className="rounded-full px-6 border-none bg-transparent hover:bg-gray-100 h-9 text-sm font-medium text-gray-600 m-0"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
              className="rounded-full px-6 bg-red-600 border border-transparent text-white hover:bg-red-700 h-9 shadow-sm text-sm font-medium m-0"
            >
              {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showUnsavedWarning}
        onOpenChange={setShowUnsavedWarning}
      >
        <AlertDialogContent className=" max-w-sm rounded-xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900">
              Unsaved changes
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-500 mt-2">
              You have unsaved changes, leave anyway?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex gap-3 sm:justify-end">
            <AlertDialogCancel className="rounded-full px-6 border-none bg-transparent hover:bg-gray-100 h-9 text-sm font-medium text-gray-600 m-0">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setHasUnsavedChanges(false);
                setShowUnsavedWarning(false);
                setOpen(false);

                // Revert to saved state
                setUname(username);
                setDisplayName(resume.header.name || '');
                setShortAbout(resume.header.shortAbout || '');
                setLocation(resume.header.location || '');
                setPronouns(resume.header.pronouns || '');
                setWebsite(resume.header.website || '');
                setSummary(resume.summary || '');
                setProjects(resume.projects || []);
                setSideProjects(resume.sideProjects || []);
                setSpeaking(resume.speaking || []);
                setEducation(resume.education || []);
                setWork(resume.workExperience || []);
                setContacts(resume.contacts || []);
              }}
              className="rounded-full px-6 bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 h-9 shadow-sm text-sm font-medium m-0"
            >
              Okay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!speakingToDelete}
        onOpenChange={(open) => !open && setSpeakingToDelete(null)}
      >
        <AlertDialogContent className="max-w-sm rounded-xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Speaking Engagement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this speaking engagement? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() =>
                speakingToDelete && handleDeleteSpeaking(speakingToDelete)
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!eduToDelete}
        onOpenChange={(open) => !open && setEduToDelete(null)}
      >
        <AlertDialogContent className="">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              education.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => eduToDelete && handleDeleteEdu(eduToDelete)}
              disabled={isSaving}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSaving ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!contactToDelete}
        onOpenChange={(open) => !open && setContactToDelete(null)}
      >
        <AlertDialogContent className="">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              contact.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                contactToDelete && handleDeleteContact(contactToDelete)
              }
              disabled={isSaving}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSaving ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!workToDelete}
        onOpenChange={(open) => !open && setWorkToDelete(null)}
      >
        <AlertDialogContent className="">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              work experience.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => workToDelete && handleDeleteWork(workToDelete)}
              disabled={isSaving}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSaving ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
