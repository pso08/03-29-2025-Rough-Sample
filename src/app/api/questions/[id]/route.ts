/**
 * Question Detail API Route
 * 
 * This route handles retrieving, updating, and deleting a specific question.
 */

import { NextRequest, NextResponse } from 'next/server';
import { D1Database } from '@cloudflare/workers-types';

// Get a specific question by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      );
    }
    
    const db = (process.env.DB as unknown) as D1Database;
    
    // Get the question
    const question = await db
      .prepare('SELECT * FROM questions WHERE id = ?')
      .bind(id)
      .first();
    
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }
    
    // Get the options for this question
    const options = await db
      .prepare('SELECT id, text, is_correct FROM question_options WHERE question_id = ?')
      .bind(id)
      .all();
    
    // Extract correct answers
    const correctAnswers = options.results
      .filter((option: any) => option.is_correct)
      .map((option: any) => option.id);
    
    // Parse tags
    const tags = question.tags ? question.tags.split(',') : [];
    
    // Combine question and options
    const questionWithOptions = {
      ...question,
      options: options.results,
      correctAnswers,
      isMultipleAnswer: question.is_multiple_answer === 1,
      tags
    };
    
    return NextResponse.json(questionWithOptions);
    
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json(
      { error: 'Failed to fetch question' },
      { status: 500 }
    );
  }
}

// Update a specific question
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.text || !data.options || !data.correctAnswers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const db = (process.env.DB as unknown) as D1Database;
    
    // Check if question exists
    const existingQuestion = await db
      .prepare('SELECT id FROM questions WHERE id = ?')
      .bind(id)
      .first();
    
    if (!existingQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }
    
    // Update the question
    await db
      .prepare(`
        UPDATE questions 
        SET text = ?, explanation = ?, domain = ?, difficulty = ?, 
            is_multiple_answer = ?, tags = ?
        WHERE id = ?
      `)
      .bind(
        data.text,
        data.explanation,
        data.domain,
        data.difficulty,
        data.isMultipleAnswer ? 1 : 0,
        data.tags.join(','),
        id
      )
      .run();
    
    // Delete existing options
    await db
      .prepare('DELETE FROM question_options WHERE question_id = ?')
      .bind(id)
      .run();
    
    // Insert new options
    const tx = db.batch();
    
    for (const option of data.options) {
      const isCorrect = data.correctAnswers.includes(option.id);
      tx.add(
        db.prepare('INSERT INTO question_options (id, question_id, text, is_correct) VALUES (?, ?, ?, ?)')
          .bind(
            option.id,
            id,
            option.text,
            isCorrect ? 1 : 0
          )
      );
    }
    
    await tx.run();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Question updated successfully' 
    });
    
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    );
  }
}

// Delete a specific question
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      );
    }
    
    const db = (process.env.DB as unknown) as D1Database;
    
    // Check if question exists
    const existingQuestion = await db
      .prepare('SELECT id FROM questions WHERE id = ?')
      .bind(id)
      .first();
    
    if (!existingQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }
    
    // Delete options first (due to foreign key constraint)
    await db
      .prepare('DELETE FROM question_options WHERE question_id = ?')
      .bind(id)
      .run();
    
    // Delete the question
    await db
      .prepare('DELETE FROM questions WHERE id = ?')
      .bind(id)
      .run();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Question deleted successfully' 
    });
    
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    );
  }
}
