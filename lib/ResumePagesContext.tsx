'use client';

import { createContext, useContext } from 'react';
import { AttachmentSchemaType } from '@/lib/resume';

/**
 * The resume's top-level `pages` array, available anywhere under FullResume
 * without prop-drilling through every section/list-item component. A page
 * attachment inside an item's `attachments` array is just a
 * {id, type:'page'} reference stub — AttachmentsPreview resolves it against
 * this list to render the real title/content/thumbnail.
 */
const ResumePagesContext = createContext<AttachmentSchemaType[]>([]);

export function ResumePagesProvider({
  pages,
  children,
}: {
  pages: AttachmentSchemaType[];
  children: React.ReactNode;
}) {
  return (
    <ResumePagesContext.Provider value={pages}>
      {children}
    </ResumePagesContext.Provider>
  );
}

export function useResumePages(): AttachmentSchemaType[] {
  return useContext(ResumePagesContext);
}
