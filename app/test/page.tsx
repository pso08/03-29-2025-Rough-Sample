'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import questionsData from '../../questions.json';
import { Question, Domain, QuestionDifficulty, TestResults } from '@/lib/types';
import TestMode from '@/components/test-mode';
import TestResultsView from '@/components/test-results-view';

// Convert the questions from the JSON file to the format expected by the test mode
const testQuestions: Question[] = questionsData.questions.map(q => {
  // Convert options object to array of Option objects
  const optionsArray = Object.entries(q.options).map(([key, value]) => ({
    id: key,
    text: value
  }));
  
  // Check if answer contains multiple options (with "and" or comma-separated)
  let correctAnswers;
  if (q.answer.includes(' and ')) {
    // Handle "A and B" format
    correctAnswers = q.answer.split(' and ').flatMap(part => 
      part.split(',').map(a => a.trim())
    );
  } else {
    // Handle comma-separated format
    correctAnswers = q.answer.split(',').map(a => a.trim());
  }
  
  return {
    id: q.id,
    text: q.question,
    options: optionsArray,
    correctAnswers: correctAnswers,
    explanation: q.explanation,
    isMultipleAnswer: correctAnswers.length > 1,
    // Assign random domain and difficulty for demonstration
    domain: Object.values(Domain)[Math.floor(Math.random() * Object.values(Domain).length)],
    difficulty: Object.values(QuestionDifficulty)[Math.floor(Math.random() * Object.values(QuestionDifficulty).length)]
  };
});

export default function TestPage() {
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [testCompleted, setTestCompleted] = useState(false);
  
  // Handle test completion
  const handleTestComplete = (results: TestResults) => {
    setTestResults(results);
    setTestCompleted(true);
    
    // Save test results to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('test_results', JSON.stringify(results));
      localStorage.setItem('test_completed', 'true');
    }
  };
  
  // Handle test retake
  const handleRetakeTest = () => {
    setTestResults(null);
    setTestCompleted(false);
    
    // Clear test results from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('test_results');
      localStorage.removeItem('test_completed');
    }
  };
  
  // Check for saved test results on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTestCompleted = localStorage.getItem('test_completed') === 'true';
      const savedTestResults = localStorage.getItem('test_results');
      
      if (savedTestCompleted && savedTestResults) {
        setTestResults(JSON.parse(savedTestResults));
        setTestCompleted(true);
      }
    }
  }, []);
  
  // Return to home page
  const handleReturnHome = () => {
    // We'll use Link component for navigation, but this function is for the TestResultsView
  };
  
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      {testCompleted && testResults ? (
        <TestResultsView 
          results={testResults} 
          onRetake={handleRetakeTest} 
          onClose={handleReturnHome} 
        />
      ) : (
        <div className="w-full">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold">AWS DevOps Professional Test Mode</h1>
            <Link href="/">
              <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                Back to Home
              </Button>
            </Link>
          </div>
          
          <TestMode 
            questions={testQuestions} 
            onComplete={handleTestComplete} 
            timeLimit={180} // 3 hours in minutes
          />
        </div>
      )}
    </div>
  );
}
