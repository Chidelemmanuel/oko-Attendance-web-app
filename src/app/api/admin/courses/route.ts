
'use server';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import CourseModel from '@/models/Course';
import UserModel from '@/models/User';
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
        
        const courses = await CourseModel.find({})
            .populate({
                path: 'lecturerId',
                model: UserModel,
                select: 'fullName identifier'
            })
            .sort({ code: 1 });

        const formattedCourses = courses.map(course => {
            const lecturer = course.lecturerId as any; // Cast to access populated fields
            return {
                id: course._id.toString(),
                code: course.code,
                name: course.name,
                lecturerName: lecturer?.fullName || 'N/A',
                lecturerId: lecturer?.identifier || 'N/A',
            };
        });

        return NextResponse.json(formattedCourses, { status: 200 });

    } catch (error) {
        console.error('Get All Courses Error:', error);
        let errorMessage = 'An internal server error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json({ message: 'Server error', error: errorMessage }, { status: 500 });
    }
}
