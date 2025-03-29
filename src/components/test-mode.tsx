"use client";

/**
 * Test Mode Component
 * 
 * This component implements a full-length practice test mode that simulates
 * the actual AWS DevOps Professional exam environment.
 * Includes pause/resume functionality and domain-specific question selection.
 */

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Question, Domain, TestResults } from '@/lib/types';
import QuizQuestion from './quiz-question';
import { Clock, AlertTriangle, Pause, Play, RotateCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface TestModeProps {
  questions: Question[];
  onComplete: (results: TestResults) => void;
  timeLimit?: number; // in minutes, default is 180 (3 hours) like the real exam
}

// Domain distribution according to AWS exam
const DOMAIN_DISTRIBUTION = {
  [Domain.SDLC_AUTOMATION]: 0.22, // 22%
  [Domain.CONFIG_MANAGEMENT]: 0.19, // 19%
  [Domain.MONITORING_LOGGING]: 0.15, // 15%
  [Domain.POLICIES_STANDARDS]: 0.10, // 10%
  [Domain.INCIDENT_RESPONSE]: 0.18, // 18%
  [Domain.HIGH_AVAILABILITY]: 0.16, // 16%
};

export default function TestMode({
  questions,
  onComplete,
  timeLimit = 180
}: TestModeProps) {
  // Use useRef for the startTime to avoid hydration mismatch
  const startTimeRef = useRef<number | null>(null);
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, { isCorrect: boolean; selectedAnswers: string[] }>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60); // convert to seconds
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseCount, setPauseCount] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testInitialized, setTestInitialized] = useState(false);

  // Initialize test questions when component mounts
  useEffect(() => {
    if (!testInitialized && questions.length > 0) {
      initializeTest();
      setTestInitialized(true);
    }
  }, [questions, testInitialized]);

  // Initialize test with 75 questions distributed by domain
  const initializeTest = () => {
    // Group questions by domain
    const questionsByDomain = new Map<Domain, Question[]>();
    
    for (const domain of Object.values(Domain)) {
      questionsByDomain.set(domain, questions.filter(q => q.domain === domain));
    }
    
    // Calculate how many questions to select from each domain
    const totalQuestions = 75;
    const selectedQuestions: Question[] = [];
    
    for (const [domain, percentage] of Object.entries(DOMAIN_DISTRIBUTION)) {
      const domainQuestions = questionsByDomain.get(domain as Domain) || [];
      const numToSelect = Math.round(totalQuestions * percentage);
      
      // Randomly select questions from this domain
      const shuffled = [...domainQuestions].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, numToSelect);
      
      selectedQuestions.push(...selected);
    }
    
    // If we don't have enough questions in some domains, fill with random questions
    if (selectedQuestions.length < totalQuestions) {
      const remaining = totalQuestions - selectedQuestions.length;
      const allQuestions = [...questions];
      const selectedIds = new Set(selectedQuestions.map(q => q.id));
      
      // Filter out already selected questions
      const availableQuestions = allQuestions.filter(q => !selectedIds.has(q.id));
      
      // Randomly select remaining questions
      const shuffled = [...availableQuestions].sort(() => 0.5 - Math.random());
      const additional = shuffled.slice(0, remaining);
      
      selectedQuestions.push(...additional);
    }
    
    // Shuffle the final selection
    const finalQuestions = selectedQuestions.slice(0, totalQuestions).sort(() => 0.5 - Math.random());
    
    setTestQuestions(finalQuestions);
  };

  // Start the test
  const handleStartTest = () => {
    setTestStarted(true);
    // Initialize startTime when the test begins, not during component mount
    startTimeRef.current = Date.now();
  };

  // Reset the test
  const handleResetTest = () => {
    setCurrentQuestionIndex(0);
    setAnswers(new Map());
    setTimeRemaining(timeLimit * 60);
    setIsTestComplete(false);
    setShowTimeWarning(false);
    setIsPaused(false);
    setPauseCount(0);
    setTestStarted(false);
    initializeTest();
  };

  // Toggle pause/resume
  const handleTogglePause = () => {
    if (isPaused) {
      setIsPaused(false);
    } else {
      if (pauseCount < 10) {
        setIsPaused(true);
        setPauseCount(prev => prev + 1);
      }
    }
  };

  // Timer effect
  useEffect(() => {
    if (!testStarted || isTestComplete || isPaused) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          handleTestComplete();
          return 0;
        }
        
        // Show warning when 10 minutes remaining
        if (prev === 600) {
          setShowTimeWarning(true);
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, isTestComplete, isPaused]);

  // Format time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer submission
  const handleAnswerSubmit = (isCorrect: boolean, selectedAnswers: string[]) => {
    setAnswers(prev => {
      const newAnswers = new Map(prev);
      newAnswers.set(currentQuestionIndex, { isCorrect, selectedAnswers });
      return newAnswers;
    });
  };

  // Move to the next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleTestComplete();
    }
  };

  // Move to the previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Handle test completion
  const handleTestComplete = () => {
    setIsTestComplete(true);
    
    // Calculate results
    const timeTaken = startTimeRef.current 
      ? Math.floor((Date.now() - startTimeRef.current) / 1000) 
      : timeLimit * 60 - timeRemaining;
    
    const correctAnswers = Array.from(answers.values()).filter(a => a.isCorrect).length;
    const incorrectAnswers = Array.from(answers.values()).filter(a => !a.isCorrect).length;
    const skippedQuestions = testQuestions.length - correctAnswers - incorrectAnswers;
    
    // Create detailed question results
    const questionResults = testQuestions.map((question, index) => {
      const answer = answers.get(index);
      return {
        questionId: question.id,
        isCorrect: answer?.isCorrect || false,
        selectedAnswers: answer?.selectedAnswers || [],
        timeTaken: 0, // We don't track time per question in this implementation
        domain: question.domain || Domain.SDLC_AUTOMATION // Default to SDLC if domain is missing
      };
    });
    
    // Calculate domain-specific results
    const domainResults = Object.values(Domain).map(domain => {
      const domainQuestions = questionResults.filter(q => testQuestions.find(tq => tq.id === q.questionId)?.domain === domain);
      const domainCorrectAnswers = domainQuestions.filter(q => q.isCorrect).length;
      
      return {
        domain,
        totalQuestions: domainQuestions.length,
        correctAnswers: domainCorrectAnswers
      };
    });
    
    // Call the onComplete callback with the results
    onComplete({
      totalQuestions: testQuestions.length,
      correctAnswers,
      incorrectAnswers,
      skippedQuestions,
      timeTaken,
      questionResults,
      domainResults
    });
  };

  // Calculate progress percentage
  const progressPercentage = (answers.size / testQuestions.length) * 100;

  // If test hasn't started yet, show the start screen
  if (!testStarted) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card className="bg-slate-800 border-slate-700 text-white">
          <CardHeader>
            <CardTitle>AWS DevOps Professional Practice Test</CardTitle>
            <CardDescription className="text-slate-300">
              This practice test simulates the actual AWS Certified DevOps Engineer - Professional exam.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Exam Format</h3>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-300">
                  <li><strong>Number of Questions:</strong> 75 questions</li>
                  <li><strong>Duration:</strong> 180 minutes (3 hours)</li>
                  <li><strong>Question Types:</strong> Multiple choice and multiple answer</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold">Exam Content</h3>
                <p className="text-sm text-slate-400 mb-2">
                  The exam focuses on advanced technical skills and knowledge in the following domains:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  <li>SDLC Automation (22%)</li>
                  <li>Configuration Management and Infrastructure as Code (19%)</li>
                  <li>Monitoring and Logging (15%)</li>
                  <li>Policies and Standards Automation (10%)</li>
                  <li>Incident and Event Response (18%)</li>
                  <li>High Availability, Fault Tolerance, and Disaster Recovery (16%)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold">Test Features</h3>
                <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-300">
                  <li><strong>Pause/Resume:</strong> You can pause the test up to 10 times</li>
                  <li><strong>Navigation:</strong> You can move back and forth between questions</li>
                  <li><strong>Time Tracking:</strong> A timer shows your remaining time</li>
                  <li><strong>Domain Analysis:</strong> Detailed results by domain area</li>
                </ul>
              </div>
              
              <Alert className="bg-blue-900/30 border-blue-800 mt-4">
                <AlertTitle className="flex items-center text-blue-400">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Important Information
                </AlertTitle>
                <AlertDescription className="text-slate-300">
                  This test is designed to simulate the real exam experience. Once you start, the timer will begin counting down.
                  You can pause the test if needed, but you are limited to 10 pauses to maintain exam-like conditions.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end">
            <Button 
              onClick={handleStartTest}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Start Test
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // If test is in progress, show the question
  if (!isTestComplete && testQuestions.length > 0) {
    const currentQuestion = testQuestions[currentQuestionIndex];
    const currentAnswer = answers.get(currentQuestionIndex);
    
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleTogglePause}
              disabled={pauseCount >= 10 && !isPaused}
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              {isPaused ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause ({10 - pauseCount} left)
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleResetTest}
              className="border-slate-600 text-white hover:bg-slate-700"
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className={`font-mono ${timeRemaining < 600 ? 'text-red-500' : 'text-white'}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>
        
        {showTimeWarning && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Time Warning</AlertTitle>
            <AlertDescription>
              You have less than 10 minutes remaining.
            </AlertDescription>
          </Alert>
        )}
        
        {isPaused ? (
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[400px]">
              <Pause className="h-16 w-16 text-slate-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Test Paused</h2>
              <p className="text-slate-300 mb-6 text-center">
                The timer has been paused. Click Resume to continue the test.
              </p>
              <Button 
                onClick={() => setIsPaused(false)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Resume Test
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <div className="text-sm text-slate-400">
                  Question {currentQuestionIndex + 1} of {testQuestions.length}
                </div>
                <div className="text-sm text-slate-400">
                  {answers.size} of {testQuestions.length} answered
                </div>
              </div>
              <Progress value={progressPercentage} className="h-2 bg-slate-700" />
            </div>
            
            <QuizQuestion
              question={currentQuestion}
              onSubmit={handleAnswerSubmit}
              onNext={handleNextQuestion}
              showTimer={false}
            />
            
            <div className="mt-4 flex justify-between">
              <Button 
                variant="outline" 
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                Previous
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleNextQuestion}
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                {currentQuestionIndex < testQuestions.length - 1 ? 'Next' : 'Finish Test'}
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }

  // This should never happen, but just in case
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="bg-slate-800 border-slate-700 text-white">
        <CardContent className="pt-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Loading Test...</h2>
            <Button 
              onClick={handleResetTest}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Reset Test
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
