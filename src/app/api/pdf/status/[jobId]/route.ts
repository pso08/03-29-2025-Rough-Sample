/**
 * API Route for PDF Processing Status
 * 
 * This route provides the status of a PDF processing job.
 */

import { NextRequest, NextResponse } from 'next/server';
import { D1Database } from '@cloudflare/workers-types';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const jobId = params.jobId;
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }
    
    const db = (process.env.DB as unknown) as D1Database;
    
    // Get the job status
    const job = await db
      .prepare('SELECT status, data, created_at, updated_at FROM pdf_processing_jobs WHERE id = ?')
      .bind(jobId)
      .first();
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Parse the data JSON
    let data = {};
    try {
      data = JSON.parse(job.data || '{}');
    } catch (error) {
      console.error('Error parsing job data:', error);
    }
    
    return NextResponse.json({
      jobId,
      status: job.status,
      data,
      createdAt: job.created_at,
      updatedAt: job.updated_at
    });
    
  } catch (error) {
    console.error('Error checking job status:', error);
    return NextResponse.json(
      { error: 'Failed to check job status' },
      { status: 500 }
    );
  }
}
