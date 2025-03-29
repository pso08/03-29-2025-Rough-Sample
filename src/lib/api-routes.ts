/**
 * API Routes for the AWS DevOps Quiz Application
 * 
 * This file defines the API endpoints for the application.
 */

// Base API path
export const API_BASE = '/api';

// Authentication endpoints
export const AUTH_ROUTES = {
  REGISTER: `${API_BASE}/auth/register`,
  LOGIN: `${API_BASE}/auth/login`,
  LOGOUT: `${API_BASE}/auth/logout`,
  ME: `${API_BASE}/auth/me`,
};

// Question endpoints
export const QUESTION_ROUTES = {
  LIST: `${API_BASE}/questions`,
  GET: (id: string) => `${API_BASE}/questions/${id}`,
  BY_DOMAIN: (domain: string) => `${API_BASE}/questions/domain/${domain}`,
  BY_DIFFICULTY: (difficulty: string) => `${API_BASE}/questions/difficulty/${difficulty}`,
  BY_TAGS: `${API_BASE}/questions/tags`,
  REPORT_ERROR: (id: string) => `${API_BASE}/questions/${id}/report`,
};

// User progress endpoints
export const PROGRESS_ROUTES = {
  GET: `${API_BASE}/progress`,
  UPDATE: `${API_BASE}/progress`,
  BY_DOMAIN: (domain: string) => `${API_BASE}/progress/domain/${domain}`,
  STATS: `${API_BASE}/progress/stats`,
};

// Study session endpoints
export const SESSION_ROUTES = {
  CREATE: `${API_BASE}/sessions`,
  GET: (id: string) => `${API_BASE}/sessions/${id}`,
  LIST: `${API_BASE}/sessions`,
  UPDATE: (id: string) => `${API_BASE}/sessions/${id}`,
  SUBMIT_ANSWER: (id: string, questionId: string) => 
    `${API_BASE}/sessions/${id}/questions/${questionId}/answer`,
};

// Study set endpoints
export const STUDY_SET_ROUTES = {
  CREATE: `${API_BASE}/study-sets`,
  GET: (id: string) => `${API_BASE}/study-sets/${id}`,
  LIST: `${API_BASE}/study-sets`,
  UPDATE: (id: string) => `${API_BASE}/study-sets/${id}`,
  DELETE: (id: string) => `${API_BASE}/study-sets/${id}`,
  ADD_QUESTION: (id: string) => `${API_BASE}/study-sets/${id}/questions`,
  REMOVE_QUESTION: (id: string, questionId: string) => 
    `${API_BASE}/study-sets/${id}/questions/${questionId}`,
};

// User settings endpoints
export const SETTINGS_ROUTES = {
  GET: `${API_BASE}/settings`,
  UPDATE: `${API_BASE}/settings`,
};

// PDF upload and parsing endpoint
export const PDF_ROUTES = {
  UPLOAD: `${API_BASE}/pdf/upload`,
  PARSE_STATUS: (jobId: string) => `${API_BASE}/pdf/status/${jobId}`,
};

// Error report endpoints
export const ERROR_REPORT_ROUTES = {
  LIST: `${API_BASE}/error-reports`,
  GET: (id: string) => `${API_BASE}/error-reports/${id}`,
  UPDATE: (id: string) => `${API_BASE}/error-reports/${id}`,
};

// Additional learning resources endpoints
export const RESOURCE_ROUTES = {
  LIST: `${API_BASE}/resources`,
  GET: (id: string) => `${API_BASE}/resources/${id}`,
};

// Glossary endpoints
export const GLOSSARY_ROUTES = {
  LIST: `${API_BASE}/glossary`,
  GET: (term: string) => `${API_BASE}/glossary/${term}`,
};
