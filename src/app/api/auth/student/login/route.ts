import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import UserModel from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';


export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const user = await UserModel.findOne({ email, role: 'student' }).select('+password');
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials or not a student account' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, identifier: user.identifier, fullName: user.fullName },
      process.env.JWT_SECRET || 'your_default_jwt_secret',
      { expiresIn: '1d' }
    );

    cookies().set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
        sameSite: 'lax',
    });

    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword,
    }, { status: 200 });

  } catch (error) {
    console.error('Login Error:', error);
    let errorMessage = 'An internal server error occurred';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Server error', error: errorMessage }, { status: 500 });
  }
}
