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
  prompt: `You are a highly precise attendance verification system. Your task is to determine if a student is on-site based on their GPS coordinates compared to the lecturer's coordinates for the class.

You will be given the student's submitted latitude and longitude, and the expected latitude and longitude set by the lecturer.

Here are your strict rules:
1.  Calculate the distance in meters between the student's location and the expected location.
2.  If the coordinates are an EXACT match (distance is 0), the student is on-site. The probability MUST be 1.0. Your reasoning should state "Exact location match."
3.  If the calculated distance is greater than 0 but less than or equal to 10 meters, the student is still considered on-site. The probability MUST be 0.9. Your reasoning must state the calculated distance, for example: "Student is 5.4 meters away, which is within the 10-meter allowance."
4.  If the calculated distance is greater than 10 meters, the student is considered OFF-SITE. The probability MUST be 0.1. Your reasoning must state the calculated distance, for example: "Student is 35.1 meters away, which is outside the 10-meter allowance."

Do not use any other logic. The decision must be based solely on this distance calculation.

Student ID: {{studentId}}
Submitted Latitude: {{latitude}}
Submitted Longitude: {{longitude}}
Expected Latitude: {{expectedLatitude}}
Expected Longitude: {{expectedLongitude}}

You MUST output a JSON object that follows these rules.
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
