// lib/pdf-parser.ts
/**
 * PDF Parser Module for AWS DevOps Quiz Application
 * 
 * This module handles the extraction and parsing of questions from PDF files.
 */

import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import { Question, Option, Domain, QuestionDifficulty } from './types';

const MAX_PDF_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Parse a PDF buffer and extract questions, options, answers, and explanations
 * @param dataBuffer PDF file buffer
 * @returns Promise resolving to an array of parsed questions
 */
export async function parsePdfBuffer(dataBuffer: Buffer): Promise<Question[]> {
  try {
    // Parse the PDF content
    const data = await pdfParse(dataBuffer);
    return extractQuestionsFromText(data.text);
  } catch (error) {
    console.error('Error parsing PDF:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Process an uploaded PDF file and return validated questions
 * @param file The uploaded file (Buffer or File object)
 * @returns Promise resolving to an array of validated questions
 */
export async function processPdf(file: Buffer | File): Promise<Question[]> {
  try {
    let buffer: Buffer;
    
    if (file instanceof Buffer) {
      buffer = file;
    } else {
      // Handle File object (e.g., from web FormData)
      buffer = Buffer.from(await file.arrayBuffer());
    }
    
    const questions = await parsePdfBuffer(buffer);
    return validateQuestions(questions);
  } catch (error) {
    console.error('Error processing uploaded PDF:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

// ... (keep all your existing helper functions: extractQuestionsFromText, parseAnswers, 
// completeQuestion, determineDomain, extractTags, validateQuestions)