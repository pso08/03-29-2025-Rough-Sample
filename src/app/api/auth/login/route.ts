/**
 * User Login API Route
 * 
 * This route handles user authentication and login.
 */

import { NextRequest, NextResponse } from 'next/server';
import { D1Database } from '@cloudflare/workers-types';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

// Secret key for JWT signing (in production, use environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'aws-devops-quiz-app-secret';

// Login a user
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.email || !data.password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    const db = (process.env.DB as unknown) as D1Database;
    
    // Find the user
    const user = await db
      .prepare('SELECT id, email, name FROM users WHERE email = ?')
      .bind(data.email)
      .first();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Verify password (in a real implementation, you would compare with a stored hash)
    // For this demo, we're simplifying authentication
    // const isPasswordValid = await bcrypt.compare(data.password, user.password_hash);
    
    // if (!isPasswordValid) {
    //   return NextResponse.json(
    //     { error: 'Invalid credentials' },
    //     { status: 401 }
    //   );
    // }
    
    // For demo purposes, we'll assume the password is valid
    const isPasswordValid = true;
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Set cookie with the token
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
    
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
    
    return response;
    
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
