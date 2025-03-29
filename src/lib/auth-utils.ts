/**
 * Authentication Utilities
 * 
 * This file contains utility functions for handling authentication.
 */

import { NextRequest } from 'next/server';
import * as jwt from 'jsonwebtoken';

// Secret key for JWT signing (in production, use environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'aws-devops-quiz-app-secret';

/**
 * Get the authenticated user from the request
 * @param request The Next.js request object
 * @returns The authenticated user or null if not authenticated
 */
export async function getAuthenticatedUser(request: NextRequest) {
  try {
    // Get the token from the cookie
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return null;
    }
    
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      name: string;
    };
    
    return decoded;
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
}

/**
 * Create a JWT token for a user
 * @param user The user object
 * @returns The JWT token
 */
export function createToken(user: { id: string; email: string; name: string }) {
  return jwt.sign(
    { userId: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
