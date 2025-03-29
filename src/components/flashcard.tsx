"use client";

/**
 * Flashcard Component
 * 
 * This component displays a question as a flashcard with flip animation.
 * It shows the question on the front and the answer with explanation on the back.
 * Now includes interactive answer selection functionality.
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Question } from '@/lib/types';
import { ChevronLeft, ChevronRight, RotateCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface FlashcardProps {
  question: Question;
  onNext?: () => void;
  onPrevious?: () => void;
  showNavigation?: boolean;
}

export default function Flashcard({ 
  question, 
  onNext, 
  onPrevious, 
  showNavigation = true 
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Reset selected answers when question changes
  useEffect(() => {
    setSelectedAnswers([]);
    setSubmitted(false);
    setIsCorrect(false);
    setIsFlipped(false);
  }, [question.id]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setSelectedAnswers([]);
    setSubmitted(false);
    if (onNext) onNext();
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setSelectedAnswers([]);
    setSubmitted(false);
    if (onPrevious) onPrevious();
  };

  // Handle single answer selection (radio buttons)
  const handleSingleAnswerChange = (value: string) => {
    if (submitted) return; // Prevent changes after submission
    setSelectedAnswers([value]);
  };

  // Handle multiple answer selection (checkboxes)
  const handleMultipleAnswerChange = (checked: boolean, value: string) => {
    if (submitted) return; // Prevent changes after submission
    
    if (checked) {
      setSelectedAnswers(prev => [...prev, value]);
    } else {
      setSelectedAnswers(prev => prev.filter(item => item !== value));
    }
  };

  // Handle answer submission
  const handleSubmit = () => {
    // Validate that at least one answer is selected
    if (selectedAnswers.length === 0) {
      return;
    }

    // Check if the answer is correct
    let correct = false;
    
    if (question.isMultipleAnswer) {
      // For multiple-answer questions, all correct answers must be selected
      // and no incorrect answers can be selected
      const allCorrectAnswersSelected = question.correctAnswers.every(
        answer => selectedAnswers.includes(answer)
      );
      const noIncorrectAnswersSelected = selectedAnswers.every(
        answer => question.correctAnswers.includes(answer)
      );
      
      correct = allCorrectAnswersSelected && noIncorrectAnswersSelected;
    } else {
      // For single-answer questions, the selected answer must be the correct one
      correct = question.correctAnswers.includes(selectedAnswers[0]);
    }

    setIsCorrect(correct);
    setSubmitted(true);
  };

  // Render options based on question type (single or multiple answer)
  const renderOptions = () => {
    if (question.isMultipleAnswer) {
      // Render checkboxes for multiple-answer questions
      return (
        <div className="space-y-3">
          {question.options.map(option => (
            <div key={option.id} className="flex items-start space-x-3">
              <div className="flex h-4 w-4 shrink-0 rounded-sm border border-primary items-center justify-center">
                <Checkbox
                  id={`option-${option.id}`}
                  checked={selectedAnswers.includes(option.id)}
                  onCheckedChange={(checked) => 
                    handleMultipleAnswerChange(checked as boolean, option.id)
                  }
                  disabled={submitted}
                  className={`h-3 w-3 ${submitted && question.correctAnswers.includes(option.id) ? 'border-green-500' : ''}`}
                />
              </div>
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor={`option-${option.id}`}
                  className={`text-base ${
                    submitted && question.correctAnswers.includes(option.id)
                      ? 'font-medium text-green-600 dark:text-green-400'
                      : ''
                  }`}
                >
                  {option.id}. {option.text}
                </Label>
              </div>
            </div>
          ))}
          <p className="text-sm text-muted-foreground mt-2">
            Select all that apply. This question has multiple correct answers.
          </p>
        </div>
      );
    } else {
      // Render radio buttons for single-answer questions
      return (
        <RadioGroup
          value={selectedAnswers[0] || ''}
          onValueChange={handleSingleAnswerChange}
          disabled={submitted}
          className="space-y-3"
        >
          {question.options.map(option => (
            <div key={option.id} className="flex items-start space-x-3">
              <RadioGroupItem
                value={option.id}
                id={`option-${option.id}`}
                disabled={submitted}
                className={submitted ? (
                  question.correctAnswers.includes(option.id) ? 'border-green-500' : ''
                ) : ''}
              />
              <Label
                htmlFor={`option-${option.id}`}
                className={`text-base ${
                  submitted && question.correctAnswers.includes(option.id)
                    ? 'font-medium text-green-600 dark:text-green-400'
                    : ''
                }`}
              >
                {option.id}. {option.text}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative perspective-1000 mb-16">
        <div 
          className={`relative w-full transition-transform duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{ minHeight: '400px' }}
        >
          {/* Front of card (Question) */}
          <Card 
            className={`absolute w-full h-full backface-hidden p-6 ${
              isFlipped ? 'invisible' : ''
            }`}
          >
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-muted-foreground">
                  Domain: {question.domain}
                </div>
                <div className="text-sm text-muted-foreground">
                  Difficulty: {question.difficulty}
                </div>
              </div>
              
              <div className="flex-grow overflow-y-auto" style={{ maxHeight: "300px" }}>
                <h3 className="text-xl font-semibold mb-4">Question</h3>
                <p className="text-lg mb-4 break-words whitespace-normal">{question.text}</p>
                
                {/* Display interactive options on the front */}
                <div className="mt-4 mb-8">
                  <h4 className="font-medium mb-2">Select your answer:</h4>
                  {renderOptions()}
                </div>

                {submitted && (
                  <Alert variant={isCorrect ? "default" : "destructive"} className="mt-4 mb-4">
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5" />
                      )}
                      <AlertTitle>
                        {isCorrect ? 'Correct!' : 'Incorrect'}
                      </AlertTitle>
                    </div>
                  </Alert>
                )}
              </div>
              
              <div className="mt-6 flex justify-center gap-4">
                {!submitted ? (
                  <Button 
                    onClick={handleSubmit} 
                    disabled={selectedAnswers.length === 0}
                    className="w-40"
                  >
                    Check Answer
                  </Button>
                ) : (
                  <Button onClick={handleFlip} className="w-40">
                    Show Explanation
                  </Button>
                )}
              </div>
            </div>
          </Card>
          
          {/* Back of card (Answer) */}
          <Card 
            className={`absolute w-full h-full backface-hidden p-6 rotate-y-180 ${
              !isFlipped ? 'invisible' : ''
            }`}
          >
            <div className="flex flex-col h-full">
              <h3 className="text-xl font-semibold mb-4">Answer</h3>
              
              <div className="flex-grow overflow-y-auto" style={{ maxHeight: "300px" }}>
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Correct {question.isMultipleAnswer ? 'Answers' : 'Answer'}:</h4>
                  <ul className="list-disc pl-5 break-words whitespace-normal">
                    {question.options
                      .filter(option => question.correctAnswers.includes(option.id))
                      .map(option => (
                        <li key={option.id} className="mb-1">
                          <span className="font-medium">{option.id}:</span> {option.text}
                        </li>
                      ))}
                  </ul>
                </div>
                
                <div className="mb-8">
                  <h4 className="font-medium mb-2">Explanation:</h4>
                  <p className="break-words whitespace-normal">{question.explanation}</p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-center">
                <Button onClick={handleFlip} className="w-40">
                  Back to Question
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {showNavigation && (
        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={!onPrevious}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => {
              setIsFlipped(false);
              setSelectedAnswers([]);
              setSubmitted(false);
            }}
          >
            <RotateCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleNext}
            disabled={!onNext}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
