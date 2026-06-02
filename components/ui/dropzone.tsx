'use client';

import * as React from 'react';
import { useDropzone, type DropzoneOptions } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { FileUp, Loader2 } from 'lucide-react';

interface DropzoneProps extends Omit<DropzoneOptions, 'disabled'> {
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  isUploading?: boolean;
}

export function Dropzone({
  className,
  disabled = false,
  icon,
  title,
  description,
  isUploading = false,
  ...props
}: DropzoneProps) {
  const [files, setFiles] = React.useState<File[]>([]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    disabled: disabled || isUploading,
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles);
    },
    ...props,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-16 text-center transition-colors',
        isDragActive && 'border-primary bg-primary/5',
        (disabled || isUploading) && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <input {...getInputProps()} />

      {/* Drag animation overlay */}
      {isDragActive && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
          <div className="animate-bounce p-4">
            <FileUp className="h-16 w-16 text-primary" />
          </div>
        </div>
      )}

      {/* Upload spinner overlay */}
      {isUploading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )}

      {files.length > 0 ? (
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-md bg-gray-100 p-3">{icon}</div>
          <div className="mt-2 text-lg font-medium">{files[0].name}</div>
          <p className="text-sm text-gray-500">
            {(files[0].size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-md bg-gray-100 p-3">{icon}</div>
          <h2 className="mt-2 text-lg font-medium">{title}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </>
      )}
    </div>
  );
}
