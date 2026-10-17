'use client';

import { createContext, useContext } from 'react';
import { AttachmentSchemaType } from '@/lib/resume';

// The resume's top-level pages, so page stubs can be resolved anywhere.
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
