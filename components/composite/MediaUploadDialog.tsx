'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useS3Upload } from 'next-s3-upload';
import { X, Loader2, Equal } from 'lucide-react';
import { AttachmentSchemaType } from '@/lib/resume';
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
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  previewUrl: string;
  type: 'image' | 'video';
  width?: number;
  height?: number;
}

interface MediaUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingAttachments: AttachmentSchemaType[];
  onSave: (attachments: AttachmentSchemaType[]) => void;
}

interface SortableAttachmentProps {
  attachment: AttachmentSchemaType;
  onRemove: (id: string) => void;
}

function SortableAttachmentRow({ attachment, onRemove }: SortableAttachmentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: attachment.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 bg-surface-3 p-3 rounded-lg relative group border border-transparent ${
        isDragging ? 'shadow-lg opacity-80 border-border-hover' : ''
      }`}
    >
      <div className="w-24 h-16 bg-surface-1 rounded overflow-hidden flex-shrink-0">
        {attachment.type === 'video' ? (
          <video src={attachment.url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={attachment.url} alt={attachment.filename || ''} className="w-full h-full object-cover" />
        )}
      </div>
      <div className="flex-1 truncate">
        <p className="text-sm font-medium">{attachment.width} × {attachment.height}</p>
        <p className="text-xs text-content-muted truncate">{attachment.filename}</p>
      </div>
      <button 
        onClick={() => onRemove(attachment.id)}
        className="p-2 text-content-muted hover:text-red-500 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:bg-surface-2 p-1 rounded transition-colors text-content-muted"
      >
        <Equal className="w-4 h-4" />
      </div>
    </div>
  );
}

export function MediaUploadDialog({
  open,
  onOpenChange,
  existingAttachments,
  onSave,
}: MediaUploadDialogProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [uploadedAttachments, setUploadedAttachments] = useState<AttachmentSchemaType[]>([]);
  const { uploadToS3 } = useS3Upload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (open) {
      setUploadedAttachments(existingAttachments);
      setUploadingFiles([]);
    }
  }, [open, existingAttachments]);

  const extractDimensions = (
    file: File,
    type: 'image' | 'video',
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      if (type === 'image') {
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
          URL.revokeObjectURL(url);
        };
        img.src = url;
      } else {
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
          resolve({ width: video.videoWidth, height: video.videoHeight });
          URL.revokeObjectURL(url);
        };
        video.src = url;
      }
    });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newUploads = Array.from(files).filter(
      (file) => file.size <= 30 * 1024 * 1024,
    );

    if (newUploads.length < files.length) {
      alert('Some files are larger than 30MB and were ignored.');
    }

    const newUploadingFiles: UploadingFile[] = newUploads.map((file) => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      previewUrl: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image',
    }));

    setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

    for (const item of newUploadingFiles) {
      try {
        const dimensions = await extractDimensions(item.file, item.type);
        
        setUploadingFiles((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, progress: 50 } : f)),
        );

        const { url } = await uploadToS3(item.file);

        setUploadingFiles((prev) => prev.filter((f) => f.id !== item.id));
        setUploadedAttachments((prev) => [
          ...prev,
          {
            id: item.id,
            url,
            type: item.type,
            filename: item.file.name,
            width: dimensions.width,
            height: dimensions.height,
          },
        ]);
      } catch (error) {
        console.error('Upload failed:', error);
        setUploadingFiles((prev) => prev.filter((f) => f.id !== item.id));
      }
    }
  };

  const handleRemove = (id: string) => {
    setUploadedAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = uploadedAttachments.findIndex((item) => item.id === active.id);
      const newIndex = uploadedAttachments.findIndex((item) => item.id === over.id);
      setUploadedAttachments(arrayMove(uploadedAttachments, oldIndex, newIndex));
    }
  };

  const handleSave = () => {
    if (uploadingFiles.length > 0) {
      alert('Please wait for uploads to finish.');
      return;
    }
    onSave(uploadedAttachments);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-surface-1 border-border-strong text-content-primary p-0 overflow-hidden flex flex-col h-[600px] [&>button]:hidden">
        <DialogTitle className="sr-only">Upload Media</DialogTitle>
        <DialogDescription className="sr-only">
          Upload media attachments
        </DialogDescription>
        
        <div 
          className="flex-1 overflow-y-auto p-6 scrollbar-hide"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
        >
          {(uploadingFiles.length === 0 && uploadedAttachments.length === 0) ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <p className="text-content-secondary text-lg mb-2">
                Add one or more jpg, png, gif, mov, or mp4 file
                <br />
                that is less than 30mb.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
              >
                <SortableContext
                  items={uploadedAttachments.map((a) => a.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {uploadedAttachments.map((att) => (
                      <SortableAttachmentRow
                        key={att.id}
                        attachment={att}
                        onRemove={handleRemove}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {uploadingFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-4 bg-surface-3 p-3 rounded-lg relative opacity-70">
                  <div className="w-24 h-16 bg-surface-1 rounded overflow-hidden flex-shrink-0">
                    {file.type === 'video' ? (
                      <video src={file.previewUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={file.previewUrl} alt={file.file.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-sm font-medium">Uploading...</p>
                    <p className="text-xs text-content-muted truncate">{file.file.name}</p>
                  </div>
                  <Loader2 className="w-4 h-4 animate-spin text-content-muted" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface-1 px-4 pb-4 sm:px-8 md:px-12 md:pb-6 mt-auto z-10">
          <div className="flex w-full items-center justify-between border-t border-border-subtle pt-4">
            <div>
              <input 
                type="file" 
                multiple 
                accept="image/*,video/mp4,video/quicktime" 
                className="hidden" 
                ref={fileInputRef}
                onChange={(e) => handleFiles(e.target.files)}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="h-9 rounded-md border border-border-strong bg-surface-card px-6 font-medium text-content-primary shadow-sm"
              >
                Upload
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleCancel}
                className="px-4 py-2 text-[14px] font-medium text-content-primary hover:underline hover:underline-offset-4"
              >
                Cancel
              </button>
              <Button 
                onClick={handleSave} 
                disabled={uploadingFiles.length > 0}
                variant="outline"
                className="h-9 rounded-md border border-border-strong bg-surface-card px-6 font-medium text-content-primary shadow-sm"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
