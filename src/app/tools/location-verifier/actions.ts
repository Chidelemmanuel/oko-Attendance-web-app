'use server';

import { verifyAttendanceLocation, type VerifyAttendanceLocationInput, type VerifyAttendanceLocationOutput } from '@/ai/flows/attendance-location-verification';

export async function verifyLocationAction(
  input: VerifyAttendanceLocationInput
): Promise<VerifyAttendanceLocationOutput | { error: string }> {
  try {
    // Basic validation (more robust validation can be added with Zod on the server too)
    if (
      !input.studentId ||
      input.latitude === undefined ||
      input.longitude === undefined ||
      input.expectedLatitude === undefined ||
      input.expectedLongitude === undefined
    ) {
      return { error: 'Missing required fields.' };
    }
    if (
        Math.abs(input.latitude) > 90 || Math.abs(input.expectedLatitude) > 90 ||
        Math.abs(input.longitude) > 180 || Math.abs(input.expectedLongitude) > 180
    ) {
        return { error: 'Invalid latitude or longitude values.' };
    }


    const result = await verifyAttendanceLocation(input);
    return result;
  } catch (e) {
    console.error('Error in verifyLocationAction:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
    return { error: `AI verification failed: ${errorMessage}` };
  }
}