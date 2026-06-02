'use client';

import { Button } from '@/components/ui/button';
import { Dropzone } from '@/components/ui/dropzone';
import { Linkedin, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUserActions } from '@/hooks/useUserActions';
import { useEffect, useState } from 'react';
import { CustomSpinner } from '@/components/CustomSpinner';
import LoadingFallback from '@/components/LoadingFallback';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

type FileState =
  | { status: 'empty' }
  | { status: 'saved'; file: { name: string; url: string; size: number } };

export default function UploadPageClient() {
  const router = useRouter();

  const { resumeQuery, uploadResumeMutation } = useUserActions();
  const [fileState, setFileState] = useState<FileState>({ status: 'empty' });

  const resume = resumeQuery.data?.resume;

  // Update fileState whenever resume changes
  useEffect(() => {
    if (resume?.file?.url && resume.file.name && resume.file.size) {
      setFileState({
        status: 'saved',
        file: {
          name: resume.file.name,
          url: resume.file.url,
          size: resume.file.size,
        },
      });
    }
  }, [resume]);

  const handleUploadFile = async (file: File) => {
    uploadResumeMutation.mutate(file);
  };

  const handleReset = () => {
    setFileState({ status: 'empty' });
  };

  if (resumeQuery.isLoading) {
    return <LoadingFallback message="Loading..." />;
  }

  const isUpdating = resumeQuery.isPending || uploadResumeMutation.isPending;

  return (
    <div className="flex flex-1 flex-col items-center gap-6 px-4 py-12">
      <div className="w-full max-w-[438px] text-center font-mono">
        <h1 className="pb-6 text-center text-base">
          Upload a PDF of your LinkedIn or your resume and generate your
          personal site
        </h1>

        <div className="relative mx-2.5">
          {fileState.status !== 'empty' && (
            <button
              onClick={handleReset}
              className="absolute right-2 top-2 z-10 rounded-full p-1 hover:bg-gray-100"
              disabled={isUpdating}
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}

          <Dropzone
            accept={{ 'application/pdf': ['.pdf'] }}
            maxFiles={1}
            icon={
              fileState.status !== 'empty' ? (
                <img src="/uploaded-pdf.svg" className="h-6 w-6" />
              ) : (
                <Linkedin className="h-6 w-6 text-gray-600" />
              )
            }
            title={
              <span className="text-center text-base font-bold text-design-black">
                {fileState.status !== 'empty'
                  ? fileState.file.name
                  : 'Upload PDF'}
              </span>
            }
            description={
              <span className="text-center text-xs font-light text-design-gray">
                {fileState.status !== 'empty'
                  ? `${(fileState.file.size / 1024 / 1024).toFixed(2)} MB`
                  : 'Resume or LinkedIn'}
              </span>
            }
            isUploading={uploadResumeMutation.isPending}
            onDrop={(acceptedFiles) => {
              if (acceptedFiles[0]) handleUploadFile(acceptedFiles[0]);
            }}
            onDropRejected={() => toast.error('Only PDF files are supported')}
          />
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              className="mx-auto mt-3 flex cursor-help flex-row justify-center gap-1.5 border border-transparent text-center font-mono hover:border-gray-200 hover:bg-white"
            >
              <span className="ml-1 inline-block h-4 w-4 cursor-help items-center justify-center rounded-full border border-gray-300 text-xs">
                i
              </span>
              <p className="whitespace-normal text-center text-xs text-design-gray">
                How to upload LinkedIn profile
              </p>
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-w-[652px] gap-0 !p-0 text-center font-mono">
            <DialogTitle className="px-7 py-4 text-center font-mono text-base text-design-gray">
              Go to your profile → Click on “Resources” → Then “Save to PDF”
            </DialogTitle>
            <img src="/linkedin-save-to-pdf.png" className="h-auto w-full" />
          </DialogContent>
        </Dialog>
      </div>
      <div className="font-mono">
        <div className="relative">
          <Button
            className="h-auto bg-design-black px-4 py-3 hover:bg-design-black/95"
            disabled={fileState.status === 'empty' || isUpdating}
            onClick={() => router.push('/pdf')}
          >
            {isUpdating ? (
              <>
                <CustomSpinner className="mr-2 h-5 w-5" />
                Processing...
              </>
            ) : (
              <>
                <img
                  src="/sparkle.png"
                  alt="Sparkle Icon"
                  className="mr-2 h-5 w-5"
                />
                Generate Website
              </>
            )}
          </Button>
          {fileState.status === 'empty' && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="absolute inset-0" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upload a PDF to continue</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
}
