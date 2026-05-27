import { z } from 'zod';



const HeaderSection = z.object({
  name: z.string(),
  shortAbout: z.string().describe('Short description of your profile'),
  location: z
    .string()
    .describe("Location with format 'City, Country'")
    .optional(),
  pronouns: z
    .string()
    .describe("Preferred pronouns (e.g., 'He/Him')")
    .optional(),
  website: z
    .string()
    .describe('Personal website link')
    .optional(),
  skills: z
    .array(z.string())
    .describe('Skills used within the different jobs the user has had.'),
});

const SummarySection = z.string().describe('Summary of your profile');

const WorkExperienceSection = z.array(
  z.object({
    id: z.string().optional().describe('Unique identifier for the work experience'),
    company: z.string().describe('Company name'),
    link: z.string().optional().describe('Company website URL'),
    location: z
      .string()
      .describe(
        "Location with format 'City, Country' or could be Hybrid or Remote",
      ),
    contract: z
      .string()
      .optional()
      .describe('Type of work contract like Full-time, Part-time, Contract'),
    title: z.string().describe('Job title'),
    startMonth: z.string().optional().describe('Start month'),
    start: z.string().describe("Start year"),
    endMonth: z.string().optional().describe('End month'),
    end: z
      .string()
      .optional()
      .nullable()
      .describe("End year or 'Now'"),
    description: z.string().describe('Job description'),
  }),
);

const EducationSection = z.array(
  z.object({
    id: z.string().optional().describe('Unique identifier for the education entry'),
    school: z.string().describe('School or university name'),
    degree: z.string().describe('Degree or certification obtained'),
    start: z.string().describe('Start year'),
    end: z.string().describe('End year'),
    location: z.string().optional().describe('Location of the school'),
  }),
);

const ProjectSection = z.array(
  z.object({
    id: z.string().optional().describe('Unique identifier for the project'),
    title: z.string().describe('Project title'),
    year: z.string().describe('Year of the project'),
    company: z.string().optional().describe('Company or client name'),
    link: z.string().optional().describe('Link to project'),
    description: z.string().optional().describe('Rich text description of the project'),
  })
);

const ContactSection = z.array(
  z.object({
    id: z.string().optional().describe('Unique identifier for the contact'),
    platform: z.string().describe('Platform name (e.g., X, LinkedIn, Email, Custom)'),
    link: z.string().describe('URL to profile'),
  })
);

const SideProjectSection = z.array(
  z.object({
    id: z.string().optional().describe('Unique identifier for the side project'),
    title: z.string().describe('Side project title'),
    year: z.string().describe('Year of the side project'),
    link: z.string().optional().describe('Link to side project'),
    description: z.string().optional().describe('Rich text description of the side project'),
  })
);

const SpeakingSection = z.array(
  z.object({
    id: z.string().optional().describe('Unique identifier for the speaking engagement'),
    title: z.string().describe('Speaking engagement title'),
    year: z.string().describe('Year of the engagement'),
    link: z.string().optional().describe('Link to recording or slides'),
    location: z.string().optional().describe('Location or venue name'),
  })
);

export const ResumeDataSchema = z.object({
  header: HeaderSection,
  summary: SummarySection,
  workExperience: WorkExperienceSection,
  education: EducationSection,
  projects: ProjectSection.optional().default([]),
  sideProjects: SideProjectSection.optional().default([]),
  speaking: SpeakingSection.optional().default([]),
  contacts: ContactSection.optional().default([]),
  sectionOrder: z.array(z.string()).optional().default(['work', 'side_projects', 'speaking', 'projects', 'skills', 'education', 'contact', 'awards', 'exhibitions', 'writing']),
});

export type ResumeDataSchemaType = z.infer<typeof ResumeDataSchema>;
