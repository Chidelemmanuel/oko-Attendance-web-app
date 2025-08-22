
'use server';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
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
        
        const users = await UserModel.find({}).sort({ role: 1, fullName: 1 });

        const formattedUsers = users.map(user => ({
            id: user._id.toString(),
            identifier: user.identifier,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
        }));

        return NextResponse.json(formattedUsers, { status: 200 });

    } catch (error) {
        console.error('Get All Users Error:', error);
        let errorMessage = 'An internal server error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json({ message: 'Server error', error: errorMessage }, { status: 500 });
    }
}
