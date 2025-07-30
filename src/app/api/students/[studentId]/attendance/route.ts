'use server';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AttendanceModel from '@/models/Attendance';
import CourseModel from '@/models/Course';
import UserModel from '@/models/User';
import mongoose from 'mongoose';

export async function GET(req: NextRequest, { params }: { params: { studentId: string } }) {
  try {
    await dbConnect();
    const { studentId } = params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return NextResponse.json({ message: 'Invalid student ID format' }, { status: 400 });
    }

    const student = await UserModel.findById(studentId);
    if (!student || student.role !== 'student') {
        return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    const attendanceRecords = await AttendanceModel.find({ studentId: student._id })
      .populate({
          path: 'courseId',
          model: CourseModel,
          select: 'code name'
      })
      .sort({ date: -1 });

    const formattedRecords = attendanceRecords.map(record => {
        const course = record.courseId as any;
        return {
            id: record._id.toString(),
            date: record.date.toISOString(),
            courseCode: course?.code || 'N/A',
            courseName: course?.name || 'Unknown Course',
            status: record.status,
            verifiedLocation: record.verifiedLocation,
            locationScore: record.locationScore,
            remarks: record.remarks,
        }
    });

    return NextResponse.json(formattedRecords, { status: 200 });

  } catch (error) {
    console.error('Get Attendance Error:', error);
    let errorMessage = 'An internal server error occurred';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Server error', error: errorMessage }, { status: 500 });
  }
}
