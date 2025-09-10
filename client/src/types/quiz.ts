export interface QuizStats {
  totalQuizzes: number;
  totalQuestions: number;
  totalParticipants: number;
  avgScore: number;
}

export interface LeaderboardEntry {
  id: string;
  participantName: string;
  participantEmail?: string;
  participantOrganization?: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeUsed: number;
  completedAt: Date;
  rank: number;
}

export interface QuizAnswer {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
}

export interface CurrentQuizState {
  quiz: any;
  questions: any[];
  currentQuestionIndex: number;
  answers: QuizAnswer[];
  timeRemaining: number;
  startTime: Date;
}
