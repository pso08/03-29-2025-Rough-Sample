/**
 * Load Questions from JSON API Route
 * 
 * This route loads questions from the questions.json file and transforms them
 * to match the application's data model.
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { transformQuestions } from '@/lib/question-transformer';
import { D1Database } from '@cloudflare/workers-types';

export async function GET(request: NextRequest) {
  try {
    // Read the questions.json file
    const filePath = path.join(process.cwd(), 'questions.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(fileContents);
    
    // Transform the questions to match the application's data model
    const transformedQuestions = transformQuestions(jsonData);
    
    // Store the transformed questions in the database
    const db = (process.env.DB as unknown) as D1Database;
    
    // Use a transaction for atomicity
    const tx = db.batch();
    
    for (const question of transformedQuestions) {
      // Insert the question
      tx.add(
        db.prepare('INSERT OR REPLACE INTO questions (id, text, explanation, domain, difficulty, is_multiple_answer, tags) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .bind(
            question.id,
            question.text,
            question.explanation,
            question.domain,
            question.difficulty,
            question.isMultipleAnswer ? 1 : 0,
            question.tags.join(',')
          )
      );
      
      // Delete existing options for this question
      tx.add(
        db.prepare('DELETE FROM question_options WHERE question_id = ?')
          .bind(question.id)
      );
      
      // Insert the options
      for (const option of question.options) {
        const isCorrect = question.correctAnswers.includes(option.id);
        tx.add(
          db.prepare('INSERT INTO question_options (id, question_id, text, is_correct) VALUES (?, ?, ?, ?)')
            .bind(
              option.id,
              question.id,
              option.text,
              isCorrect ? 1 : 0
            )
        );
      }
    }
    
    // Execute the transaction
    await tx.run();
    
    return NextResponse.json({
      success: true,
      message: `Successfully loaded ${transformedQuestions.length} questions from JSON file.`,
      count: transformedQuestions.length
    });
    
  } catch (error) {
    console.error('Error loading questions from JSON:', error);
    return NextResponse.json(
      { error: 'Failed to load questions from JSON file' },
      { status: 500 }
    );
  }
}
