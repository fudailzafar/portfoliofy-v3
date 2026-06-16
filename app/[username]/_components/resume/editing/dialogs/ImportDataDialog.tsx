'use client';

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileUp, LoaderCircle, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useResumeStore } from '@/store/useResumeStore';
import { ResumeDataSchemaType } from '@/lib/resume';

interface ImportDataDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportDataDialog({ open, onOpenChange }: ImportDataDialogProps) {
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // We grab the full resume data to update it
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
        // Deep merge the structured data into our store
        // We'll preserve existing IDs if possible, but for a fresh import
        // we can just overwrite or selectively merge. 
        // For now, let's just do a blanket update of the data but keeping existing sectionOrder/design
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
          // Handle other arrays
          sideProjects: parsedData.sideProjects || resume.sideProjects,
          speaking: parsedData.speaking || resume.speaking,
          writing: parsedData.writing || resume.writing,
          exhibitions: parsedData.exhibitions || resume.exhibitions,
          features: parsedData.features || resume.features,
          volunteering: parsedData.volunteering || resume.volunteering,
          awards: parsedData.awards || resume.awards,
          certifications: parsedData.certifications || resume.certifications,
        };

        // If the parsedData put skills inside header
        if (parsedData.header?.skills) {
          mergedData.header.skills = parsedData.header.skills;
        } else if ((parsedData as any).skills) {
          mergedData.header.skills = (parsedData as any).skills;
        }

        updateResume(mergedData);
        toast.success('Profile updated successfully from document!');
        onOpenChange(false);
      }
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'An error occurred during import');
    } finally {
      setIsParsing(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-surface-1 border-border-strong text-content-primary">
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
          <DialogDescription>
            Upload your Resume or LinkedIn profile to automatically populate your Portfoliofy profile using AI.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          <div className="rounded-lg border border-border-strong bg-surface-2 p-4 text-sm">
            <h4 className="mb-2 font-semibold flex items-center gap-2">
              <Download className="w-4 h-4" /> How to import from LinkedIn:
            </h4>
            <ol className="list-decimal pl-5 space-y-1 text-content-secondary">
              <li>Go to your LinkedIn Profile</li>
              <li>Click the <strong>More</strong> button (next to Message)</li>
              <li>Select <strong>Save to PDF</strong></li>
              <li>Upload the downloaded PDF below</li>
            </ol>
          </div>

          <div 
            className="flex flex-col items-center justify-center border-2 border-dashed border-border-strong rounded-lg p-10 bg-surface-1 hover:bg-surface-2 transition-colors cursor-pointer"
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
      </DialogContent>
    </Dialog>
  );
}
