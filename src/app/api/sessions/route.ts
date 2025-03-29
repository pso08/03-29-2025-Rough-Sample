/**
 * Study Sessions API Routes
 * 
 * This file handles creating, retrieving, and updating study sessions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { D1Database } from '@cloudflare/workers-types';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { v4 as uuidv4 } from 'uuid';

// Get user's study sessions
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
    const sessionId = searchParams.get('sessionId');
    
    const db = (process.env.DB as unknown) as D1Database;
    
    if (sessionId) {
      // Get a specific session with its questions
      const session = await db
        .prepare('SELECT * FROM study_sessions WHERE id = ? AND user_id = ?')
        .bind(sessionId, user.userId)
        .first();
      
      if (!session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
      
      // Get the questions for this session
      const sessionQuestions = await db
        .prepare(`
          SELECT sq.*, q.text, q.domain, q.difficulty, q.is_multiple_answer
          FROM session_questions sq
          JOIN questions q ON sq.question_id = q.id
          WHERE sq.session_id = ?
          ORDER BY sq.id
        `)
        .bind(sessionId)
        .all();
      
      // For each question, get its options
      const questionsWithOptions = await Promise.all(
        sessionQuestions.results.map(async (question: any) => {
          const options = await db
            .prepare('SELECT id, text, is_correct FROM question_options WHERE question_id = ?')
            .bind(question.question_id)
            .all();
          
          return {
            ...question,
            options: options.results
          };
        })
      );
      
      return NextResponse.json({
        session,
        questions: questionsWithOptions
      });
    } else {
      // Get all sessions for the user
      const sessions = await db
        .prepare('SELECT * FROM study_sessions WHERE user_id = ? ORDER BY start_time DESC')
        .bind(user.userId)
        .all();
      
      return NextResponse.json({
        sessions: sessions.results
      });
    }
    
  } catch (error) {
    console.error('Error fetching study sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch study sessions' },
      { status: 500 }
    );
  }
}

// Create a new study session
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
    if (!data.mode) {
      return NextResponse.json(
        { error: 'Study mode is required' },
        { status: 400 }
      );
    }
    
    const db = (process.env.DB as unknown) as D1Database;
    
    // Generate a unique ID for the session
    const sessionId = uuidv4();
    
    // Create the session
    await db
      .prepare(`
        INSERT INTO study_sessions 
        (id, user_id, start_time, mode, topics)
        VALUES (?, ?, CURRENT_TIMESTAMP, ?, ?)
      `)
      .bind(
        sessionId,
        user.userId,
        data.mode,
        data.topics ? data.topics.join(',') : null
      )
      .run();
    
    // If questions are provided, add them to the session
    if (data.questionIds && Array.isArray(data.questionIds) && data.questionIds.length > 0) {
      const tx = db.batch();
      
      for (const questionId of data.questionIds) {
        tx.add(
          db.prepare(`
            INSERT INTO session_questions 
            (session_id, question_id)
            VALUES (?, ?)
          `)
            .bind(sessionId, questionId)
        );
      }
      
      await tx.run();
    } else {
      // If no questions are provided, select questions based on mode and topics
      let query = `
        SELECT id FROM questions
      `;
      
      const queryParams: any[] = [];
      const whereConditions: string[] = [];
      
      if (data.topics && Array.isArray(data.topics) && data.topics.length > 0) {
        // Filter by topics (domains)
        whereConditions.push(`domain IN (${data.topics.map(() => '?').join(', ')})`);
        queryParams.push(...data.topics);
      }
      
      if (data.difficulty) {
        whereConditions.push('difficulty = ?');
        queryParams.push(data.difficulty);
      }
      
      if (whereConditions.length > 0) {
        query += ' WHERE ' + whereConditions.join(' AND ');
      }
      
      // Add randomization and limit
      query += ' ORDER BY RANDOM()';
      
      if (data.limit && !isNaN(parseInt(data.limit))) {
        query += ' LIMIT ?';
        queryParams.push(parseInt(data.limit));
      } else {
        // Default limits based on mode
        if (data.mode === 'quiz') {
          query += ' LIMIT 20'; // Default 20 questions for quiz mode
        } else if (data.mode === 'test') {
          query += ' LIMIT 65'; // Default 65 questions for test mode (like the real exam)
        } else {
          query += ' LIMIT 50'; // Default 50 questions for flashcard mode
        }
      }
      
      const selectedQuestions = await db
        .prepare(query)
        .bind(...queryParams)
        .all();
      
      // Add selected questions to the session
      if (selectedQuestions.results.length > 0) {
        const tx = db.batch();
        
        for (const question of selectedQuestions.results) {
          tx.add(
            db.prepare(`
              INSERT INTO session_questions 
              (session_id, question_id)
              VALUES (?, ?)
            `)
              .bind(sessionId, question.id)
          );
        }
        
        await tx.run();
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Study session created successfully',
      sessionId
    });
    
  } catch (error) {
    console.error('Error creating study session:', error);
    return NextResponse.json(
      { error: 'Failed to create study session' },
      { status: 500 }
    );
  }
}

// Update a study session (e.g., mark as completed)
export async function PUT(request: NextRequest) {
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
    if (!data.sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    const db = (process.env.DB as unknown) as D1Database;
    
    // Check if session exists and belongs to the user
    const session = await db
      .prepare('SELECT id FROM study_sessions WHERE id = ? AND user_id = ?')
      .bind(data.sessionId, user.userId)
      .first();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Update the session
    let query = 'UPDATE study_sessions SET';
    const queryParams: any[] = [];
    
    if (data.endTime) {
      query += ' end_time = CURRENT_TIMESTAMP,';
    }
    
    if (data.questionsAttempted !== undefined) {
      query += ' questions_attempted = ?,';
      queryParams.push(data.questionsAttempted);
    }
    
    if (data.correctAnswers !== undefined) {
      query += ' correct_answers = ?,';
      queryParams.push(data.correctAnswers);
    }
    
    // Remove trailing comma
    query = query.slice(0, -1);
    
    query += ' WHERE id = ?';
    queryParams.push(data.sessionId);
    
    await db
      .prepare(query)
      .bind(...queryParams)
      .run();
    
    return NextResponse.json({
      success: true,
      message: 'Study session updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating study session:', error);
    return NextResponse.json(
      { error: 'Failed to update study session' },
      { status: 500 }
    );
  }
}
