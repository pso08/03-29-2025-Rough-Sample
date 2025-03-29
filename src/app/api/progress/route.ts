/**
 * User Progress API Routes
 * 
 * This file handles tracking and retrieving user progress on questions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { D1Database } from '@cloudflare/workers-types';
import { getAuthenticatedUser } from '@/lib/auth-utils';

// Get user progress
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    
    const db = (process.env.DB as unknown) as D1Database;
    
    let query = `
      SELECT up.*, q.domain, q.difficulty, q.is_multiple_answer
      FROM user_progress up
      JOIN questions q ON up.question_id = q.id
      WHERE up.user_id = ?
    `;
    
    const queryParams: any[] = [user.userId];
    
    if (domain) {
      query += ' AND q.domain = ?';
      queryParams.push(domain);
    }
    
    const progress = await db
      .prepare(query)
      .bind(...queryParams)
      .all();
    
    // Get domain statistics
    const domainStats = await db
      .prepare(`
        SELECT 
          q.domain,
          COUNT(up.question_id) as total_attempted,
          SUM(CASE WHEN up.is_correct = 1 THEN 1 ELSE 0 END) as correct_count
        FROM user_progress up
        JOIN questions q ON up.question_id = q.id
        WHERE up.user_id = ?
        GROUP BY q.domain
      `)
      .bind(user.userId)
      .all();
    
    // Get weak areas (topics with lowest scores)
    const weakAreas = await db
      .prepare(`
        SELECT 
          q.tags,
          COUNT(up.question_id) as total_attempted,
          SUM(CASE WHEN up.is_correct = 1 THEN 1 ELSE 0 END) as correct_count
        FROM user_progress up
        JOIN questions q ON up.question_id = q.id
        WHERE up.user_id = ? AND q.tags IS NOT NULL AND q.tags != ''
        GROUP BY q.tags
        HAVING total_attempted >= 5
        ORDER BY (correct_count * 100.0 / total_attempted) ASC
        LIMIT 5
      `)
      .bind(user.userId)
      .all();
    
    // Process weak areas to split tags
    const processedWeakAreas = weakAreas.results.map((area: any) => {
      const tags = area.tags.split(',');
      const score = (area.correct_count / area.total_attempted) * 100;
      
      return {
        tags,
        totalAttempted: area.total_attempted,
        correctCount: area.correct_count,
        score: Math.round(score)
      };
    });
    
    return NextResponse.json({
      progress: progress.results,
      domainStats: domainStats.results,
      weakAreas: processedWeakAreas
    });
    
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user progress' },
      { status: 500 }
    );
  }
}

// Update user progress
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.questionId || data.isCorrect === undefined) {
      return NextResponse.json(
        { error: 'Question ID and correctness status are required' },
        { status: 400 }
      );
    }
    
    const db = (process.env.DB as unknown) as D1Database;
    
    // Check if progress record already exists
    const existingProgress = await db
      .prepare('SELECT * FROM user_progress WHERE user_id = ? AND question_id = ?')
      .bind(user.userId, data.questionId)
      .first();
    
    if (existingProgress) {
      // Update existing record
      await db
        .prepare(`
          UPDATE user_progress 
          SET is_correct = ?, attempt_count = attempt_count + 1, 
              last_attempt_date = CURRENT_TIMESTAMP, time_spent = time_spent + ?
          WHERE user_id = ? AND question_id = ?
        `)
        .bind(
          data.isCorrect ? 1 : 0,
          data.timeSpent || 0,
          user.userId,
          data.questionId
        )
        .run();
    } else {
      // Create new record
      await db
        .prepare(`
          INSERT INTO user_progress 
          (user_id, question_id, is_correct, attempt_count, last_attempt_date, time_spent)
          VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP, ?)
        `)
        .bind(
          user.userId,
          data.questionId,
          data.isCorrect ? 1 : 0,
          data.timeSpent || 0
        )
        .run();
    }
    
    return NextResponse.json({
      success: true,
      message: 'Progress updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating user progress:', error);
    return NextResponse.json(
      { error: 'Failed to update user progress' },
      { status: 500 }
    );
  }
}
