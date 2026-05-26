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
import { Pencil, FolderCode, Plus, Trash2, GraduationCap, Briefcase, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  
  // Local state for the general tab
  const [uname, setUname] = useState(username);
  const [displayName, setDisplayName] = useState(resume.header.name || '');
  const [shortAbout, setShortAbout] = useState(resume.header.shortAbout || '');
  const [location, setLocation] = useState(resume.header.location || '');
  const [pronouns, setPronouns] = useState(resume.header.pronouns || '');
  const [website, setWebsite] = useState(resume.header.contacts.website || '');
  const [summary, setSummary] = useState(resume.summary || '');

  // Local state for projects tab
  const [projects, setProjects] = useState(resume.projects || []);
  const [projectsView, setProjectsView] = useState<'list' | 'form'>('list');
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

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

  const [activeTab, setActiveTab] = useState('general');

  const { saveResumeDataMutation, updateUsernameMutation } = useUserActions();

  const handleSaveGeneral = async () => {
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
          contacts: {
            ...resume.header.contacts,
            website,
          },
        },
        summary,
        projects, // ensure projects are preserved
        education,
        workExperience: work,
      };

      await saveResumeDataMutation.mutateAsync(newResumeData);
      toast.success('Profile updated successfully');
      setOpen(false);
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProject = async () => {
    if (!currentProject.title || !currentProject.year) return;
    
    setIsSaving(true);
    try {
      const isEdit = !!currentProject.id;
      const newProject = isEdit ? currentProject : { ...currentProject, id: Date.now().toString() };
      
      const newProjects = isEdit 
        ? projects.map((p: any) => p.id === newProject.id ? newProject : p)
        : [...projects, newProject];
        
      const newResumeData = {
        ...resume,
        projects: newProjects
      };
      
      await saveResumeDataMutation.mutateAsync(newResumeData);
      setProjects(newProjects);
      toast.success('Project saved');
      setProjectsView('list');
      setCurrentProject(null);
    } catch (error) {
       toast.error('Failed to save project');
    } finally {
       setIsSaving(false);
    }
  };

  const handleSaveWork = async () => {
    if (!currentWork.company || !currentWork.title || !currentWork.start || !currentWork.end) return;
    
    setIsSaving(true);
    try {
      const isEdit = !!currentWork.id;
      const newWorkItem = isEdit ? currentWork : { ...currentWork, id: Date.now().toString() };
      
      const newWork = isEdit 
        ? work.map((w: any) => w.id === newWorkItem.id ? newWorkItem : w)
        : [...work, newWorkItem];
        
      const newResumeData = {
        ...resume,
        workExperience: newWork
      };
      
      await saveResumeDataMutation.mutateAsync(newResumeData);
      setWork(newWork);
      toast.success('Work experience saved');
      setWorkView('list');
      setCurrentWork(null);
    } catch (error) {
       toast.error('Failed to save work experience');
    } finally {
       setIsSaving(false);
    }
  };

  const handleDeleteWork = async (id: string) => {
    setIsSaving(true);
    try {
      const newWork = work.filter((w: any) => w.id !== id);
      const newResumeData = {
        ...resume,
        workExperience: newWork
      };
      await saveResumeDataMutation.mutateAsync(newResumeData);
      setWork(newWork);
      toast.success('Work experience deleted');
      setWorkView('list');
      setCurrentWork(null);
    } catch (error) {
      toast.error('Failed to delete work experience');
    } finally {
      setIsSaving(false);
      setWorkToDelete(null);
    }
  };

  const handleSaveEdu = async () => {
    if (!currentEdu.school || !currentEdu.degree || !currentEdu.end) return;
    
    setIsSaving(true);
    try {
      const isEdit = !!currentEdu.id;
      const newEduItem = isEdit ? currentEdu : { ...currentEdu, id: Date.now().toString() };
      
      const newEducation = isEdit 
        ? education.map((e: any) => e.id === newEduItem.id ? newEduItem : e)
        : [...education, newEduItem];
        
      const newResumeData = {
        ...resume,
        education: newEducation
      };
      
      await saveResumeDataMutation.mutateAsync(newResumeData);
      setEducation(newEducation);
      toast.success('Education saved');
      setEduView('list');
      setCurrentEdu(null);
    } catch (error) {
       toast.error('Failed to save education');
    } finally {
       setIsSaving(false);
    }
  };

  const handleDeleteEdu = async (id: string) => {
    setIsSaving(true);
    try {
      const newEducation = education.filter((e: any) => e.id !== id);
      const newResumeData = {
        ...resume,
        education: newEducation
      };
      await saveResumeDataMutation.mutateAsync(newResumeData);
      setEducation(newEducation);
      toast.success('Education deleted');
      setEduView('list');
      setCurrentEdu(null);
    } catch (error) {
      toast.error('Failed to delete education');
    } finally {
      setIsSaving(false);
      setEduToDelete(null);
    }
  };

  const handleDeleteProject = async (id: string) => {
    setIsSaving(true);
    try {
      const newProjects = projects.filter((p: any) => p.id !== id);
      const newResumeData = {
        ...resume,
        projects: newProjects
      };
      await saveResumeDataMutation.mutateAsync(newResumeData);
      setProjects(newProjects);
      toast.success('Project deleted');
      setProjectsView('list');
      setCurrentProject(null);
    } catch (error) {
      toast.error('Failed to delete project');
    } finally {
      setIsSaving(false);
      setProjectToDelete(null);
    }
  };

  const SIDEBAR_TABS = [
    { label: 'Profile', isLabel: true },
    { id: 'general', label: 'General', disabled: false },
    { id: 'work', label: 'Work Experience', disabled: false },
    { id: 'side_projects', label: 'Side Projects', disabled: true },
    { id: 'projects', label: 'Projects', disabled: false },
    { id: 'features', label: 'Features', disabled: true },
    { id: 'education', label: 'Education', disabled: false },
    { id: 'contact', label: 'Contact', disabled: true },
    { id: 'awards', label: 'Awards', disabled: true },
    { id: 'exhibitions', label: 'Exhibitions', disabled: true },
    { id: 'speaking', label: 'Speaking', disabled: true },
    { id: 'writing', label: 'Writing', disabled: true },
    { label: 'Account', isLabel: true },
    { id: 'settings', label: 'Settings', disabled: true },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from(new Array(50), (val, index) => (currentYear - index).toString());
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <>
    <Dialog open={open} onOpenChange={setOpen}>
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
                        className="pl-36"
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
                      onChange={(e) => setDisplayName(e.target.value)}
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
                      onChange={(e) => setShortAbout(e.target.value)}
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
                      onChange={(e) => setLocation(e.target.value)}
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
                      onChange={(e) => setPronouns(e.target.value)}
                      placeholder="e.g. He/Him"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="website" className="text-gray-600 text-xs">Website</Label>
                      <span className="text-xs text-gray-400">{website.length} of 96</span>
                    </div>
                    <Input
                      id="website"
                      maxLength={96}
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="your-website.com"
                    />
                  </div>

                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    <Label className="text-gray-600 text-xs">About</Label>
                    <RichTextEditor content={summary} onChange={setSummary} />
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
          </div>

          {/* Bottom Fixed Action Bar */}
          {activeTab === 'general' && (
            <div className="absolute bottom-0 right-0 w-full p-6 bg-gradient-to-t from-white via-white to-transparent flex justify-end pointer-events-none">
              <Button 
                onClick={handleSaveGeneral} 
                disabled={isSaving} 
                variant="outline"
                className="bg-white pointer-events-auto h-10 px-6 rounded-full shadow-sm hover:bg-gray-50 border-gray-200"
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

    <AlertDialog open={!!eduToDelete} onOpenChange={(open) => !open && setEduToDelete(null)}>
      <AlertDialogContent className="font-mono">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this education entry.
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
