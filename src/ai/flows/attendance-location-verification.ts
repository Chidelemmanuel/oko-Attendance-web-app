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
  prompt: `You are an attendance verification expert.

You are provided with the student's ID, their submitted location (latitude and longitude), and the expected location (latitude and longitude).

Based on this information, you will determine the probability that the student is on-site.

Student ID: {{studentId}}
Submitted Latitude: {{latitude}}
Submitted Longitude: {{longitude}}
Expected Latitude: {{expectedLatitude}}
Expected Longitude: {{expectedLongitude}}

Consider factors such as the distance between the submitted and expected locations. The probability should be between 0 and 1 inclusive.

You MUST output a JSON object that looks like this:
{
  "isOnSiteProbability": 0.95,
  "reasoning": "The student's submitted location is very close to the expected location."
}

Return the probability as a floating point number between 0 and 1. If the locations are the same, it should be 1. If the locations are far apart, it should be close to 0.
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
