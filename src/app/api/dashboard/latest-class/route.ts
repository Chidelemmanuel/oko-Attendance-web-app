
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CourseModel from '@/models/Course';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Find the course that was most recently updated and has an attendance code
    const latestCourse = await CourseModel.findOne({ 
        attendanceCode: { $ne: null },
        latitude: { $ne: null },
        longitude: { $ne: null },
     })
      .sort({ updatedAt: -1 })
      .select('code latitude longitude')
      .lean();

    if (!latestCourse) {
      return NextResponse.json({ message: 'No recently activated class found' }, { status: 404 });
    }
    
    return NextResponse.json(latestCourse, { status: 200 });

  } catch (error) {
    console.error('Latest Class Error:', error);
    let errorMessage = 'An internal server error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Server error', error: errorMessage }, { status: 500 });
  }
}

