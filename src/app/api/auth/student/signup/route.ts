
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { studentId, fullName, email, password } = await req.json();

    if (!studentId || !fullName || !email || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    const existingUser = await UserModel.findOne({ $or: [{ email }, { identifier: studentId }] });
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email or student ID already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      identifier: studentId,
      fullName,
      email,
      password: hashedPassword,
      role: 'student',
    });

    await newUser.save();

    return NextResponse.json({ message: 'Student account created successfully' }, { status: 201 });

  } catch (error) {
    console.error('Signup Error:', error);
    let errorMessage = 'An internal server error occurred';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Server error', error: errorMessage }, { status: 500 });
  }
}
