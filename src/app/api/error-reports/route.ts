/**
 * Error Report API Routes
 * 
 * This file handles creating, retrieving, and updating error reports for questions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { D1Database } from '@cloudflare/workers-types';
import { getAuthenticatedUser } from '@/lib/auth-utils';
import { v4 as uuidv4 } from 'uuid';

// Get error reports
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
    const questionId = searchParams.get('questionId');
    
    const db = (process.env.DB as unknown) as D1Database;
    
    let query = `
      SELECT er.*, q.text as question_text
      FROM error_reports er
      JOIN questions q ON er.question_id = q.id
      WHERE er.user_id = ?
    `;
    
    const queryParams: any[] = [user.userId];
    
    if (questionId) {
      query += ' AND er.question_id = ?';
      queryParams.push(questionId);
    }
    
    query += ' ORDER BY er.created_at DESC';
    
    const reports = await db
      .prepare(query)
      .bind(...queryParams)
      .all();
    
    return NextResponse.json({
      reports: reports.results
    });
    
  } catch (error) {
    console.error('Error fetching error reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch error reports' },
      { status: 500 }
    );
  }
}

// Create a new error report
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
    if (!data.questionId || !data.description) {
      return NextResponse.json(
        { error: 'Question ID and description are required' },
        { status: 400 }
      );
    }
    
    const db = (process.env.DB as unknown) as D1Database;
    
    // Check if question exists
    const question = await db
      .prepare('SELECT id FROM questions WHERE id = ?')
      .bind(data.questionId)
      .first();
    
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }
    
    // Generate a unique ID for the report
    const reportId = uuidv4();
    
    // Create the error report
    await db
      .prepare(`
        INSERT INTO error_reports 
        (id, question_id, user_id, description, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `)
      .bind(
        reportId,
        data.questionId,
        user.userId,
        data.description
      )
      .run();
    
    return NextResponse.json({
      success: true,
      message: 'Error report submitted successfully',
      reportId
    });
    
  } catch (error) {
    console.error('Error creating error report:', error);
    return NextResponse.json(
      { error: 'Failed to submit error report' },
      { status: 500 }
    );
  }
}

// Update an error report status (admin only)
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
    
    // In a real application, check if user is an admin
    // For this demo, we'll allow any authenticated user to update report status
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.reportId || !data.status) {
      return NextResponse.json(
        { error: 'Report ID and status are required' },
        { status: 400 }
      );
    }
    
    // Validate status
    const validStatuses = ['pending', 'reviewed', 'resolved', 'rejected'];
    if (!validStatuses.includes(data.status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      );
    }
    
    const db = (process.env.DB as unknown) as D1Database;
    
    // Check if report exists
    const report = await db
      .prepare('SELECT id FROM error_reports WHERE id = ?')
      .bind(data.reportId)
      .first();
    
    if (!report) {
      return NextResponse.json(
        { error: 'Error report not found' },
        { status: 404 }
      );
    }
    
    // Update the report status
    await db
      .prepare(`
        UPDATE error_reports 
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .bind(
        data.status,
        data.reportId
      )
      .run();
    
    return NextResponse.json({
      success: true,
      message: 'Error report status updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating error report:', error);
    return NextResponse.json(
      { error: 'Failed to update error report' },
      { status: 500 }
    );
  }
}
