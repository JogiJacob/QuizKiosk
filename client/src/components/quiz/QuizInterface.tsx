import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuiz } from "@/context/QuizContext";
import { useToast } from "@/hooks/use-toast";
import { Clock, ChevronLeft, ChevronRight, Zap, Trophy, Star, Target, Gamepad2, Flame, Users, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuizInterface() {
  const {
    currentQuiz,
    updateAnswer,
    nextQuestion,
    previousQuestion,
    updateTimeRemaining,
    decrementTime,
  } = useQuiz();
  const { toast } = useToast();
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [imageLoading, setImageLoading] = useState<boolean>(true);
  const [imageError, setImageError] = useState<boolean>(false);
  const [questionRevealed, setQuestionRevealed] = useState<boolean>(false);
  
  // Helper function to sanitize image URLs
  const sanitizeImageUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    
    // Fix double https:// prefix
    const cleanUrl = url.replace(/^https:\/\/https:\/\//i, 'https://');
    
    // Basic URL validation
    try {
      new URL(cleanUrl);
      return cleanUrl;
    } catch {
      return undefined; // Return undefined for invalid URLs to trigger error fallback
    }
  };

  // Timer effect - separate from navigation logic
  useEffect(() => {
    if (!currentQuiz) return;

    const timer = setInterval(() => {
      decrementTime();
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuiz?.quiz.id, decrementTime]);

  // Separate effect to handle time expiry
  useEffect(() => {
    if (currentQuiz && currentQuiz.timeRemaining <= 0) {
      handleFinishQuiz();
    }
  }, [currentQuiz?.timeRemaining]);

  useEffect(() => {
    // Reset selected answer and trigger animations when question changes
    if (currentQuiz) {
      const currentQuestion =
        currentQuiz.questions[currentQuiz.currentQuestionIndex];
      const existingAnswer = currentQuiz.answers.find(
        (a) => a.questionId === currentQuestion.id,
      );
      setSelectedAnswer(existingAnswer?.selectedOptionId || "");
      
      // Trigger question reveal animation
      setQuestionRevealed(false);
      setImageLoading(true);
      setImageError(false);
      setTimeout(() => setQuestionRevealed(true), 100);
    }
  }, [currentQuiz?.currentQuestionIndex]);

  const handleAnswerSelect = (optionId: string) => {
    if (!currentQuiz) return;

    const currentQuestion =
      currentQuiz.questions[currentQuiz.currentQuestionIndex];
    const selectedOption = currentQuestion.options.find(
      (opt: any) => opt.text === optionId,
    );

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
    const score = currentQuiz.answers.filter((a) => a.isCorrect).length;
    const timeUsed = currentQuiz.quiz.duration * 60 - currentQuiz.timeRemaining;

    // Store results
    sessionStorage.setItem(
      "quizResults",
      JSON.stringify({
        score,
        totalQuestions: currentQuiz.questions.length,
        timeUsed,
        answers: currentQuiz.answers,
      }),
    );

    // Navigate to completion screen
    window.location.hash = "complete";
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  if (!currentQuiz) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              No quiz in progress. Please start a quiz first.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion =
    currentQuiz.questions[currentQuiz.currentQuestionIndex];
  const progressPercentage =
    ((currentQuiz.currentQuestionIndex + 1) / currentQuiz.questions.length) *
    100;
  const isLastQuestion =
    currentQuiz.currentQuestionIndex === currentQuiz.questions.length - 1;
  console.log("currentQuestion", currentQuestion);
  // Calculate current score and streak
  const currentScore = currentQuiz.answers.filter((a) => a.isCorrect).length;
  const totalAnswered = currentQuiz.answers.length;
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gaming Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-20 h-20 bg-primary/10 rounded-full animate-bounce delay-0"></div>
          <div className="absolute top-20 right-16 w-16 h-16 bg-secondary/10 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute bottom-32 left-20 w-24 h-24 bg-accent/10 rounded-full animate-bounce delay-500"></div>
          <div className="absolute bottom-16 right-24 w-18 h-18 bg-success/10 rounded-full animate-bounce delay-1500"></div>
          <div className="absolute top-1/3 left-1/3 w-12 h-12 bg-warning/10 rounded-full animate-pulse delay-700"></div>
          <div className="absolute bottom-1/3 right-1/3 w-14 h-14 bg-info/10 rounded-full animate-pulse delay-300"></div>
        </div>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5" 
             style={{backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)', 
                     backgroundSize: '30px 30px'}}></div>
      </div>
      
      <div className="relative z-10 p-6 max-w-5xl mx-auto">
      {/* Gaming HUD Header */}
      <Card className="modern-card border-0 shadow-2xl mb-8">
        <CardContent className="p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-6">
              <div className="gradient-bg w-16 h-16 rounded-full flex items-center justify-center shadow-lg">
                <Gamepad2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2
                  className="text-3xl font-black text-foreground mb-2"
                  data-testid="text-current-quiz-title"
                >
                  🎯 {currentQuiz.quiz.title}
                </h2>
                <div className="flex items-center gap-4 text-lg">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Target className="w-5 h-5" />
                    Question{" "}
                    <span className="font-bold text-primary" data-testid="text-current-question">
                      {currentQuiz.currentQuestionIndex + 1}
                    </span>{" "}
                    /{" "}
                    <span data-testid="text-total-questions">
                      {currentQuiz.questions.length}
                    </span>
                  </span>
                  {/* <span className="flex items-center gap-2 text-secondary">
                    <Trophy className="w-5 h-5" />
                    Score: <span className="font-bold">{currentScore}/{totalAnswered}</span>
                  </span> */}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div
                className={cn(
                  "gradient-bg-accent px-6 py-4 rounded-2xl transition-all shadow-lg",
                  currentQuiz.timeRemaining <= 60 &&
                    "animate-pulse shadow-red-500/50",
                  currentQuiz.timeRemaining <= 30 &&
                    "animate-bounce"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-3 h-3 rounded-full animate-pulse",
                    currentQuiz.timeRemaining <= 60 ? "bg-red-500" : "bg-green-400"
                  )}></div>
                  <Clock
                    className={cn(
                      "h-6 w-6",
                      currentQuiz.timeRemaining <= 60
                        ? "text-red-500"
                        : "text-white",
                    )}
                  />
                  <span
                    className={cn(
                      "text-2xl font-black tracking-wider",
                      currentQuiz.timeRemaining <= 60
                        ? "text-red-500"
                        : "text-white",
                    )}
                    data-testid="text-time-remaining"
                  >
                    {formatTime(currentQuiz.timeRemaining)}
                  </span>
                </div>
                {currentQuiz.timeRemaining <= 60 && (
                  <div className="text-center mt-1">
                    <span className="text-xs font-bold text-red-500 animate-pulse">
                      ⚡ HURRY UP!
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Gaming Progress Visualization */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                <Star className="w-4 h-4" />
                Progress
              </span>
              <span className="text-sm font-bold text-primary">
                {Math.round(progressPercentage)}% Complete
              </span>
            </div>
            <div className="relative">
              <Progress
                value={progressPercentage}
                className="h-4 rounded-full shadow-inner bg-muted/50"
                data-testid="progress-quiz"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-full opacity-50"></div>
              {progressPercentage > 25 && (
                <div className="absolute left-1/4 top-1/2 transform -translate-y-1/2 -translate-x-1/2">
                  <div className="w-2 h-2 bg-white rounded-full shadow-sm animate-pulse"></div>
                </div>
              )}
              {progressPercentage > 50 && (
                <div className="absolute left-1/2 top-1/2 transform -translate-y-1/2 -translate-x-1/2">
                  <div className="w-2 h-2 bg-white rounded-full shadow-sm animate-pulse delay-200"></div>
                </div>
              )}
              {progressPercentage > 75 && (
                <div className="absolute left-3/4 top-1/2 transform -translate-y-1/2 -translate-x-1/2">
                  <div className="w-2 h-2 bg-white rounded-full shadow-sm animate-pulse delay-400"></div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gaming Question Card */}
      <Card className={cn(
        "mb-8 modern-card border-0 shadow-2xl transition-all duration-500",
        questionRevealed ? "animate-in slide-in-from-bottom-4" : "opacity-50"
      )}>
        <CardContent className="p-10">
          {/* Enhanced Question Image with Loading States */}
          {sanitizeImageUrl(currentQuestion.imageUrl) && (
            <div className="relative mb-8">
              {imageLoading && (
                <div className="w-full h-48 bg-muted/20 rounded-2xl flex items-center justify-center mb-6">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Loading image...</span>
                  </div>
                </div>
              )}
              {imageError && (
                <div className="w-full h-48 bg-muted/10 rounded-2xl flex items-center justify-center mb-6 border-2 border-dashed border-muted">
                  <div className="flex flex-col items-center gap-3">
                    <ImageIcon className="w-12 h-12 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground text-center px-4">
                      🖼️ Image not available<br />
                      <span className="text-xs">But the question is still awesome!</span>
                    </span>
                  </div>
                </div>
              )}
              {!imageError && (
                <img
                  src={sanitizeImageUrl(currentQuestion.imageUrl) || ''}
                  alt="Question illustration"
                  className={cn(
                    "w-full h-48 object-cover rounded-2xl shadow-lg transition-all duration-300",
                    imageLoading ? "hidden" : "block"
                  )}
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageLoading(false);
                    setImageError(true);
                  }}
                  data-testid="img-question"
                />
              )}
            </div>
          )}

          {/* Enhanced Question Text */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 gradient-bg rounded-full mb-4 shadow-lg">
              <span className="text-2xl font-black text-white">
                {currentQuiz.currentQuestionIndex + 1}
              </span>
            </div>
            <h3
              className={cn(
                "text-3xl font-bold text-foreground leading-tight transition-all duration-500",
                questionRevealed ? "animate-in slide-in-from-top-2" : "opacity-0"
              )}
              data-testid="text-question"
            >
              {currentQuestion.text}
            </h3>
          </div>

          {/* Gaming Answer Options */}
          <div className="space-y-4">
            {currentQuestion.options.map((option: any, index: number) => {
              const isSelected = selectedAnswer === option.text;
              const optionIcons = [Zap, Target, Star, Trophy];
              const OptionIcon = optionIcons[index % optionIcons.length];
              const gradients = ["gradient-bg", "gradient-bg-secondary", "gradient-bg-accent", "gradient-bg"];
              const gradientClass = gradients[index % gradients.length];
              
              return (
                <Button
                  key={`${currentQuestion.id}-${index}`}
                  variant="outline"
                  className={cn(
                    "group w-full p-8 text-left border-2 rounded-2xl transition-all duration-300 touch-button",
                    "hover:scale-102 hover:shadow-xl",
                    isSelected
                      ? "border-primary bg-primary/10 shadow-xl shadow-primary/25"
                      : "border-muted hover:border-primary/50 hover:bg-primary/5"
                  )}
                  onClick={() => handleAnswerSelect(option.text)}
                  data-testid={`button-option-${index}`}
                >
                  <div className="flex items-center">
                    <div className={cn(
                      "relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-white mr-6 transition-all duration-300",
                      isSelected ? gradientClass : "bg-muted/20 group-hover:" + gradientClass
                    )}>
                      {isSelected ? (
                        <OptionIcon className="w-6 h-6 animate-pulse" />
                      ) : (
                        <span className="text-lg">{String.fromCharCode(65 + index)}</span>
                      )}
                      {isSelected && (
                        <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse"></div>
                      )}
                    </div>
                    <span className={cn(
                      "text-xl font-semibold transition-all duration-300",
                      isSelected ? "text-primary" : "text-foreground group-hover:text-primary"
                    )}>
                      {option.text}
                    </span>
                    {isSelected && (
                      <div className="ml-auto">
                        <div className="w-6 h-6 gradient-bg rounded-full flex items-center justify-center animate-bounce">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Gaming Navigation Buttons */}
      <div className="flex justify-between items-center mt-10">
        <Button
          variant="outline"
          className={cn(
            "playful-button px-10 py-5 font-bold text-lg border-2 transition-all duration-300",
            "hover:scale-105 active:scale-95",
            currentQuiz.currentQuestionIndex === 0
              ? "opacity-50 cursor-not-allowed"
              : "hover:border-secondary hover:bg-secondary/10"
          )}
          onClick={previousQuestion}
          disabled={currentQuiz.currentQuestionIndex === 0}
          data-testid="button-previous"
        >
          <ChevronLeft className="mr-3 h-5 w-5" />
          <span>Previous</span>
        </Button>
        
        {/* Middle Stats Display */}
        {/* <div className="flex items-center gap-6 text-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
            <Flame className="w-5 h-5 text-primary" />
            <span className="font-bold text-primary">{currentScore} Correct</span>
          </div>
          {totalAnswered > currentScore && (
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/20 rounded-full">
              <span className="font-bold text-muted-foreground">{totalAnswered - currentScore} Wrong</span>
            </div>
          )}
        </div> */}
        
        <Button
          className={cn(
            "playful-button px-10 py-5 font-bold text-lg text-white transition-all duration-300",
            "gradient-bg hover:scale-105 active:scale-95 shadow-lg",
            !selectedAnswer
              ? "opacity-50 cursor-not-allowed"
              : "hover:shadow-xl hover:shadow-primary/25"
          )}
          onClick={handleNext}
          disabled={!selectedAnswer}
          data-testid="button-next"
        >
          <span className="flex items-center gap-3">
            {isLastQuestion ? (
              <>
                <Trophy className="h-5 w-5 animate-bounce" />
                Complete Quest!
              </>
            ) : (
              <>
                Next Challenge
                <ChevronRight className="h-5 w-5" />
              </>
            )}
          </span>
        </Button>
      </div>
      </div>
    </div>
  );
}
