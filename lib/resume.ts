import { z } from 'zod';

export const DEFAULT_SECTION_ORDER = [
  'work',
  'side_projects',
  'speaking',
  'features',
  'volunteering',
  'projects',
  'skills',
  'education',
  'contact',
  'awards',
  'certifications',
];

export const normalizeSectionOrder = (order?: string[] | null) => {
  const existingOrder = order || DEFAULT_SECTION_ORDER;
  const missingSections = DEFAULT_SECTION_ORDER.filter(
    (section) => !existingOrder.includes(section),
  );
  return [...existingOrder, ...missingSections];
};

export const sortByDateDesc = <
  T extends {
    startYear?: string;
    start?: string;
    year?: string;
    endYear?: string;
    end?: string | null;
  },
>(
  items?: T[],
): T[] => {
  if (!items) return [];
  return [...items].sort((a, b) => {
    const getEndYear = (item: any) => {
      const y = item.endYear || item.end;
      if (y === 'Now' || y === 'Ongoing' || !y) return 9999;
      return parseInt(y) || 0;
    };
    const getStartYear = (item: any) => {
      const y = item.startYear || item.start || item.year;
      if (y === 'Now' || y === 'Ongoing') return 9999;
      return parseInt(y) || 0;
    };

    // Sort by end year first if it exists
    const aEnd = getEndYear(a);
    const bEnd = getEndYear(b);
    if (aEnd !== bEnd) return bEnd - aEnd;

    // Fallback to start year
    return getStartYear(b) - getStartYear(a);
  });
};

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
  website: z.string().describe('Personal website link').optional(),
  skills: z
    .array(z.string())
    .describe('Skills used within the different jobs the user has had.'),
});

const SummarySection = z.string().describe('Summary of your profile');

const WorkExperienceSection = z.array(
  z.object({
    id: z
      .string()
      .optional()
      .describe('Unique identifier for the work experience'),
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
    start: z.string().describe('Start year'),
    endMonth: z.string().optional().describe('End month'),
    end: z.string().optional().nullable().describe("End year or 'Now'"),
    description: z.string().describe('Job description'),
  }),
);

const EducationSection = z.array(
  z.object({
    id: z
      .string()
      .optional()
      .describe('Unique identifier for the education entry'),
    school: z.string().describe('School or university name'),
    degree: z.string().describe('Degree or certification obtained'),
    start: z.string().describe('Start year'),
    end: z.string().describe('End year'),
    location: z.string().optional().describe('Location of the school'),
    description: z
      .string()
      .optional()
      .describe('Rich text description of education'),
  }),
);

const ProjectSection = z.array(
  z.object({
    id: z.string().optional().describe('Unique identifier for the project'),
    title: z.string().describe('Project title'),
    year: z.string().describe('Year of the project'),
    company: z.string().optional().describe('Company or client name'),
    link: z.string().optional().describe('Link to project'),
    description: z
      .string()
      .optional()
      .describe('Rich text description of the project'),
  }),
);

const ContactSection = z.array(
  z.object({
    id: z.string().optional().describe('Unique identifier for the contact'),
    platform: z
      .string()
      .describe('Platform name (e.g., X, LinkedIn, Email, Custom)'),
    link: z.string().describe('URL to profile'),
  }),
);

const SideProjectSection = z.array(
  z.object({
    id: z
      .string()
      .optional()
      .describe('Unique identifier for the side project'),
    title: z.string().describe('Side project title'),
    year: z.string().describe('Year of the side project'),
    link: z.string().optional().describe('Link to side project'),
    description: z
      .string()
      .optional()
      .describe('Rich text description of the side project'),
  }),
);

const SpeakingSection = z.array(
  z.object({
    id: z
      .string()
      .optional()
      .describe('Unique identifier for the speaking engagement'),
    title: z.string().describe('Speaking engagement title'),
    year: z.string().describe('Year of the engagement'),
    link: z.string().optional().describe('Link to recording or slides'),
    location: z.string().optional().describe('Location or venue name'),
    description: z
      .string()
      .optional()
      .describe('Rich text description of the speaking engagement'),
  }),
);

const FeaturesSection = z.array(
  z.object({
    id: z.string().optional().describe('Unique identifier for the feature'),
    title: z.string().describe('Feature title'),
    year: z.string().describe('Year of the feature'),
    link: z.string().optional().describe('Link to feature'),
    location: z
      .string()
      .optional()
      .describe('Location or place of the feature'),
    description: z
      .string()
      .optional()
      .describe('Rich text description of the feature'),
  }),
);

const VolunteeringSection = z.array(
  z.object({
    id: z
      .string()
      .optional()
      .describe('Unique identifier for the volunteering engagement'),
    role: z.string().describe('Role or title'),
    organization: z.string().describe('Organization or place'),
    startYear: z.string().describe('Start year'),
    endYear: z.string().describe('End year'),
    location: z.string().optional().describe('Location'),
    link: z.string().optional().describe('Link to organization or role'),
    description: z
      .string()
      .optional()
      .describe('Rich text description of the volunteering engagement'),
  }),
);

const AwardsSection = z.array(
  z.object({
    id: z.string().optional().describe('Unique identifier for the award'),
    title: z.string().describe('Award title'),
    issuer: z.string().describe('Issuer of the award'),
    year: z.string().describe('Year the award was received'),
    link: z.string().optional().describe('Link to the award'),
    description: z.string().optional().describe('Description of the award'),
  }),
);

const CertificationsSection = z.array(
  z.object({
    id: z
      .string()
      .optional()
      .describe('Unique identifier for the certification'),
    title: z.string().describe('Certification title'),
    issuer: z.string().describe('Issuing organization'),
    year: z.string().describe('Year the certification was received'),
    link: z.string().optional().describe('Link to the certification'),
    description: z
      .string()
      .optional()
      .describe('Description of the certification'),
  }),
);

export const ResumeDataSchema = z.object({
  header: HeaderSection,
  summary: SummarySection,
  workExperience: WorkExperienceSection,
  education: EducationSection,
  projects: ProjectSection.optional().default([]),
  sideProjects: SideProjectSection.optional().default([]),
  speaking: SpeakingSection.optional().default([]),
  features: FeaturesSection.optional().default([]),
  volunteering: VolunteeringSection.optional().default([]),
  awards: AwardsSection.optional().default([]),
  certifications: CertificationsSection.optional().default([]),
  contacts: ContactSection.optional().default([]),
  sectionOrder: z.array(z.string()).optional().default(DEFAULT_SECTION_ORDER),
  design: z
    .object({
      typography: z.enum(['sans', 'serif', 'mono']).optional().default('sans'),
      theme: z
        .enum([
          'default',
          'brutalist',
          'swiss',
          'klein',
          'red',
          'green',
          'blue',
        ])
        .optional()
        .default('default'),
    })
    .optional()
    .default({ typography: 'sans', theme: 'default' }),
});

export type ResumeDataSchemaType = z.infer<typeof ResumeDataSchema>;
