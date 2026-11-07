import { beforeEach, describe, expect, it } from 'vitest';
import type { ResumeDataSchemaType } from '../resume';
import { useResumeStore } from './useResumeStore';

const project = {
  id: 'p1',
  title: 'Portfoliofy',
  year: '2026',
  hidden: true,
  attachments: [{ id: 'a1', type: 'image' }],
  collaborators: [{ id: 'c1' }],
};

describe('moveItemToSection', () => {
  beforeEach(() => {
    useResumeStore.setState({
      hasUnsavedChanges: false,
      resume: {
        projects: [project, { id: 'p2', title: 'Other', year: '2025' }],
        sideProjects: [{ id: 's1', title: 'Side', year: '2024' }],
      } as unknown as ResumeDataSchemaType,
    });
  });

  it('moves the whole item and marks the profile unsaved', () => {
    useResumeStore
      .getState()
      .moveItemToSection('projects', 'sideProjects', 'p1');

    const { resume, hasUnsavedChanges } = useResumeStore.getState();
    expect(resume?.projects.map((p) => p.id)).toEqual(['p2']);
    expect(resume?.sideProjects.map((p) => p.id)).toEqual(['s1', 'p1']);
    expect(resume?.sideProjects[1]).toEqual(project);
    expect(hasUnsavedChanges).toBe(true);
  });

  it('does nothing for an unknown id', () => {
    const before = useResumeStore.getState().resume;
    useResumeStore
      .getState()
      .moveItemToSection('projects', 'sideProjects', 'nope');

    expect(useResumeStore.getState().resume).toBe(before);
    expect(useResumeStore.getState().hasUnsavedChanges).toBe(false);
  });
});
