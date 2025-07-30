import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CourseModel from '@/models/Course';
import UserModel from '@/models/User';
import jwt from 'jsonwebtoken';

// This is a simplified version. In a real app, you'd get the lecturer's ID from a verified JWT.
async function getLecturerIdFromToken(req: NextRequest) {
    // For now, let's assume a mock lecturer for simplicity.
    // In a real app, you'd do something like this:
    // const authHeader = req.headers.get('authorization');
    // if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    // const token = authHeader.split(' ')[1];
    // try {
    //   const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    //   return (decoded as any).userId;
    // } catch (error) {
    //   return null;
    // }
    
    // Find a mock lecturer to associate the course with
    let lecturer = await UserModel.findOne({ role: 'lecturer' });
    // If no lecturer exists, create one for testing purposes
    if (!lecturer) {
        lecturer = await new UserModel({
            identifier: 'FPO/STAFF/001',
            fullName: 'Dr. Mock Lecturer',
            email: 'lecturer@example.com',
            password: 'password123', // Not hashed as this is for testing association
            role: 'lecturer'
        }).save();
    }
    return lecturer._id;
}


export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const lecturerId = await getLecturerIdFromToken(req);

    if (!lecturerId) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const { courseCode, attendanceCode } = await req.json();

    if (!courseCode || !attendanceCode) {
      return NextResponse.json({ message: 'Course code and attendance code are required' }, { status: 400 });
    }

    const courseData = {
        name: courseCode, // Assuming name is same as code for simplicity
        lecturerId: lecturerId,
        attendanceCode: attendanceCode,
    };

    const course = await CourseModel.findOneAndUpdate(
        { code: courseCode, lecturerId: lecturerId },
        { $set: courseData },
        { new: true, upsert: true } // upsert: true creates the doc if it doesn't exist
    );

    return NextResponse.json({ message: 'Attendance code set successfully', course }, { status: 200 });

  } catch (error) {
    console.error('Set Code Error:', error);
    let errorMessage = 'An internal server error occurred';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Server error', error: errorMessage }, { status: 500 });
  }
}
