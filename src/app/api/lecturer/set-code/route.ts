import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CourseModel from '@/models/Course';
import UserModel from '@/models/User';
import { verifyJwt } from '@/lib/utils';
import { cookies } from 'next/headers';

async function getLecturerIdFromToken() {
    const token = cookies().get('auth_token')?.value;
    if (!token) return null;

    try {
        const decoded = await verifyJwt(token);
        if (decoded && decoded.role === 'lecturer') {
            return decoded.userId as string;
        }
        return null;
    } catch (error) {
        return null;
    }
}


export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const lecturerId = await getLecturerIdFromToken();

    if (!lecturerId) {
      return NextResponse.json({ message: 'Authentication required or not a lecturer' }, { status: 401 });
    }

    const { courseCode, attendanceCode, latitude, longitude } = await req.json();

    if (!courseCode || !attendanceCode || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ message: 'Course code, attendance code, and location are required' }, { status: 400 });
    }

    // First, try to find an existing course to get its name.
    // In a real app, courses would likely be pre-populated with names.
    let existingCourse = await CourseModel.findOne({ code: courseCode }).lean();
    
    const courseData = {
        name: existingCourse?.name || courseCode, // Use existing name or default to code
        code: courseCode,
        lecturerId: lecturerId,
        attendanceCode: attendanceCode,
        latitude: latitude,
        longitude: longitude,
    };

    const course = await CourseModel.findOneAndUpdate(
        { code: courseCode },
        { $set: courseData },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ message: 'Attendance code set successfully', course }, { status: 200 });

  } catch (error)
  {
    console.error('Set Code Error:', error);
    let errorMessage = 'An internal server error occurred';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Server error', error: errorMessage }, { status: 500 });
  }
}
