import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AttendanceModel from '@/models/Attendance';
import UserModel from '@/models/User';
import CourseModel from '@/models/Course';
import { verifyAttendanceLocation } from '@/ai/flows/attendance-location-verification';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { studentId, courseCode, attendanceCode, latitude, longitude } = await req.json();

    if (!studentId || !courseCode || !attendanceCode || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // 1. Find Student
    const student = await UserModel.findOne({ identifier: studentId, role: 'student' });
    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    // 2. Find Course and Validate Attendance Code
    const course = await CourseModel.findOne({ code: courseCode });
    if (!course) {
      return NextResponse.json({ message: `Course ${courseCode} not found` }, { status: 404 });
    }
    if (course.attendanceCode !== attendanceCode) {
      return NextResponse.json({ message: 'Invalid attendance code' }, { status: 400 });
    }
    if (course.latitude === undefined || course.longitude === undefined) {
        return NextResponse.json({ message: 'Lecturer has not set a location for this class yet.' }, { status: 400 });
    }

    // 3. Verify Location using GenAI against the lecturer's captured location
    const verificationInput = {
      studentId: student.identifier,
      latitude,
      longitude,
      expectedLatitude: course.latitude, // Use the lecturer's saved location for this course
      expectedLongitude: course.longitude, // Use the lecturer's saved location for this course
    };

    const verificationResult = await verifyAttendanceLocation(verificationInput);

    // 4. Decide on attendance status based on AI verification
    const isOnSite = verificationResult.isOnSiteProbability > 0.5; // Threshold can be adjusted
    
    // 5. Create and save the attendance record
    const newAttendance = new AttendanceModel({
      studentId: student._id,
      courseId: course._id,
      status: isOnSite ? 'Present' : 'Absent', // Simplified status
      verifiedLocation: isOnSite,
      locationScore: verificationResult.isOnSiteProbability,
      remarks: verificationResult.reasoning,
    });

    await newAttendance.save();
    
    // Clear the attendance code after successful use to prevent reuse
    course.attendanceCode = null;
    await course.save();

    return NextResponse.json({ 
      message: `Attendance recorded as ${newAttendance.status}. On-site probability: ${(newAttendance.locationScore! * 100).toFixed(0)}%.`,
      data: newAttendance
    }, { status: 201 });

  } catch (error) {
    console.error('Attendance Submission Error:', error);
    let errorMessage = 'An internal server error occurred';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Server error', error: errorMessage }, { status: 500 });
  }
}
