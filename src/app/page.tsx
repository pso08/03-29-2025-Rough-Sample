"use client";

/**
 * Main Page Component
 * 
 * This is the main entry point for the AWS DevOps quiz application.
 * It integrates all the components and provides navigation between different sections.
 */

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import PdfUpload from '@/components/pdf-upload';
import Flashcard from '@/components/flashcard';
import QuizQuestion from '@/components/quiz-question';
import TestMode from '@/components/test-mode';
import TestResultsView from '@/components/test-results-view';
import ProgressDashboard from '@/components/progress-dashboard';
import StudySetManager from '@/components/study-set-manager';
import { Question } from '@/lib/types';
import { transformQuestions } from '@/lib/question-transformer';
import { Upload, BookOpen, PenTool, Timer, BarChart3, FolderPlus, Settings, BookMarked } from 'lucide-react';

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userId, setUserId] = useState('user-1'); // Mock user ID for demo
  const [loadError, setLoadError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<any>(null);

  // Fetch questions on component mount - client-side only
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        
        // Load questions from the included questions.json file
        const response = await fetch('/questions.json');
        if (!response.ok) {
          throw new Error('Failed to load questions.json');
        }
        
        const jsonData = await response.json();
        console.log('Loaded questions data:', jsonData);
        
        if (!jsonData.questions || !Array.isArray(jsonData.questions)) {
          throw new Error('Invalid questions format: missing questions array');
        }
        
        console.log(`Found ${jsonData.questions.length} questions in JSON`);
        
        const transformedQuestions = transformQuestions(jsonData);
        console.log(`Transformed ${transformedQuestions.length} questions`);
        
        if (transformedQuestions.length === 0) {
          throw new Error('No questions were successfully transformed');
        }
        
        setQuestions(transformedQuestions);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setLoadError(error instanceof Error ? error.message : 'Unknown error loading questions');
        setIsLoading(false);
      }
    };
    
    fetchQuestions();
  }, []);

  // Handle moving to the next question in flashcard mode
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setCurrentQuestionIndex(0); // Loop back to the first question
    }
  };

  // Handle moving to the previous question in flashcard mode
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      setCurrentQuestionIndex(questions.length - 1); // Loop to the last question
    }
  };

  // Handle quiz answer submission
  const handleQuizAnswerSubmit = (isCorrect: boolean, selectedAnswers: string[]) => {
    console.log('Answer submitted:', { isCorrect, selectedAnswers });
    // In a real implementation, this would update the user's progress
  };

  // Handle test completion
  const handleTestComplete = (results: any) => {
    console.log('Test completed:', results);
    setTestResults(results);
  };

  // Handle test retake
  const handleRetakeTest = () => {
    setTestResults(null);
  };

  // Handle return to dashboard
  const handleReturnToDashboard = () => {
    setTestResults(null);
    setActiveTab('dashboard');
  };

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">AWS DevOps Professional Certification Quiz</h1>
        <p className="text-muted-foreground">
          Prepare for your AWS Certified DevOps Engineer - Professional exam with interactive practice questions
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {questions.length} questions loaded
        </p>
        {loadError && (
          <p className="text-sm text-red-500 mt-2">
            Error: {loadError}
          </p>
        )}
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-8 mb-8">
          <TabsTrigger value="dashboard" className="flex flex-col items-center gap-1 py-2">
            <BarChart3 className="h-4 w-4" />
            <span>Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="flashcards" className="flex flex-col items-center gap-1 py-2">
            <BookOpen className="h-4 w-4" />
            <span>Flashcards</span>
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex flex-col items-center gap-1 py-2">
            <PenTool className="h-4 w-4" />
            <span>Quiz</span>
          </TabsTrigger>
          <TabsTrigger value="test" className="flex flex-col items-center gap-1 py-2">
            <Timer className="h-4 w-4" />
            <span>Test</span>
          </TabsTrigger>
          <TabsTrigger value="studysets" className="flex flex-col items-center gap-1 py-2">
            <FolderPlus className="h-4 w-4" />
            <span>Study Sets</span>
          </TabsTrigger>
          <TabsTrigger value="glossary" className="flex flex-col items-center gap-1 py-2">
            <BookMarked className="h-4 w-4" />
            <span>Glossary</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex flex-col items-center gap-1 py-2">
            <Upload className="h-4 w-4" />
            <span>Upload PDF</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex flex-col items-center gap-1 py-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <ProgressDashboard userId={userId} />
        </TabsContent>

        <TabsContent value="flashcards">
          {isLoading ? (
            <div className="text-center py-12">Loading flashcards...</div>
          ) : questions.length > 0 ? (
            <div>
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
              <Flashcard
                question={questions[currentQuestionIndex]}
                onNext={handleNextQuestion}
                onPrevious={handlePreviousQuestion}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="mb-4">No questions available. Please upload a PDF with questions or create a study set.</p>
              <Button onClick={() => setActiveTab('upload')}>Upload PDF</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="quiz">
          {isLoading ? (
            <div className="text-center py-12">Loading quiz questions...</div>
          ) : questions.length > 0 ? (
            <div>
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
              </div>
              <QuizQuestion
                question={questions[currentQuestionIndex]}
                onSubmit={handleQuizAnswerSubmit}
                onNext={handleNextQuestion}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="mb-4">No questions available. Please upload a PDF with questions or create a study set.</p>
              <Button onClick={() => setActiveTab('upload')}>Upload PDF</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="test">
          {isLoading ? (
            <div className="text-center py-12">Loading test questions...</div>
          ) : questions.length > 0 ? (
            testResults ? (
              <TestResultsView 
                results={testResults} 
                onRetake={handleRetakeTest}
                onClose={handleReturnToDashboard}
              />
            ) : (
              <TestMode
                questions={questions}
                onComplete={handleTestComplete}
              />
            )
          ) : (
            <div className="text-center py-12">
              <p className="mb-4">No questions available. Please upload a PDF with questions or create a study set.</p>
              <Button onClick={() => setActiveTab('upload')}>Upload PDF</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="studysets">
          <StudySetManager questions={questions} userId={userId} />
        </TabsContent>

        <TabsContent value="glossary">
          <Card>
            <CardHeader>
              <CardTitle>AWS DevOps Glossary</CardTitle>
              <CardDescription>
                Key terms and concepts for the AWS Certified DevOps Engineer - Professional exam
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* This would be populated from the glossary API */}
                <div>
                  <h3 className="text-lg font-semibold">CloudFormation</h3>
                  <p className="text-muted-foreground">
                    AWS CloudFormation is a service that helps you model and set up your AWS resources so you can spend less time managing those resources and more time focusing on your applications.
                  </p>
                  <a href="https://aws.amazon.com/cloudformation/" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    Learn more
                  </a>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">CodePipeline</h3>
                  <p className="text-muted-foreground">
                    AWS CodePipeline is a fully managed continuous delivery service that helps you automate your release pipelines for fast and reliable application and infrastructure updates.
                  </p>
                  <a href="https://aws.amazon.com/codepipeline/" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                    Learn more
                  </a>
                </div>
                {/* More glossary terms would be listed here */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <PdfUpload />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
              <CardDescription>
                Customize your learning experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Theme</h3>
                  <div className="flex gap-4">
                    <Button variant="outline">Light Mode</Button>
                    <Button variant="outline">Dark Mode</Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Font Size</h3>
                  <div className="flex gap-4">
                    <Button variant="outline">Small</Button>
                    <Button variant="outline">Medium</Button>
                    <Button variant="outline">Large</Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Flashcard Auto-Flip Timer</h3>
                  <div className="flex gap-4">
                    <Button variant="outline">Off</Button>
                    <Button variant="outline">5 seconds</Button>
                    <Button variant="outline">10 seconds</Button>
                    <Button variant="outline">15 seconds</Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
