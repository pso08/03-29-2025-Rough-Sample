/**
 * Questions API Route
 * 
 * This route handles retrieving questions from the database.
 */

import { NextRequest, NextResponse } from 'next/server';
import { D1Database } from '@cloudflare/workers-types';

// Get all questions with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const domain = searchParams.get('domain');
    const difficulty = searchParams.get('difficulty');
    const tag = searchParams.get('tag');
    const isMultipleAnswer = searchParams.get('isMultipleAnswer');
    
    const offset = (page - 1) * limit;
    
    const db = (process.env.DB as unknown) as D1Database;
    
    // Build the query with filters
    let query = 'SELECT * FROM questions';
    const queryParams: any[] = [];
    const whereConditions: string[] = [];
    
    if (domain) {
      whereConditions.push('domain = ?');
      queryParams.push(domain);
    }
    
    if (difficulty) {
      whereConditions.push('difficulty = ?');
      queryParams.push(difficulty);
    }
    
    if (tag) {
      whereConditions.push('tags LIKE ?');
      queryParams.push(`%${tag}%`);
    }
    
    if (isMultipleAnswer !== null) {
      whereConditions.push('is_multiple_answer = ?');
      queryParams.push(isMultipleAnswer === 'true' ? 1 : 0);
    }
    
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);
    
    // Execute the query
    const questions = await db
      .prepare(query)
      .bind(...queryParams)
      .all();
    
    // Get the total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM questions';
    if (whereConditions.length > 0) {
      countQuery += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    const countResult = await db
      .prepare(countQuery)
      .bind(...queryParams.slice(0, queryParams.length - 2))
      .first();
    
    const total = countResult?.total || 0;
    
    // For each question, get its options
    const questionsWithOptions = await Promise.all(
      questions.results.map(async (question: any) => {
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
      questions: questionsWithOptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}
