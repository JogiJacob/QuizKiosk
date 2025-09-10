import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useQuiz } from '@/context/QuizContext';
import { useToast } from '@/hooks/use-toast';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function QuizInterface() {
  const { currentQuiz, updateAnswer, nextQuestion, previousQuestion, updateTimeRemaining } = useQuiz();
  const { toast } = useToast();
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');

  useEffect(() => {
    if (!currentQuiz) return;

    const timer = setInterval(() => {
      if (currentQuiz.timeRemaining > 0) {
        updateTimeRemaining(currentQuiz.timeRemaining - 1);
      } else {
        // Time's up - finish quiz
        handleFinishQuiz();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuiz?.timeRemaining]);

  useEffect(() => {
    // Reset selected answer when question changes
    if (currentQuiz) {
      const currentQuestion = currentQuiz.questions[currentQuiz.currentQuestionIndex];
      const existingAnswer = currentQuiz.answers.find(a => a.questionId === currentQuestion.id);
      setSelectedAnswer(existingAnswer?.selectedOptionId || '');
    }
  }, [currentQuiz?.currentQuestionIndex]);

  const handleAnswerSelect = (optionId: string) => {
    if (!currentQuiz) return;
    
    const currentQuestion = currentQuiz.questions[currentQuiz.currentQuestionIndex];
    const selectedOption = currentQuestion.options.find((opt: any) => opt.id === optionId);
    
    if (selectedOption) {
      setSelectedAnswer(optionId);
      updateAnswer(currentQuestion.id, optionId, selectedOption.isCorrect);
    }
  };

  const handleNext = () => {
    if (!currentQuiz) return;
    
    if (currentQuiz.currentQuestionIndex < currentQuiz.questions.length - 1) {
      nextQuestion();
    } else {
      handleFinishQuiz();
    }
  };

  const handleFinishQuiz = () => {
    if (!currentQuiz) return;
    
    // Calculate final score
    const score = currentQuiz.answers.filter(a => a.isCorrect).length;
    const timeUsed = (currentQuiz.quiz.duration * 60) - currentQuiz.timeRemaining;
    
    // Store results
    sessionStorage.setItem('quizResults', JSON.stringify({
      score,
      totalQuestions: currentQuiz.questions.length,
      timeUsed,
      answers: currentQuiz.answers,
    }));

    // Navigate to completion screen
    window.location.hash = 'complete';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentQuiz) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">No quiz in progress. Please start a quiz first.</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = currentQuiz.questions[currentQuiz.currentQuestionIndex];
  const progressPercentage = ((currentQuiz.currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;
  const isLastQuestion = currentQuiz.currentQuestionIndex === currentQuiz.questions.length - 1;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Quiz Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-foreground" data-testid="text-current-quiz-title">
                {currentQuiz.quiz.title}
              </h2>
              <p className="text-muted-foreground">
                Question <span data-testid="text-current-question">{currentQuiz.currentQuestionIndex + 1}</span> of{' '}
                <span data-testid="text-total-questions">{currentQuiz.questions.length}</span>
              </p>
            </div>
            <div className="text-right">
              <div className={cn(
                "bg-accent/10 px-4 py-2 rounded-lg transition-all",
                currentQuiz.timeRemaining <= 60 && "bg-destructive/10 animate-pulse"
              )}>
                <Clock className={cn(
                  "inline mr-2 h-4 w-4",
                  currentQuiz.timeRemaining <= 60 ? "text-destructive" : "text-accent"
                )} />
                <span className={cn(
                  "text-xl font-bold",
                  currentQuiz.timeRemaining <= 60 ? "text-destructive" : "text-accent"
                )} data-testid="text-time-remaining">
                  {formatTime(currentQuiz.timeRemaining)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progressPercentage} className="h-2" data-testid="progress-quiz" />
          </div>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="mb-6">
        <CardContent className="p-8">
          {/* Question Image (if available) */}
          {currentQuestion.imageUrl && (
            <img 
              src={currentQuestion.imageUrl} 
              alt="Question illustration" 
              className="w-full h-48 object-cover rounded-lg mb-6"
              data-testid="img-question"
            />
          )}

          <h3 className="text-2xl font-semibold text-foreground mb-6" data-testid="text-question">
            {currentQuestion.text}
          </h3>

          {/* Answer Options */}
          <div className="space-y-4">
            {currentQuestion.options.map((option: any, index: number) => (
              <Button
                key={option.id}
                variant="outline"
                className={cn(
                  "w-full p-6 text-left border-2 rounded-xl hover:border-primary hover:bg-primary/5 transition-all touch-button",
                  selectedAnswer === option.id && "border-primary bg-primary/5"
                )}
                onClick={() => handleAnswerSelect(option.id)}
                data-testid={`button-option-${index}`}
              >
                <div className="flex items-center">
                  <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center font-semibold mr-4">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-lg text-foreground">{option.text}</span>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="secondary"
          className="touch-button px-8 py-4 font-semibold hover:opacity-90 transition-all"
          onClick={previousQuestion}
          disabled={currentQuiz.currentQuestionIndex === 0}
          data-testid="button-previous"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          className="touch-button px-8 py-4 font-semibold hover:opacity-90 transition-all"
          onClick={handleNext}
          disabled={!selectedAnswer}
          data-testid="button-next"
        >
          {isLastQuestion ? 'Finish Quiz' : 'Next'}
          {!isLastQuestion && <ChevronRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
