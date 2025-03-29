/**
 * API Route for Database Initialization
 * 
 * This route initializes the database schema and loads initial data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { D1Database } from '@cloudflare/workers-types';

export async function GET(request: NextRequest) {
  try {
    const db = (process.env.DB as unknown) as D1Database;
    
    // Create tables
    await db.exec(`
      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        text TEXT NOT NULL,
        explanation TEXT,
        domain TEXT,
        difficulty TEXT,
        is_multiple_answer INTEGER DEFAULT 0,
        tags TEXT
      );
      
      CREATE TABLE IF NOT EXISTS question_options (
        id TEXT,
        question_id TEXT,
        text TEXT NOT NULL,
        is_correct INTEGER DEFAULT 0,
        PRIMARY KEY (id, question_id),
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS pdf_processing_jobs (
        id TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully'
    });
    
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database' },
      { status: 500 }
    );
  }
}
