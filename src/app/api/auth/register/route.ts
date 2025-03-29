/**
 * User Authentication API Routes
 * 
 * This file handles user registration, login, and session management.
 */

import { NextRequest, NextResponse } from 'next/server';
import { D1Database } from '@cloudflare/workers-types';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

// Secret key for JWT signing (in production, use environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'aws-devops-quiz-app-secret';

// Register a new user
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.email || !data.password || !data.name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }
    
    const db = (process.env.DB as unknown) as D1Database;
    
    // Check if user already exists
    const existingUser = await db
      .prepare('SELECT id FROM users WHERE email = ?')
      .bind(data.email)
      .first();
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    
    // Generate a unique ID for the user
    const userId = uuidv4();
    
    // Create the user
    await db
      .prepare('INSERT INTO users (id, email, name, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)')
      .bind(userId, data.email, data.name)
      .run();
    
    // Create default user settings
    await db
      .prepare(`
        INSERT INTO user_settings 
        (user_id, dark_mode, font_size, auto_flip_timer, show_explanations) 
        VALUES (?, ?, ?, ?, ?)
      `)
      .bind(userId, false, 'medium', 10, true)
      .run();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId, email: data.email, name: data.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Set cookie with the token
    const response = NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: userId,
        email: data.email,
        name: data.name
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
    console.error('Error registering user:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
