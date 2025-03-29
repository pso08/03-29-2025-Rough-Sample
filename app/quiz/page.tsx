'use client';

import { useState, useEffect } from 'react';
import { Button } from '../../src/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../src/components/ui/card';
import { RadioGroup, RadioGroupItem } from '../../src/components/ui/radio-group';
import { Label } from '../../src/components/ui/label';
import { Progress } from '../../src/components/ui/progress';
import Link from 'next/link';
import questionsData from '../../questions.json';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Convert the questions from the JSON file to the format expected by the quiz
const quizQuestions = questionsData.questions.map(q => {
  // Convert options object to array
  const optionsArray = Object.values(q.options);
  const optionKeys = Object.keys(q.options);
  
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
  
  const correctAnswerIndices = correctAnswers.map(answer => 
    optionKeys.findIndex(key => key === answer)
  );
  
  return {
    id: parseInt(q.id),
    question: q.question,
    options: optionsArray,
    optionKeys: optionKeys,
    correctAnswerIndices: correctAnswerIndices,
    isMultipleAnswer: correctAnswers.length > 1,
    explanation: q.explanation
  };
});

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(() => {
    // Try to get saved position from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quiz_current_question');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(() => {
    // Try to get saved score from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quiz_score');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });
  const [quizCompleted, setQuizCompleted] = useState(() => {
    // Try to get saved completion status from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quiz_completed');
      return saved === 'true';
    }
    return false;
  });
  // Track answered questions to enable navigation
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(() => {
    // Try to get saved answered questions from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quiz_answered_questions');
      return saved ? new Set(JSON.parse(saved)) : new Set<number>();
    }
    return new Set<number>();
  });

  // Save answered questions to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('quiz_answered_questions', JSON.stringify([...answeredQuestions]));
    }
  }, [answeredQuestions]);

  // Load selected options for the current question if it was previously answered
  useEffect(() => {
    if (answeredQuestions.has(currentQuestion) && typeof window !== 'undefined') {
      const savedOptions = localStorage.getItem(`quiz_selected_options_${currentQuestion}`);
      if (savedOptions) {
        setSelectedOptions(JSON.parse(savedOptions));
        setShowExplanation(true);
      }
    } else {
      setSelectedOptions([]);
      setShowExplanation(false);
    }
  }, [currentQuestion, answeredQuestions]);

  const handleOptionSelect = (index: number) => {
    if (showExplanation) return; // Prevent changes after checking answer
    
    if (quizQuestions[currentQuestion].isMultipleAnswer) {
      // For multiple answer questions, toggle the selection
      setSelectedOptions(prev => {
        if (prev.includes(index)) {
          return prev.filter(i => i !== index);
        } else {
          return [...prev, index];
        }
      });
    } else {
      // For single answer questions, just select one option
      setSelectedOptions([index]);
    }
  };

  const handleCheckAnswer = () => {
    const question = quizQuestions[currentQuestion];
    
    if (question.isMultipleAnswer) {
      // For multiple answer questions, check if all correct answers are selected and no incorrect ones
      const correctlySelected = selectedOptions.every(index => 
        question.correctAnswerIndices.includes(index)
      );
      const allCorrectSelected = question.correctAnswerIndices.every(index => 
        selectedOptions.includes(index)
      );
      
      if (correctlySelected && allCorrectSelected) {
        const newScore = score + 1;
        setScore(newScore);
        // Save score to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('quiz_score', newScore.toString());
        }
      }
    } else {
      // For single answer questions, check if the selected option is correct
      if (selectedOptions.length === 1 && question.correctAnswerIndices.includes(selectedOptions[0])) {
        const newScore = score + 1;
        setScore(newScore);
        // Save score to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('quiz_score', newScore.toString());
        }
      }
    }
    
    setShowExplanation(true);
    
    // Mark this question as answered
    setAnsweredQuestions(prev => {
      const newSet = new Set(prev);
      newSet.add(currentQuestion);
      return newSet;
    });
    
    // Save selected options for this question
    if (typeof window !== 'undefined') {
      localStorage.setItem(`quiz_selected_options_${currentQuestion}`, JSON.stringify(selectedOptions));
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      const nextQuestion = currentQuestion + 1;
      setCurrentQuestion(nextQuestion);
      // Save progress to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('quiz_current_question', nextQuestion.toString());
      }
    } else {
      setQuizCompleted(true);
      // Save completion status to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('quiz_completed', 'true');
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      const prevQuestion = currentQuestion - 1;
      setCurrentQuestion(prevQuestion);
      // Save progress to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('quiz_current_question', prevQuestion.toString());
      }
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedOptions([]);
    setShowExplanation(false);
    setScore(0);
    setQuizCompleted(false);
    setAnsweredQuestions(new Set());
    
    // Clear localStorage for quiz
    if (typeof window !== 'undefined') {
      localStorage.removeItem('quiz_current_question');
      localStorage.removeItem('quiz_score');
      localStorage.removeItem('quiz_completed');
      localStorage.removeItem('quiz_answered_questions');
      
      // Clear all selected options for each question
      for (let i = 0; i < quizQuestions.length; i++) {
        localStorage.removeItem(`quiz_selected_options_${i}`);
      }
    }
  };

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl bg-slate-800 border-slate-700 text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Quiz Completed!</CardTitle>
            <CardDescription className="text-slate-300 text-lg">
              You scored {score} out of {quizQuestions.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold mb-4">
                {Math.round((score / quizQuestions.length) * 100)}%
              </div>
              <Progress 
                value={(score / quizQuestions.length) * 100} 
                className="h-4 bg-slate-700"
              />
            </div>
            
            <div className="bg-slate-700/50 p-6 rounded-lg border border-slate-600">
              <h3 className="text-xl font-semibold mb-3">Performance Summary</h3>
              <p className="text-slate-300">
                {score === quizQuestions.length ? (
                  "Excellent! You've mastered all the concepts in this quiz."
                ) : score >= quizQuestions.length * 0.7 ? (
                  "Great job! You have a good understanding of AWS DevOps concepts."
                ) : score >= quizQuestions.length * 0.5 ? (
                  "Good effort! Review the areas where you made mistakes to improve your knowledge."
                ) : (
                  "Keep practicing! Review the AWS DevOps concepts and try again."
                )}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={resetQuiz}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              Restart Quiz
            </Button>
            <Link href="/" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                className="border-slate-600 text-white hover:bg-slate-700 w-full"
              >
                Back to Home
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const question = quizQuestions[currentQuestion];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl bg-slate-800 border-slate-700 text-white">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-slate-400">Question {currentQuestion + 1} of {quizQuestions.length}</div>
            <div className="text-sm text-slate-400">Score: {score}/{quizQuestions.length}</div>
          </div>
          <Progress value={progress} className="h-2 bg-slate-700" />
          <CardTitle className="text-2xl mt-4">
            {question.question}
            {question.isMultipleAnswer && <span className="text-sm font-normal text-blue-400 ml-2">(Select all that apply)</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {question.isMultipleAnswer ? (
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <div key={index} 
                  className="flex items-center space-x-2 cursor-pointer" 
                  onClick={() => !showExplanation && handleOptionSelect(index)}
                >
                  <div 
                    className={`flex h-5 w-5 shrink-0 rounded-sm border ${showExplanation && question.correctAnswerIndices.includes(index) ? 'border-green-500' : 'border-slate-500'} items-center justify-center ${showExplanation ? 'opacity-70' : 'hover:bg-slate-700'}`}
                  >
                    {selectedOptions.includes(index) && (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 10 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 ${showExplanation && question.correctAnswerIndices.includes(index) ? 'text-green-500' : 'text-blue-600'}`}
                      >
                        <path
                          d="M8.5 2.5L3.5 7.5L1.5 5.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <div 
                    className={`text-base ${showExplanation && question.correctAnswerIndices.includes(index) ? 'text-green-400 font-medium' : ''}`}
                  >
                    {option}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <RadioGroup value={selectedOptions.length ? selectedOptions[0].toString() : undefined} className="space-y-3">
              {question.options.map((option, index) => (
                <div key={index} 
                  className="flex items-center space-x-2 cursor-pointer" 
                  onClick={() => !showExplanation && handleOptionSelect(index)}
                >
                  <RadioGroupItem 
                    value={index.toString()} 
                    id={`option-${index}`} 
                    disabled={showExplanation}
                    className={`border-slate-500 text-white ${showExplanation && question.correctAnswerIndices.includes(index) ? 'border-green-500' : ''}`}
                  />
                  <div 
                    className={`text-base ${showExplanation && question.correctAnswerIndices.includes(index) ? 'text-green-400 font-medium' : ''}`}
                  >
                    {option}
                  </div>
                </div>
              ))}
            </RadioGroup>
          )}

          {showExplanation && (
            <div className="mt-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
              <h3 className="font-semibold text-lg mb-2">Correct {question.isMultipleAnswer ? 'Answers' : 'Answer'}:</h3>
              <div className="mb-4">
                {question.correctAnswerIndices.map(index => (
                  <div key={index} className="text-green-400 font-medium mb-1">
                    {question.optionKeys[index]}: {question.options[index]}
                  </div>
                ))}
              </div>
              <h3 className="font-semibold text-lg mb-2">Explanation:</h3>
              <p className="text-slate-300 break-words whitespace-normal overflow-auto max-h-[200px]">{question.explanation}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <div className="flex justify-between w-full">
            {!showExplanation ? (
              <>
                <Button 
                  onClick={resetQuiz}
                  variant="destructive"
                  className="w-1/3"
                >
                  Reset Quiz
                </Button>
                <Button 
                  onClick={handleCheckAnswer} 
                  disabled={selectedOptions.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 w-2/3"
                >
                  Check Answer
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={resetQuiz}
                  variant="destructive"
                  className="w-1/3"
                >
                  Reset Quiz
                </Button>
                <Button 
                  onClick={handleNextQuestion}
                  className="bg-blue-600 hover:bg-blue-700 w-2/3"
                >
                  {currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </Button>
              </>
            )}
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-between w-full mt-2">
            <Button
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-700 w-[48%]"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <Button
              onClick={handleNextQuestion}
              disabled={currentQuestion === quizQuestions.length - 1}
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-700 w-[48%]"
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
