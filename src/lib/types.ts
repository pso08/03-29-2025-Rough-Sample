/**
 * Data models for the AWS DevOps Quiz Application
 */

// Question difficulty levels
export enum QuestionDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

// AWS DevOps exam domains
export enum Domain {
  SDLC_AUTOMATION = 'SDLC Automation',
  CONFIG_MANAGEMENT = 'Configuration Management and Infrastructure as Code',
  MONITORING_LOGGING = 'Monitoring and Logging',
  POLICIES_STANDARDS = 'Policies and Standards Automation',
  INCIDENT_RESPONSE = 'Incident and Event Response',
  HIGH_AVAILABILITY = 'High Availability, Fault Tolerance, and Disaster Recovery'
}

// Question model
export interface Question {
  id: string;
  text: string;
  options: Option[];
  correctAnswers: string[]; // Array of option IDs that are correct
  explanation: string;
  domain?: Domain;
  difficulty?: QuestionDifficulty;
  tags?: string[]; // Additional tags for filtering
  isMultipleAnswer: boolean; // Flag for questions with multiple correct answers
}

// Option model for multiple choice questions
export interface Option {
  id: string; // A, B, C, D, etc.
  text: string;
}

// Flashcard question model (for backward compatibility)
export interface FlashcardQuestion {
  id: number;
  question: string;
  options: string[];
  optionKeys: string[];
  correctAnswers: string[];
  isMultipleAnswer: boolean;
  explanation: string;
}

// Study modes
export enum StudyMode {
  FLASHCARD = 'flashcard',
  QUIZ = 'quiz',
  TEST = 'test'
}

// Test results interface
export interface TestResults {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  timeTaken: number; // in seconds
  questionResults: {
    questionId: string;
    isCorrect: boolean;
    selectedAnswers: string[];
    timeTaken: number; // in seconds
    domain: Domain;
  }[];
  domainResults: {
    domain: Domain;
    totalQuestions: number;
    correctAnswers: number;
  }[];
}
