import React, { useState, useEffect } from 'react';
import { useResumeStore } from '@/store/useResumeStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { FolderCode } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { sortByDateDesc } from '@/lib/resume';

export function ProjectsTab({ 
  years, 
  setProjectToDelete 
}: { 
  years: number[], 
  setProjectToDelete: (id: string) => void 
}) {
  const { resume, updateResume, setIsEditingTab } = useResumeStore();
  const [projectsView, setProjectsView] = useState<'list' | 'form'>('list');

  useEffect(() => {
    setIsEditingTab(projectsView === 'form');
    return () => setIsEditingTab(false);
  }, [projectsView, setIsEditingTab]);
  const [currentProject, setCurrentProject] = useState<any>(null);

  if (!resume) return null;
  const projects = resume.projects || [];

  const handleSave = () => {
    if (!currentProject?.title || !currentProject?.year) return;
    
    const isEdit = !!currentProject.id;
    const newProject = isEdit
      ? currentProject
      : { ...currentProject, id: Date.now().toString() };

    const newProjects = isEdit
      ? projects.map((p: any) => (p.id === currentProject.id ? newProject : p))
      : [...projects, newProject];

    updateResume({ projects: newProjects });
    setProjectsView('list');
    setCurrentProject(null);
  };

  const currentYear = new Date().getFullYear();

  return (
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
          {sortByDateDesc(projects).map((project: any) => (
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
                      className="mt-1 text-sm text-gray-500 line-clamp-2"
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
                  {['Ongoing', ...years].map((y) => (
                    <SelectItem key={y} value={y.toString()}>
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

          <div className="absolute bottom-0 left-0 right-0 p-4 md:px-8 border-t border-gray-100 bg-white flex justify-end z-10">
            <Button
              onClick={handleSave}
              disabled={!currentProject?.title || !currentProject?.year}
              className="bg-[#2A2A2A] hover:bg-[#1A1A1A] text-white h-9 px-6 rounded-md shadow-sm border-none font-medium"
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
