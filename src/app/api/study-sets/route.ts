/**
 * Study Sets API Routes
 * 
 * This file handles creating, retrieving, updating, and deleting study sets.
 */

import { NextRequest, NextResponse } from 'next/server';
import { D1Database } from '@cloudflare/workers-types';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { v4 as uuidv4 } from 'uuid';

// Get user's study sets
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
    const studySetId = searchParams.get('id');
    
    const db = (process.env.DB as unknown) as D1Database;
    
    if (studySetId) {
      // Get a specific study set with its questions
      const studySet = await db
        .prepare('SELECT * FROM study_sets WHERE id = ? AND user_id = ?')
        .bind(studySetId, user.userId)
        .first();
      
      if (!studySet) {
        return NextResponse.json(
          { error: 'Study set not found' },
          { status: 404 }
        );
      }
      
      // Get the questions for this study set
      const studySetQuestions = await db
        .prepare(`
          SELECT q.*
          FROM questions q
          JOIN study_set_questions ssq ON q.id = ssq.question_id
          WHERE ssq.study_set_id = ?
        `)
        .bind(studySetId)
        .all();
      
      // For each question, get its options
      const questionsWithOptions = await Promise.all(
        studySetQuestions.results.map(async (question: any) => {
          const options = await db
            .prepare('SELECT id, text, is_correct FROM question_options WHERE question_id = ?')
            .bind(question.id)
            .all();
          
          // Extract correct answers
          const correctAnswers = options.results
            .filter((option: any) => option.is_correct)
            .map((option: any) => option.id);
          
          // Parse tags
          const tags = question.tags ? question.tags.split(',') : [];
          
          return {
            ...question,
            options: options.results,
            correctAnswers,
            isMultipleAnswer: question.is_multiple_answer === 1,
            tags
          };
        })
      );
      
      return NextResponse.json({
        studySet,
        questions: questionsWithOptions
      });
    } else {
      // Get all study sets for the user
      const studySets = await db
        .prepare('SELECT * FROM study_sets WHERE user_id = ? ORDER BY updated_at DESC')
        .bind(user.userId)
        .all();
      
      return NextResponse.json({
        studySets: studySets.results
      });
    }
    
  } catch (error) {
    console.error('Error fetching study sets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch study sets' },
      { status: 500 }
    );
  }
}

// Create a new study set
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
    if (!data.name) {
      return NextResponse.json(
        { error: 'Study set name is required' },
        { status: 400 }
      );
    }
    
    const db = (process.env.DB as unknown) as D1Database;
    
    // Generate a unique ID for the study set
    const studySetId = uuidv4();
    
    // Create the study set
    await db
      .prepare(`
        INSERT INTO study_sets 
        (id, user_id, name, description, created_at, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `)
      .bind(
        studySetId,
        user.userId,
        data.name,
        data.description || ''
      )
      .run();
    
    // If questions are provided, add them to the study set
    if (data.questionIds && Array.isArray(data.questionIds) && data.questionIds.length > 0) {
      const tx = db.batch();
      
      for (const questionId of data.questionIds) {
        tx.add(
          db.prepare(`
            INSERT INTO study_set_questions 
            (study_set_id, question_id)
            VALUES (?, ?)
          `)
            .bind(studySetId, questionId)
        );
      }
      
      await tx.run();
    }
    
    return NextResponse.json({
      success: true,
      message: 'Study set created successfully',
      studySetId
    });
    
  } catch (error) {
    console.error('Error creating study set:', error);
    return NextResponse.json(
      { error: 'Failed to create study set' },
      { status: 500 }
    );
  }
}

// Update a study set
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
    if (!data.id || !data.name) {
      return NextResponse.json(
        { error: 'Study set ID and name are required' },
        { status: 400 }
      );
    }
    
    const db = (process.env.DB as unknown) as D1Database;
    
    // Check if study set exists and belongs to the user
    const studySet = await db
      .prepare('SELECT id FROM study_sets WHERE id = ? AND user_id = ?')
      .bind(data.id, user.userId)
      .first();
    
    if (!studySet) {
      return NextResponse.json(
        { error: 'Study set not found' },
        { status: 404 }
      );
    }
    
    // Update the study set
    await db
      .prepare(`
        UPDATE study_sets 
        SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(
        data.name,
        data.description || '',
        data.id
      )
      .run();
    
    // If questionIds are provided, update the questions in the study set
    if (data.questionIds && Array.isArray(data.questionIds)) {
      // First, remove all existing questions
      await db
        .prepare('DELETE FROM study_set_questions WHERE study_set_id = ?')
        .bind(data.id)
        .run();
      
      // Then, add the new questions
      if (data.questionIds.length > 0) {
        const tx = db.batch();
        
        for (const questionId of data.questionIds) {
          tx.add(
            db.prepare(`
              INSERT INTO study_set_questions 
              (study_set_id, question_id)
              VALUES (?, ?)
            `)
              .bind(data.id, questionId)
          );
        }
        
        await tx.run();
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Study set updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating study set:', error);
    return NextResponse.json(
      { error: 'Failed to update study set' },
      { status: 500 }
    );
  }
}

// Delete a study set
export async function DELETE(request: NextRequest) {
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
    const studySetId = searchParams.get('id');
    
    if (!studySetId) {
      return NextResponse.json(
        { error: 'Study set ID is required' },
        { status: 400 }
      );
    }
    
    const db = (process.env.DB as unknown) as D1Database;
    
    // Check if study set exists and belongs to the user
    const studySet = await db
      .prepare('SELECT id FROM study_sets WHERE id = ? AND user_id = ?')
      .bind(studySetId, user.userId)
      .first();
    
    if (!studySet) {
      return NextResponse.json(
        { error: 'Study set not found' },
        { status: 404 }
      );
    }
    
    // Delete the study set questions first (due to foreign key constraint)
    await db
      .prepare('DELETE FROM study_set_questions WHERE study_set_id = ?')
      .bind(studySetId)
      .run();
    
    // Delete the study set
    await db
      .prepare('DELETE FROM study_sets WHERE id = ?')
      .bind(studySetId)
      .run();
    
    return NextResponse.json({
      success: true,
      message: 'Study set deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting study set:', error);
    return NextResponse.json(
      { error: 'Failed to delete study set' },
      { status: 500 }
    );
  }
}
