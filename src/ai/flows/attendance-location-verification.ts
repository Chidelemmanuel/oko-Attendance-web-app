'use server';

/**
 * @fileOverview Verifies the location of student attendance submissions using GenAI.
 *
 * - verifyAttendanceLocation - A function that verifies the attendance location.
 * - VerifyAttendanceLocationInput - The input type for the verifyAttendanceLocation function.
 * - VerifyAttendanceLocationOutput - The return type for the verifyAttendanceLocation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyAttendanceLocationInputSchema = z.object({
  studentId: z.string().describe('The ID of the student.'),
  latitude: z.number().describe('The latitude of the attendance submission.'),
  longitude: z.number().describe('The longitude of the attendance submission.'),
  expectedLatitude: z.number().describe('The expected latitude of the location.'),
  expectedLongitude: z.number().describe('The expected longitude of the location.'),
});
export type VerifyAttendanceLocationInput = z.infer<
  typeof VerifyAttendanceLocationInputSchema
>;

const VerifyAttendanceLocationOutputSchema = z.object({
  isOnSiteProbability: z
    .number()
    .min(0)
    .max(1)
    .describe(
      'The probability that the student is on-site, between 0 and 1 inclusive.'
    ),
  reasoning: z
    .string()
    .optional()
    .describe('The reasoning behind the probability score.'),
});
export type VerifyAttendanceLocationOutput = z.infer<
  typeof VerifyAttendanceLocationOutputSchema
>;

export async function verifyAttendanceLocation(
  input: VerifyAttendanceLocationInput
): Promise<VerifyAttendanceLocationOutput> {
  return verifyAttendanceLocationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifyAttendanceLocationPrompt',
  input: {schema: VerifyAttendanceLocationInputSchema},
  output: {schema: VerifyAttendanceLocationOutputSchema},
  prompt: `You are an AI-powered attendance verification system. Your task is to determine the probability that a student is physically on-site for a class based on their submitted GPS coordinates versus the expected coordinates.

Analyze the provided coordinates:
- Student's submitted Latitude: {{latitude}}
- Student's submitted Longitude: {{longitude}}
- Expected Latitude for the class: {{expectedLatitude}}
- Expected Longitude for the class: {{expectedLongitude}}

Consider small discrepancies as potentially acceptable (e.g., due to GPS drift or being in a large lecture hall). A location within a few meters should be considered highly probable. A location that is significantly far away should be considered highly improbable.

Based on your analysis, provide a probability score between 0.0 (definitely not on-site) and 1.0 (definitely on-site). Also provide a brief, clear reasoning for your decision.

Student ID: {{studentId}}
`,
});

const verifyAttendanceLocationFlow = ai.defineFlow(
  {
    name: 'verifyAttendanceLocationFlow',
    inputSchema: VerifyAttendanceLocationInputSchema,
    outputSchema: VerifyAttendanceLocationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
