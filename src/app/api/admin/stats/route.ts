
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/models/User';
import CourseModel from '@/models/Course';
import { verifyJwt } from '@/lib/utils';
import { cookies } from 'next/headers';

async function isAdmin() {
    const token = cookies().get('auth_token')?.value;
    if (!token) return false;
    const decoded = await verifyJwt(token);
    return decoded && decoded.role === 'admin';
}

export async function GET(req: NextRequest) {
  if (!await isAdmin()) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();

    const totalStudents = await UserModel.countDocuments({ role: 'student' });
    const totalLecturers = await UserModel.countDocuments({ role: 'lecturer' });
    const totalAdmins = await UserModel.countDocuments({ role: 'admin' });
    const totalCourses = await CourseModel.countDocuments();
    
    return NextResponse.json({
      totalStudents,
      totalLecturers,
      totalAdmins,
      totalCourses,
    }, { status: 200 });

  } catch (error) {
    console.error('Admin Stats Error:', error);
    let errorMessage = 'An internal server error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Server error', error: errorMessage }, { status: 500 });
  }
}
