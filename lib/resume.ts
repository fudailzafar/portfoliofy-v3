import { z } from 'zod';

const HeaderContactsSchema = z.object({
  website: z.string().describe('Personal website or portfolio URL').optional(),
  email: z.string().describe('Email address').optional(),
  phone: z.string().describe('Phone number').optional(),
  twitter: z.string().describe('Twitter/X username').optional(),
  linkedin: z.string().describe('LinkedIn username').optional(),
  github: z.string().describe('GitHub username').optional(),
});

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
  contacts: HeaderContactsSchema,
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

export const ResumeDataSchema = z.object({
  header: HeaderSection,
  summary: SummarySection,
  workExperience: WorkExperienceSection,
  education: EducationSection,
  projects: ProjectSection.optional().default([]),
});

export type ResumeDataSchemaType = z.infer<typeof ResumeDataSchema>;
