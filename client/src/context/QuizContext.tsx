import React, { createContext, useContext, useState } from 'react';
import { CurrentQuizState, QuizAnswer } from '@/types/quiz';

interface QuizContextType {
  currentQuiz: CurrentQuizState | null;
  setCurrentQuiz: (quiz: CurrentQuizState | null) => void;
  updateAnswer: (questionId: string, selectedOptionId: string, isCorrect: boolean) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  updateTimeRemaining: (time: number) => void;
  decrementTime: () => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [currentQuiz, setCurrentQuiz] = useState<CurrentQuizState | null>(null);

  const updateAnswer = (questionId: string, selectedOptionId: string, isCorrect: boolean) => {
    setCurrentQuiz(prevQuiz => {
      if (!prevQuiz) return prevQuiz;

      const existingAnswerIndex = prevQuiz.answers.findIndex(a => a.questionId === questionId);
      const newAnswer: QuizAnswer = { questionId, selectedOptionId, isCorrect };

      // Create a new answers array instead of mutating the existing one
      const updatedAnswers = [...prevQuiz.answers];
      
      if (existingAnswerIndex >= 0) {
        updatedAnswers[existingAnswerIndex] = newAnswer;
      } else {
        updatedAnswers.push(newAnswer);
      }

      return { 
        ...prevQuiz,
        answers: updatedAnswers
      };
    });
  };

  const nextQuestion = () => {
    setCurrentQuiz(prevQuiz => {
      if (!prevQuiz || prevQuiz.currentQuestionIndex >= prevQuiz.questions.length - 1) return prevQuiz;
      return {
        ...prevQuiz,
        currentQuestionIndex: prevQuiz.currentQuestionIndex + 1,
      };
    });
  };

  const previousQuestion = () => {
    setCurrentQuiz(prevQuiz => {
      if (!prevQuiz || prevQuiz.currentQuestionIndex <= 0) return prevQuiz;
      return {
        ...prevQuiz,
        currentQuestionIndex: prevQuiz.currentQuestionIndex - 1,
      };
    });
  };

  const updateTimeRemaining = (time: number) => {
    setCurrentQuiz(prevQuiz => {
      if (!prevQuiz) return prevQuiz;
      return {
        ...prevQuiz,
        timeRemaining: time,
      };
    });
  };

  const decrementTime = () => {
    setCurrentQuiz(prevQuiz => {
      if (!prevQuiz) return prevQuiz;
      return {
        ...prevQuiz,
        timeRemaining: Math.max(prevQuiz.timeRemaining - 1, 0)
      };
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
      decrementTime,
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
