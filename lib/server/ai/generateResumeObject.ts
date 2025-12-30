import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { ResumeDataSchema } from '@/lib/resume';
import dedent from 'dedent';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? '',
});

export const generateResumeObject = async (resumeText: string) => {
  const startTime = Date.now();
  try {
    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      maxRetries: 1,
      schema: ResumeDataSchema,
      prompt:
        dedent(`You are an expert resume writer. Generate a resume object from the following resume text. Be professional and concise.
    ## Instructions:

    - If the resume text does not include an 'about' section or specfic skills mentioned, please generate appropriate content for these sections based on the context of the resume and based on the job role.
    - For the about section: Create a professional summary that highlights the candidate's experience, expertise, and career objectives.
    - For the skills: Generate a maximum of 10 skills taken from the ones mentioned in the resume text or based on the job role / job title infer some if not present.
    - If the resume doesn't contain the full link to social media website leave the username/link as empty strings to the specific social meda websites. The username never contains any space so make sure to only return the full username for the website otherwise don't return it.

    ## Resume text:

    ${resumeText}
    `),
    });

    const endTime = Date.now();
    console.log(
      `Generating resume object took ${(endTime - startTime) / 1000} seconds`,
    );

    return object;
  } catch (error) {
    console.warn('Impossible generating resume object', error);
    return undefined;
  }
};
