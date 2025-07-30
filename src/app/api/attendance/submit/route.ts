import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AttendanceModel from '@/models/Attendance';
import UserModel from '@/models/User';
import CourseModel from '@/models/Course';
import { verifyAttendanceLocation } from '@/ai/flows/attendance-location-verification';
import { MOCK_COURSES } from '@/lib/mock-data'; // Using this for class location for now

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

    // 2. Find Course and a-priori Validate Attendance Code
    const course = await CourseModel.findOne({ code: courseCode });
    if (!course) {
      return NextResponse.json({ message: `Course ${courseCode} not found` }, { status: 404 });
    }
    if (course.attendanceCode !== attendanceCode) {
      return NextResponse.json({ message: 'Invalid attendance code' }, { status: 400 });
    }

    // 3. Verify Location using GenAI
    // For this demo, let's use a fixed "expected" location for the class.
    // In a real app, this would come from the course or a scheduling system.
    const EXPECTED_LOCATION = {
        latitude: 6.0224, // Approx. Oko Poly Main Gate
        longitude: 7.0700,
    };
    
    const verificationInput = {
      studentId: student.identifier,
      latitude,
      longitude,
      expectedLatitude: EXPECTED_LOCATION.latitude,
      expectedLongitude: EXPECTED_LOCATION.longitude,
    };

    const verificationResult = await verifyAttendanceLocation(verificationInput);

    // 4. Decide on attendance status based on AI verification
    const isOnSite = verificationResult.isOnSiteProbability > 0.7; // Example threshold
    
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
    
    // Clear the attendance code after successful use
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
