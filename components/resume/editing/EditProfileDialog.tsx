'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { ResumeData } from '@/lib/server/redisActions';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { useUserActions } from '@/hooks/useUserActions';
import { toast } from 'sonner';
import { Pencil, FolderCode, Plus, Trash2, GraduationCap, Briefcase, ArrowUpRight, MessageCircle, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClerk } from '@clerk/nextjs';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  
  // Local state for the general tab
  const [uname, setUname] = useState(username);
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
  const [sideProjectsView, setSideProjectsView] = useState<'list' | 'form'>('list');
  const [currentSideProject, setCurrentSideProject] = useState<any>(null);
  const [sideProjectToDelete, setSideProjectToDelete] = useState<string | null>(null);

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
  const [showDeleteAccountWarning, setShowDeleteAccountWarning] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const { saveResumeDataMutation, updateUsernameMutation } = useUserActions();
  const { signOut } = useClerk();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      const res = await fetch('/api/user', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete account');
      
      toast.success('Account deleted successfully');
      setOpen(false);
      await signOut();
      window.location.href = '/';
    } catch (error) {
      toast.error('Failed to delete account');
      console.error(error);
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteAccountWarning(false);
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
    const newProject = isEdit ? currentProject : { ...currentProject, id: Date.now().toString() };
    
    const newProjects = isEdit 
      ? projects.map((p: any) => p.id === newProject.id ? newProject : p)
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
    const newProject = isEdit ? currentSideProject : { ...currentSideProject, id: Date.now().toString() };
    
    const newSideProjects = isEdit 
      ? sideProjects.map((p: any) => p.id === newProject.id ? newProject : p)
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
    const newSpeaking = isEdit ? currentSpeaking : { ...currentSpeaking, id: Date.now().toString() };
    
    const newSpeakingList = isEdit 
      ? speaking.map((p: any) => p.id === newSpeaking.id ? newSpeaking : p)
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
    if (!currentWork.company || !currentWork.title || !currentWork.start || !currentWork.end) return;
    
    const isEdit = !!currentWork.id;
    const newWorkItem = isEdit ? currentWork : { ...currentWork, id: Date.now().toString() };
    
    const newWork = isEdit 
      ? work.map((w: any) => w.id === newWorkItem.id ? newWorkItem : w)
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
    const newContactItem = isEdit ? currentContact : { ...currentContact, id: Date.now().toString() };
    
    const newContacts = isEdit 
      ? contacts.map((c: any) => c.id === newContactItem.id ? newContactItem : c)
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
    const newEduItem = isEdit ? currentEdu : { ...currentEdu, id: Date.now().toString() };
    
    const newEducation = isEdit 
      ? education.map((e: any) => e.id === newEduItem.id ? newEduItem : e)
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
    { id: 'features', label: 'Features', disabled: true },
    { id: 'education', label: 'Education', disabled: false },
    { id: 'contact', label: 'Contact', disabled: false },
    { id: 'awards', label: 'Awards', disabled: true },
    { id: 'exhibitions', label: 'Exhibitions', disabled: true },
    { id: 'writing', label: 'Writing', disabled: true },
    { label: 'Account', isLabel: true },
    { id: 'settings', label: 'Settings', disabled: false },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from(new Array(50), (val, index) => (currentYear - index).toString());
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'
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
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          size="icon"
          className="fixed bottom-6 left-6 z-50 h-14 w-14 rounded-full shadow-xl bg-design-black hover:bg-design-black/90 text-white"
          aria-label="Edit Profile"
        >
          <Pencil className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-5xl h-[85vh] p-0 overflow-hidden font-mono flex flex-col sm:flex-row gap-0 bg-white">
        <DialogTitle className="sr-only">Edit Profile</DialogTitle>

        {/* Sidebar */}
        <div className="w-full sm:w-64 border-r border-gray-100 bg-white flex flex-col h-full overflow-y-auto shrink-0 py-6">
          <div className="flex flex-col px-4 gap-1">
            {SIDEBAR_TABS.map((tab, idx) => {
              if (tab.isLabel) {
                return (
                  <div key={idx} className="text-xs text-gray-400 font-semibold mt-4 mb-2 uppercase tracking-wider px-3">
                    {tab.label}
                  </div>
                );
              }

              return (
                <button
                  key={tab.id}
                  disabled={tab.disabled}
                  onClick={() => {
                    setActiveTab(tab.id!);
                    if (tab.id === 'projects') setProjectsView('list');
                    if (tab.id === 'education') setEduView('list');
                    if (tab.id === 'work') setWorkView('list');
                  }}
                  className={cn(
                    "text-left px-3 py-2 rounded-md text-sm transition-colors",
                    activeTab === tab.id 
                      ? "bg-gray-100 text-gray-900 font-medium" 
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
                    tab.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-gray-500"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <span>{tab.label}</span>
                    {tab.disabled && <span className="text-gray-300">=</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col h-full bg-white relative">
          <div className="flex-1 overflow-y-auto p-8 md:p-12 pb-24">
            
            {activeTab === 'general' && (
              <div className="max-w-2xl mx-auto space-y-8">
                {/* Avatar Section placeholder */}
                <div className="flex items-center gap-6">
                  <Avatar className="size-20 bg-gray-100">
                    <AvatarImage src={picture} alt="Profile picture" />
                    <AvatarFallback className="text-gray-400">?</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" className="h-9 text-sm">Remove image</Button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="uname" className="text-gray-600 text-xs">Username*</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 select-none text-sm">
                        portfoliofy.me/
                      </span>
                      <Input
                        id="uname"
                        value={uname}
                        onChange={(e) => setUname(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        className="pl-28"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="displayName" className="text-gray-600 text-xs">Display name*</Label>
                      <span className="text-xs text-gray-400">{displayName.length} of 48</span>
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
                      <Label htmlFor="shortAbout" className="text-gray-600 text-xs">What do you do?</Label>
                      <span className="text-xs text-gray-400">{shortAbout.length} of 32</span>
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
                      <Label htmlFor="location" className="text-gray-600 text-xs">Location</Label>
                      <span className="text-xs text-gray-400">{location.length} of 32</span>
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
                      <Label htmlFor="pronouns" className="text-gray-600 text-xs">Pronouns</Label>
                      <span className="text-xs text-gray-400">{pronouns.length} of 12</span>
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
                      <Label htmlFor="website" className="text-gray-600 text-xs">Website</Label>
                      <span className="text-xs text-gray-400">{website.length} of 96</span>
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
                        setCurrentProject({ title: '', year: currentYear.toString(), company: '', link: '', description: '' });
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
                      <FolderCode className="w-16 h-16 text-gray-400" strokeWidth={1} />
                    </div>
                    <Button 
                      variant="secondary" 
                      className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none rounded-md px-6 py-5 h-auto text-sm"
                      onClick={() => {
                        setCurrentProject({ title: '', year: currentYear.toString(), company: '', link: '', description: '' });
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
                                {' '}at {project.company}
                              </span>
                            )}
                          </p>
                          
                          {project.description && project.description !== '<p></p>' && (
                            <div 
                              className="mt-1 text-sm text-gray-500 font-mono line-clamp-2"
                              dangerouslySetInnerHTML={{ __html: project.description }}
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
                        <Label className="text-gray-600 text-xs">Title*</Label>
                        <Input
                          value={currentProject.title}
                          onChange={(e) => setCurrentProject({ ...currentProject, title: e.target.value })}
                          placeholder="My Great Project"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-600 text-xs">Year*</Label>
                        <Select 
                          value={currentProject.year} 
                          onValueChange={(val) => setCurrentProject({ ...currentProject, year: val })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((y) => (
                              <SelectItem key={y} value={y}>{y}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-gray-600 text-xs">Company or client</Label>
                        <Input
                          value={currentProject.company || ''}
                          onChange={(e) => setCurrentProject({ ...currentProject, company: e.target.value })}
                          placeholder="Acme inc."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-600 text-xs">Link to project</Label>
                        <Input
                          value={currentProject.link || ''}
                          onChange={(e) => setCurrentProject({ ...currentProject, link: e.target.value })}
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <Label className="text-gray-600 text-xs">Description</Label>
                      <RichTextEditor 
                        content={currentProject.description || ''} 
                        onChange={(val) => setCurrentProject({ ...currentProject, description: val })} 
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
                        setCurrentSideProject({ title: '', year: currentYear.toString(), link: '', description: '' });
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
                      <FolderCode className="w-16 h-16 text-gray-400" strokeWidth={1} />
                    </div>
                    <Button 
                      variant="secondary" 
                      className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none rounded-md px-6 py-5 h-auto text-sm"
                      onClick={() => {
                        setCurrentSideProject({ title: '', year: currentYear.toString(), link: '', description: '' });
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
                          
                          {project.description && project.description !== '<p></p>' && (
                            <div 
                              className="mt-1 text-sm text-gray-500 line-clamp-2"
                              dangerouslySetInnerHTML={{ __html: project.description }}
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
                              onClick={() => setSideProjectToDelete(project.id)}
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
                        <Label className="text-gray-600 text-xs">Title*</Label>
                        <Input
                          value={currentSideProject.title}
                          onChange={(e) => setCurrentSideProject({ ...currentSideProject, title: e.target.value })}
                          placeholder="My Great Project"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-600 text-xs">Year*</Label>
                        <Select 
                          value={currentSideProject.year} 
                          onValueChange={(val) => setCurrentSideProject({ ...currentSideProject, year: val })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((y) => (
                              <SelectItem key={y} value={y}>{y}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-gray-600 text-xs">Link to side project</Label>
                        <Input
                          value={currentSideProject.link || ''}
                          onChange={(e) => setCurrentSideProject({ ...currentSideProject, link: e.target.value })}
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <Label className="text-gray-600 text-xs">Description</Label>
                      <RichTextEditor 
                        content={currentSideProject.description || ''} 
                        onChange={(val) => setCurrentSideProject({ ...currentSideProject, description: val })} 
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
                        setCurrentSpeaking({ title: '', year: currentYear.toString(), link: '', location: '' });
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
                      <FolderCode className="w-16 h-16 text-gray-400" strokeWidth={1} />
                    </div>
                    <Button 
                      variant="secondary" 
                      className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none rounded-md px-6 py-5 h-auto text-sm"
                      onClick={() => {
                        setCurrentSpeaking({ title: '', year: currentYear.toString(), link: '', location: '' });
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
                              onClick={() => setSpeakingToDelete(engagement.id)}
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
                        <Label className="text-gray-600 text-xs">Title*</Label>
                        <Input
                          value={currentSpeaking.title}
                          onChange={(e) => setCurrentSpeaking({ ...currentSpeaking, title: e.target.value })}
                          placeholder="React Conf 2024"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-600 text-xs">Year*</Label>
                        <Select 
                          value={currentSpeaking.year} 
                          onValueChange={(val) => setCurrentSpeaking({ ...currentSpeaking, year: val })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map((y) => (
                              <SelectItem key={y} value={y}>{y}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-gray-600 text-xs">Location</Label>
                        <Input
                          value={currentSpeaking.location || ''}
                          onChange={(e) => setCurrentSpeaking({ ...currentSpeaking, location: e.target.value })}
                          placeholder="Las Vegas, NV"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-600 text-xs">Link</Label>
                        <Input
                          value={currentSpeaking.link || ''}
                          onChange={(e) => setCurrentSpeaking({ ...currentSpeaking, link: e.target.value })}
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
                        setCurrentEdu({ school: '', degree: '', start: '', end: currentYear.toString(), location: '' });
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
                      <GraduationCap className="w-16 h-16 text-gray-400" strokeWidth={1} />
                    </div>
                    <Button 
                      variant="secondary" 
                      className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none rounded-md px-6 py-5 h-auto text-sm"
                      onClick={() => {
                        setCurrentEdu({ school: '', degree: '', start: '', end: currentYear.toString(), location: '' });
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
                        <Label className="text-gray-600 text-xs">School*</Label>
                        <Input
                          value={currentEdu.school}
                          onChange={(e) => setCurrentEdu({ ...currentEdu, school: e.target.value })}
                          placeholder="Rhode Island School of Design"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-600 text-xs">Degree*</Label>
                        <Input
                          value={currentEdu.degree}
                          onChange={(e) => setCurrentEdu({ ...currentEdu, degree: e.target.value })}
                          placeholder="Bachelor's in Graphic Design"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-gray-600 text-xs">Start Year</Label>
                        <Select 
                          value={currentEdu.start || ''} 
                          onValueChange={(val) => setCurrentEdu({ ...currentEdu, start: val === 'none' ? '' : val })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {years.map((y) => (
                              <SelectItem key={y} value={y}>{y}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-600 text-xs">End Year*</Label>
                        <Select 
                          value={currentEdu.end || ''} 
                          onValueChange={(val) => setCurrentEdu({ ...currentEdu, end: val })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Present">Present</SelectItem>
                            {years.map((y) => (
                              <SelectItem key={y} value={y}>{y}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-gray-600 text-xs">Location</Label>
                        <Input
                          value={currentEdu.location || ''}
                          onChange={(e) => setCurrentEdu({ ...currentEdu, location: e.target.value })}
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
                        setCurrentWork({ company: '', title: '', startMonth: 'January', start: currentYear.toString(), endMonth: 'January', end: 'Now', location: '', description: '' });
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
                      <Briefcase className="w-16 h-16 text-gray-400" strokeWidth={1} />
                    </div>
                    <Button 
                      variant="secondary" 
                      className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-none rounded-md px-6 py-5 h-auto text-sm"
                      onClick={() => {
                        setCurrentWork({ company: '', title: '', startMonth: 'January', start: currentYear.toString(), endMonth: 'January', end: 'Now', location: '', description: '' });
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
                              href={w.link.startsWith('http') ? w.link : `https://${w.link}`} 
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
                              dangerouslySetInnerHTML={{ __html: w.description }}
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
                        <Label className="text-gray-600 text-xs">Company*</Label>
                        <Input
                          value={currentWork.company}
                          onChange={(e) => setCurrentWork({ ...currentWork, company: e.target.value })}
                          placeholder="Acme Design Studio"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-600 text-xs">Position*</Label>
                        <Input
                          value={currentWork.title}
                          onChange={(e) => setCurrentWork({ ...currentWork, title: e.target.value })}
                          placeholder="Senior Product Designer"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-gray-600 text-xs">Start Date*</Label>
                        <div className="flex gap-2">
                          <Select 
                            value={currentWork.startMonth || ''} 
                            onValueChange={(val) => setCurrentWork({ ...currentWork, startMonth: val })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Month" />
                            </SelectTrigger>
                            <SelectContent>
                              {months.map((m) => (
                                <SelectItem key={m} value={m}>{m}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select 
                            value={currentWork.start || ''} 
                            onValueChange={(val) => setCurrentWork({ ...currentWork, start: val })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                              {years.map((y) => (
                                <SelectItem key={y} value={y}>{y}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-600 text-xs">End Date*</Label>
                        <div className="flex gap-2">
                          {currentWork.end !== 'Now' && (
                            <Select 
                              value={currentWork.endMonth || ''} 
                              onValueChange={(val) => setCurrentWork({ ...currentWork, endMonth: val })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Month" />
                              </SelectTrigger>
                              <SelectContent>
                                {months.map((m) => (
                                  <SelectItem key={m} value={m}>{m}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          <Select 
                            value={currentWork.end || ''} 
                            onValueChange={(val) => setCurrentWork({ ...currentWork, end: val })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Now">Now</SelectItem>
                              {years.map((y) => (
                                <SelectItem key={y} value={y}>{y}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-gray-600 text-xs">Location</Label>
                        <Input
                          value={currentWork.location || ''}
                          onChange={(e) => setCurrentWork({ ...currentWork, location: e.target.value })}
                          placeholder="San Francisco, CA"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-600 text-xs">Link</Label>
                        <Input
                          value={currentWork.link || ''}
                          onChange={(e) => setCurrentWork({ ...currentWork, link: e.target.value })}
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <Label className="text-gray-600 text-xs">Description</Label>
                      <RichTextEditor 
                        content={currentWork.description || ''} 
                        onChange={(val) => setCurrentWork({ ...currentWork, description: val })} 
                      />
                    </div>

                  </div>
                )}
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
                      <MessageCircle className="w-16 h-16 text-gray-400" strokeWidth={1} />
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
                            href={
                              c.link.startsWith('mailto:') 
                                ? c.link 
                                : c.platform.toLowerCase() === 'email' || (c.link.includes('@') && !c.link.includes('://'))
                                  ? `mailto:${c.link}`
                                  : c.link.startsWith('http') 
                                    ? c.link 
                                    : `https://${c.link}`
                            } 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="hover:underline inline-block"
                          >
                            <span className="text-base font-semibold text-gray-900 font-mono">
                              {c.link}
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
                        <Label className="text-gray-600 text-xs">Platform*</Label>
                        <Select 
                          value={currentContact.platform || ''} 
                          onValueChange={(val) => setCurrentContact({ ...currentContact, platform: val })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                          <SelectContent>
                            {['Website', 'Email', 'LinkedIn', 'GitHub', 'X', 'Threads', 'Figma', 'Instagram', 'Bluesky', 'Mastodon', 'Other'].map((p) => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-600 text-xs">Link*</Label>
                        <Input
                          value={currentContact.link || ''}
                          onChange={(e) => setCurrentContact({ ...currentContact, link: e.target.value })}
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
                  <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                </div>

                <div className="space-y-10">
                  {/* Theme Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Appearance</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {['light', 'dark', 'system'].map((t) => (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={cn(
                            "flex flex-col items-center justify-center p-4 border rounded-xl transition-all",
                            theme === t 
                              ? "border-gray-900 bg-gray-50" 
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          )}
                        >
                          <span className="capitalize text-sm font-medium text-gray-900">{t}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="w-full h-px bg-gray-100" />

                  {/* Account Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Account</h3>
                    <div className="flex flex-col gap-4">
                      <Button
                        variant="outline"
                        onClick={async () => {
                          await signOut();
                          window.location.href = '/';
                        }}
                        className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-50 h-12 rounded-xl border-gray-200"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Log out
                      </Button>

                      <div className="p-4 border border-red-100 bg-red-50/50 rounded-xl mt-4">
                        <h4 className="text-red-900 font-semibold text-sm mb-1">Danger Zone</h4>
                        <p className="text-red-600/80 text-xs mb-4">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        <Button
                          variant="destructive"
                          onClick={() => setShowDeleteAccountWarning(true)}
                          className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg h-10 shadow-sm"
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
          {!isFormView && (
            <div className="absolute bottom-0 right-0 w-full p-6 bg-gradient-to-t from-white via-white to-transparent flex justify-end pointer-events-none">
              <Button 
                onClick={handleGlobalSave} 
                disabled={isSaving} 
                className="bg-[#2A2A2A] hover:bg-[#1A1A1A] text-white pointer-events-auto h-9 px-6 rounded-md shadow-sm border-none font-medium"
              >
                {isSaving ? 'Saving...' : 'Done'}
              </Button>
            </div>
          )}

          {activeTab === 'projects' && projectsView === 'form' && (
            <div className="absolute bottom-0 right-0 w-full p-6 bg-gradient-to-t from-white via-white to-transparent flex justify-between items-center pointer-events-none">
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
              
              <div className="flex items-center gap-3 pointer-events-auto">
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
                  disabled={isSaving || !currentProject?.title || !currentProject?.year} 
                  variant="default"
                  className="bg-design-black hover:bg-design-black/90 text-white rounded-full px-6"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'side_projects' && sideProjectsView === 'form' && (
            <div className="absolute bottom-0 right-0 w-full p-6 bg-gradient-to-t from-white via-white to-transparent flex justify-between items-center pointer-events-none">
              <div className="pointer-events-auto">
                {currentSideProject?.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSideProjectToDelete(currentSideProject.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full"
                    disabled={isSaving}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-3 pointer-events-auto">
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
                  disabled={isSaving || !currentSideProject?.title || !currentSideProject?.year} 
                  variant="default"
                  className="bg-design-black hover:bg-design-black/90 text-white rounded-full px-6"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'work' && workView === 'form' && (
            <div className="absolute bottom-0 right-0 w-full p-6 bg-gradient-to-t from-white via-white to-transparent flex justify-between items-center pointer-events-none">
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
              
              <div className="flex items-center gap-3 pointer-events-auto">
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
                  disabled={isSaving || !currentWork?.company || !currentWork?.title || !currentWork?.start || !currentWork?.end} 
                  variant="default"
                  className="bg-design-black hover:bg-design-black/90 text-white rounded-full px-6"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'speaking' && speakingView === 'form' && (
            <div className="absolute bottom-0 right-0 w-full p-6 bg-gradient-to-t from-white via-white to-transparent flex justify-between items-center pointer-events-none">
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
              
              <div className="flex items-center gap-3 pointer-events-auto">
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
                  disabled={isSaving || !currentSpeaking?.title || !currentSpeaking?.year} 
                  variant="default"
                  className="bg-design-black hover:bg-design-black/90 text-white rounded-full px-6"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'education' && eduView === 'form' && (
            <div className="absolute bottom-0 right-0 w-full p-6 bg-gradient-to-t from-white via-white to-transparent flex justify-between items-center pointer-events-none">
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
              
              <div className="flex items-center gap-3 pointer-events-auto">
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
                  disabled={isSaving || !currentEdu?.school || !currentEdu?.degree || !currentEdu?.end} 
                  variant="default"
                  className="bg-design-black hover:bg-design-black/90 text-white rounded-full px-6"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          )}
          {activeTab === 'contact' && contactView === 'form' && (
            <div className="absolute bottom-0 right-0 w-full p-6 bg-gradient-to-t from-white via-white to-transparent flex justify-between items-center pointer-events-none">
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
              
              <div className="flex items-center gap-3 pointer-events-auto">
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
                  disabled={isSaving || !currentContact?.platform || !currentContact?.link} 
                  variant="default"
                  className="bg-design-black hover:bg-design-black/90 text-white rounded-full px-6"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          )}
        </div>

      </DialogContent>
    </Dialog>

    <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
      <AlertDialogContent className="font-mono">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your project.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => projectToDelete && handleDeleteProject(projectToDelete)}
            disabled={isSaving}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSaving ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={showDeleteAccountWarning} onOpenChange={setShowDeleteAccountWarning}>
      <AlertDialogContent className="font-mono max-w-sm rounded-xl p-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-gray-900">Delete Account</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-gray-500 mt-2">
            Are you absolutely sure? This will permanently delete your account, resume data, and username. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-8 flex gap-3 sm:justify-end">
          <AlertDialogCancel disabled={isDeletingAccount} className="rounded-full px-6 border-none bg-transparent hover:bg-gray-100 h-9 text-sm font-medium text-gray-600 m-0">
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

    <AlertDialog open={showUnsavedWarning} onOpenChange={setShowUnsavedWarning}>
      <AlertDialogContent className="font-mono max-w-sm rounded-xl p-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-gray-900">Unsaved changes</AlertDialogTitle>
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

      <AlertDialog open={!!speakingToDelete} onOpenChange={(open) => !open && setSpeakingToDelete(null)}>
        <AlertDialogContent className="max-w-sm rounded-xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Speaking Engagement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this speaking engagement? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => speakingToDelete && handleDeleteSpeaking(speakingToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!eduToDelete} onOpenChange={(open) => !open && setEduToDelete(null)}>
      <AlertDialogContent className="font-mono">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your education.
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

    <AlertDialog open={!!contactToDelete} onOpenChange={(open) => !open && setContactToDelete(null)}>
      <AlertDialogContent className="font-mono">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your contact.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => contactToDelete && handleDeleteContact(contactToDelete)}
            disabled={isSaving}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSaving ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={!!workToDelete} onOpenChange={(open) => !open && setWorkToDelete(null)}>
      <AlertDialogContent className="font-mono">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this work experience.
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
