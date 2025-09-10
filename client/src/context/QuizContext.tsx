import React, { createContext, useContext, useState } from 'react';
import { CurrentQuizState, QuizAnswer } from '@/types/quiz';

interface QuizContextType {
  currentQuiz: CurrentQuizState | null;
  setCurrentQuiz: (quiz: CurrentQuizState | null) => void;
  updateAnswer: (questionId: string, selectedOptionId: string, isCorrect: boolean) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  updateTimeRemaining: (time: number) => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [currentQuiz, setCurrentQuiz] = useState<CurrentQuizState | null>(null);

  const updateAnswer = (questionId: string, selectedOptionId: string, isCorrect: boolean) => {
    if (!currentQuiz) return;

    const existingAnswerIndex = currentQuiz.answers.findIndex(a => a.questionId === questionId);
    const newAnswer: QuizAnswer = { questionId, selectedOptionId, isCorrect };

    if (existingAnswerIndex >= 0) {
      currentQuiz.answers[existingAnswerIndex] = newAnswer;
    } else {
      currentQuiz.answers.push(newAnswer);
    }

    setCurrentQuiz({ ...currentQuiz });
  };

  const nextQuestion = () => {
    if (!currentQuiz || currentQuiz.currentQuestionIndex >= currentQuiz.questions.length - 1) return;
    setCurrentQuiz({
      ...currentQuiz,
      currentQuestionIndex: currentQuiz.currentQuestionIndex + 1,
    });
  };

  const previousQuestion = () => {
    if (!currentQuiz || currentQuiz.currentQuestionIndex <= 0) return;
    setCurrentQuiz({
      ...currentQuiz,
      currentQuestionIndex: currentQuiz.currentQuestionIndex - 1,
    });
  };

  const updateTimeRemaining = (time: number) => {
    if (!currentQuiz) return;
    setCurrentQuiz({
      ...currentQuiz,
      timeRemaining: time,
    });
  };

  return (
    <QuizContext.Provider value={{
      currentQuiz,
      setCurrentQuiz,
      updateAnswer,
      nextQuestion,
      previousQuestion,
      updateTimeRemaining,
    }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}
