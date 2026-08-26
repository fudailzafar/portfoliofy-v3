import React, { useState, useRef } from 'react';
import { FileUp } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { useResumeStore } from '@/store/useResumeStore';
import { ResumeDataSchemaType } from '@/lib/resume';

type ExtraFields = { collaborators?: unknown[]; attachments?: unknown[] };

// The AI-parsed re-import has no idea about collaborators/attachments tagged
// on the existing entries (they're portfoliofy-specific fields it never
// sees), so a naive whole-array replace would silently wipe them. Instead,
// match each freshly-parsed item back to an existing one by a stable-ish
// identity key and carry those fields over when there's a match. Items with
// no match (genuinely new entries) simply start with none, same as today.
function mergeSectionPreservingExtras<T extends ExtraFields>(
  parsedItems: T[] | undefined,
  existingItems: T[] | undefined,
  getKey: (item: T) => string,
): T[] | undefined {
  if (!parsedItems) return existingItems;
  if (!existingItems?.length) return parsedItems;

  const existingByKey = new Map(
    existingItems.map((item) => [getKey(item), item]),
  );

  return parsedItems.map((item) => {
    const match = existingByKey.get(getKey(item));
    if (!match) return item;
    return {
      ...item,
      collaborators: match.collaborators?.length
        ? match.collaborators
        : item.collaborators,
      attachments: match.attachments?.length
        ? match.attachments
        : item.attachments,
    };
  });
}

const lower = (v: unknown) =>
  String(v ?? '')
    .trim()
    .toLowerCase();

export function ImportDataTab() {
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { resume, updateResume } = useResumeStore();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
            skills:
              parsedData.header?.skills ||
              (parsedData as any).skills ||
              resume.header.skills,
          },
          summary: parsedData.summary || resume.summary,
          workExperience:
            mergeSectionPreservingExtras(
              parsedData.workExperience,
              resume.workExperience,
              (w) => `${lower(w.company)}|${lower(w.title)}`,
            ) || resume.workExperience,
          education:
            mergeSectionPreservingExtras(
              parsedData.education,
              resume.education,
              (e) => `${lower(e.school)}|${lower(e.degree)}`,
            ) || resume.education,
          projects:
            mergeSectionPreservingExtras(
              parsedData.projects,
              resume.projects,
              (p) => lower(p.title),
            ) || resume.projects,
          sideProjects:
            mergeSectionPreservingExtras(
              parsedData.sideProjects,
              resume.sideProjects,
              (p) => lower(p.title),
            ) || resume.sideProjects,
          speaking:
            mergeSectionPreservingExtras(
              parsedData.speaking,
              resume.speaking,
              (s) => lower(s.title),
            ) || resume.speaking,
          writing:
            mergeSectionPreservingExtras(
              parsedData.writing,
              resume.writing,
              (w) => lower(w.title),
            ) || resume.writing,
          exhibitions:
            mergeSectionPreservingExtras(
              parsedData.exhibitions,
              resume.exhibitions,
              (e) => lower(e.title),
            ) || resume.exhibitions,
          features:
            mergeSectionPreservingExtras(
              parsedData.features,
              resume.features,
              (f) => lower(f.title),
            ) || resume.features,
          volunteering:
            mergeSectionPreservingExtras(
              parsedData.volunteering,
              resume.volunteering,
              (v) => `${lower(v.organization)}|${lower(v.role)}`,
            ) || resume.volunteering,
          awards:
            mergeSectionPreservingExtras(
              parsedData.awards,
              resume.awards,
              (a) => lower(a.title),
            ) || resume.awards,
          certifications:
            mergeSectionPreservingExtras(
              parsedData.certifications,
              resume.certifications,
              (c) => lower(c.title),
            ) || resume.certifications,
        };

        updateResume(mergedData);
        toast.success('Profile updated successfully from document!');
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'An error occurred during import',
      );
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col">
      <div className="mb-8 flex items-center justify-between border-b border-border-subtle pb-4">
        <h2 className="text-2xl font-bold">Import Data</h2>
      </div>

      <div className="mb-6 rounded-lg bg-surface-2 p-4 text-sm leading-relaxed text-content-primary">
        <span className="font-medium">Tip ✨</span> Upload your Resume PDF
        directly, or import from LinkedIn by going to your profile, clicking{' '}
        <strong>More</strong>, and selecting <strong>Save to PDF</strong>.
      </div>

      <div
        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border-strong bg-surface-1 p-12 transition-colors hover:bg-surface-2"
        onClick={() => !isParsing && fileInputRef.current?.click()}
      >
        {isParsing ? (
          <div className="flex flex-col items-center gap-3 text-content-secondary">
            <Spinner size={32} className="text-theme-primary" />
            <p>Extracting data with AI...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-content-secondary">
            <div className="rounded-full bg-surface-3 p-3">
              <FileUp className="h-6 w-6 text-content-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium text-content-primary">
                Click to upload PDF
              </p>
              <p className="mt-1 text-xs">
                Resume or LinkedIn Export (Max 5MB)
              </p>
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
