'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';
import { FlashcardQuestion } from '../../src/lib/types';
import questionsData from '../../questions.json';

// Convert the questions from the JSON file to the format expected by the flashcards
const flashcardQuestions: FlashcardQuestion[] = questionsData.questions.map((q, index) => {
  // Convert options object to arrays
  const optionKeys = Object.keys(q.options);
  const options = Object.values(q.options);
  
  // Check if answer contains multiple options (comma-separated)
  const correctAnswers = q.answer.split(',').map(a => a.trim());
  const isMultipleAnswer = correctAnswers.length > 1;
  
  return {
    id: parseInt(q.id),
    question: q.question,
    options: options,
    optionKeys: optionKeys,
    correctAnswers: correctAnswers,
    isMultipleAnswer: isMultipleAnswer,
    explanation: q.explanation
  };
});

export default function FlashcardsPage() {
  const [currentCard, setCurrentCard] = useState(() => {
    // Try to get saved position from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('flashcards_current_card');
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });
  const [isFlipped, setIsFlipped] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
  // Reset state when moving to a new card
  useEffect(() => {
    setIsFlipped(false);
    setShowOptions(false);
  }, [currentCard]);
  
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  const handleNextCard = () => {
    let nextCard;
    if (currentCard < flashcardQuestions.length - 1) {
      nextCard = currentCard + 1;
    } else {
      // Loop back to the first card
      nextCard = 0;
    }
    setCurrentCard(nextCard);
    
    // Save progress to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('flashcards_current_card', nextCard.toString());
    }
  };
  
  const handlePreviousCard = () => {
    let prevCard;
    if (currentCard > 0) {
      prevCard = currentCard - 1;
    } else {
      // Loop to the last card
      prevCard = flashcardQuestions.length - 1;
    }
    setCurrentCard(prevCard);
    
    // Save progress to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('flashcards_current_card', prevCard.toString());
    }
  };
  
  // Add reset function for flashcards
  const resetFlashcards = () => {
    setCurrentCard(0);
    setIsFlipped(false);
    setShowOptions(false);
    
    // Clear localStorage for flashcards
    if (typeof window !== 'undefined') {
      localStorage.removeItem('flashcards_current_card');
    }
  };
  
  const handleToggleOptions = () => {
    setShowOptions(!showOptions);
  };
  
  const currentQuestion = flashcardQuestions[currentCard];
  
  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2">
          <h1 className="text-xl sm:text-2xl font-bold">AWS DevOps Flashcards</h1>
          <div className="text-sm text-slate-400">
            Card {currentCard + 1} of {flashcardQuestions.length}
          </div>
        </div>
        
        <div className="perspective-1000 mb-8">
          <div 
            className={`relative w-full transition-transform duration-500 transform-style-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
            style={{ minHeight: '400px' }}
          >
            {/* Front of card (Question) */}
            <Card 
              className={`absolute w-full h-full backface-hidden p-6 bg-slate-800 border-slate-700 text-white ${
                isFlipped ? 'invisible' : ''
              }`}
            >
              <CardHeader>
                <CardTitle className="text-xl">Question {currentQuestion.isMultipleAnswer ? '(Multiple Answers)' : ''}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow overflow-y-auto" style={{ maxHeight: "300px" }}>
                <p className="text-lg mb-6 break-words whitespace-normal">{currentQuestion.question}</p>
                
                {showOptions && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Options:</h3>
                    <ul className="space-y-2">
                      {currentQuestion.optionKeys.map((key, index) => (
                        <li key={key} className="pl-4 border-l-2 border-slate-600 break-words">
                          <span className="font-medium">{key}:</span> {currentQuestion.options[index]}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-center gap-3">
                <Button 
                  onClick={handleToggleOptions} 
                  variant="outline" 
                  className="w-full sm:w-auto border-slate-600 text-white hover:bg-slate-700 mb-2 sm:mb-0 sm:mr-4"
                >
                  {showOptions ? 'Hide Options' : 'Show Options'}
                </Button>
                <Button 
                  onClick={handleFlip}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                >
                  Show Answer
                </Button>
              </CardFooter>
            </Card>
            
            {/* Back of card (Answer) */}
            <Card 
              className={`absolute w-full h-full backface-hidden p-6 bg-slate-800 border-slate-700 text-white rotate-y-180 ${
                !isFlipped ? 'invisible' : ''
              }`}
            >
              <CardHeader>
                <CardTitle className="text-xl">Answer</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow overflow-y-auto" style={{ maxHeight: "300px" }}>
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">{currentQuestion.isMultipleAnswer ? 'Correct Answers:' : 'Correct Answer:'}</h3>
                  {currentQuestion.correctAnswers.map((answer, index) => (
                    <p key={index} className="pl-4 border-l-2 border-green-500 py-1 break-words mb-2">
                      <span className="font-medium">{answer}:</span> {
                        currentQuestion.options[currentQuestion.optionKeys.indexOf(answer)]
                      }
                    </p>
                  ))}
                </div>
                
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Explanation:</h3>
                  <p className="text-slate-300 break-words whitespace-normal">{currentQuestion.explanation}</p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row justify-center gap-3">
                <Button 
                  onClick={handleFlip}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                >
                  Back to Question
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-3">
          <Button 
            variant="outline" 
            onClick={handlePreviousCard}
            className="w-full sm:w-auto border-slate-600 text-white hover:bg-slate-700"
          >
            Previous Card
          </Button>
          
          <Button 
            variant="destructive" 
            onClick={resetFlashcards}
            className="w-full sm:w-auto"
          >
            Reset All Cards
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleNextCard}
            className="w-full sm:w-auto border-slate-600 text-white hover:bg-blue-700"
          >
            Next Card
          </Button>
        </div>
      </div>
    </div>
  );
}
