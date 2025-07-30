'use server';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    // In a real app with many users, you'd want pagination here.
    const students = await UserModel.find({ role: 'student' }).select('identifier fullName email');

    const formattedStudents = students.map(student => ({
      id: student._id.toString(),
      studentId: student.identifier,
      name: student.fullName,
      email: student.email,
      // Add other fields as necessary, like department if it exists on the model
    }));

    return NextResponse.json(formattedStudents, { status: 200 });

  } catch (error) {
    console.error('Get Students Error:', error);
    let errorMessage = 'An internal server error occurred';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Server error', error: errorMessage }, { status: 500 });
  }
}
