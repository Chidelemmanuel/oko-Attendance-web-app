import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/models/User';
import AttendanceModel from '@/models/Attendance';
import { startOfToday } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // Total Students
    const totalStudents = await UserModel.countDocuments({ role: 'student' });

    // Today's Present
    const today = startOfToday();
    const todayPresent = await AttendanceModel.countDocuments({
      status: 'Present',
      createdAt: { $gte: today },
    });

    // Flagged Locations (All time)
    const flaggedLocations = await AttendanceModel.countDocuments({
      verifiedLocation: false,
    });

    // Average Attendance (All time)
    const allAttendanceRecords = await AttendanceModel.find({}, 'status').lean();
    const totalRecords = allAttendanceRecords.length;
    const presentRecords = allAttendanceRecords.filter(r => r.status === 'Present').length;
    const averageAttendance = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0;
    
    return NextResponse.json({
      totalStudents,
      averageAttendance: Math.round(averageAttendance),
      todayPresent,
      flaggedLocations,
    }, { status: 200 });

  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    let errorMessage = 'An internal server error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Server error', error: errorMessage }, { status: 500 });
  }
}
