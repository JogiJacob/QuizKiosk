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
                  <span className="flex items-center gap-2 text-secondary">
                    <Trophy className="w-5 h-5" />
                    Score: <span className="font-bold">{currentScore}/{totalAnswered}</span>
                  </span>
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

          {/* Progress Bar */}
          <div className="mt-4">
            <Progress
              value={progressPercentage}
              className="h-2"
              data-testid="progress-quiz"
            />
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

          <h3
            className="text-2xl font-semibold text-foreground mb-6"
            data-testid="text-question"
          >
            {currentQuestion.text}
          </h3>

          {/* Answer Options */}
          <div className="space-y-4">
            {currentQuestion.options.map((option: any, index: number) => (
              <Button
                key={`${currentQuestion.id}-${index}`}
                variant="outline"
                className={cn(
                  "w-full p-6 text-left border-2 rounded-xl hover:border-primary hover:bg-primary/5 transition-all touch-button",
                  selectedAnswer === option.text &&
                    "border-primary bg-primary/5",
                )}
                onClick={() => handleAnswerSelect(option.text)}
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
          {isLastQuestion ? "Finish Quiz" : "Next"}
          {!isLastQuestion && <ChevronRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
      </div>
    </div>
  );
}
