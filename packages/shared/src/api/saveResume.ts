import { Resume, ResumeData } from '../resume';
import { useResumeStore } from '../store/useResumeStore';
import type { ApiClient } from './client';

/**
 * Saves the editor's data and keeps the store's version in step, so the next
 * save is checked against what the server now holds. Returns the saved profile
 * as it now stands, ready to put in a cache. `base` is the last profile loaded
 * from the server; without one the profile is saved as live.
 */
export async function saveResumeData(
  client: ApiClient,
  resumeData: ResumeData,
  base?: Resume,
): Promise<Resume> {
  const resume: Resume = {
    ...(base ?? { status: 'live' }),
    resumeData,
    version: useResumeStore.getState().resumeVersion,
  };

  const { version } = await client.saveResume(resume);
  useResumeStore.getState().setResumeVersion(version);
  return { ...resume, version };
}
