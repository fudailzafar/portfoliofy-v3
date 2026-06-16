import React, { useState, useRef } from 'react';
import { FileUp, LoaderCircle, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useResumeStore } from '@/store/useResumeStore';
import { ResumeDataSchemaType } from '@/lib/resume';

export function ImportDataTab() {
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { resume, updateResume } = useResumeStore();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    setIsParsing(true);
    toast.info('Parsing document with AI... This might take a minute.');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/resume/parse', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to parse document');
      }

      if (result.success && result.data && resume) {
        const parsedData = result.data as Partial<ResumeDataSchemaType>;
        
        const mergedData: ResumeDataSchemaType = {
          ...resume,
          header: { 
            ...resume.header, 
            ...parsedData.header,
            skills: parsedData.header?.skills || (parsedData as any).skills || resume.header.skills
          },
          summary: parsedData.summary || resume.summary,
          workExperience: parsedData.workExperience || resume.workExperience,
          education: parsedData.education || resume.education,
          projects: parsedData.projects || resume.projects,
          sideProjects: parsedData.sideProjects || resume.sideProjects,
          speaking: parsedData.speaking || resume.speaking,
          writing: parsedData.writing || resume.writing,
          exhibitions: parsedData.exhibitions || resume.exhibitions,
          features: parsedData.features || resume.features,
          volunteering: parsedData.volunteering || resume.volunteering,
          awards: parsedData.awards || resume.awards,
          certifications: parsedData.certifications || resume.certifications,
        };

        updateResume(mergedData);
        toast.success('Profile updated successfully from document!');
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'An error occurred during import');
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col pb-24">
      <div className="mb-8 flex items-center justify-between border-b border-border-subtle pb-4">
        <h2 className="text-2xl font-bold">Import Data</h2>
      </div>

      <div className="mb-6 rounded-lg bg-surface-2 p-4 text-sm text-content-primary leading-relaxed">
        <span className="font-medium">Tip ✨</span> Upload your Resume PDF directly, or import from LinkedIn by going to your profile, clicking <strong>More</strong>, and selecting <strong>Save to PDF</strong>.
      </div>

      <div 
        className="flex flex-col items-center justify-center border border-dashed border-border-strong rounded-lg p-12 bg-surface-1 hover:bg-surface-2 transition-colors cursor-pointer"
        onClick={() => !isParsing && fileInputRef.current?.click()}
      >
        {isParsing ? (
          <div className="flex flex-col items-center gap-3 text-content-secondary">
            <LoaderCircle className="h-8 w-8 animate-spin text-theme-primary" />
            <p>Extracting data with AI...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-content-secondary">
            <div className="p-3 bg-surface-3 rounded-full">
              <FileUp className="h-6 w-6 text-content-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium text-content-primary">Click to upload PDF</p>
              <p className="text-xs mt-1">Resume or LinkedIn Export (Max 5MB)</p>
            </div>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="application/pdf"
          onChange={handleFileChange}
          disabled={isParsing}
        />
      </div>
    </div>
  );
}
