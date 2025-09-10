import { 
  Quiz, 
  Question, 
  Participant, 
  QuizSession, 
  Settings, 
  Admin,
  InsertQuiz,
  InsertQuestion,
  InsertParticipant,
  InsertQuizSession,
  InsertSettings
} from "@shared/schema";

// Firebase-based storage interface
// This is a placeholder interface for the server-side storage
// In a real implementation, this would connect to Firebase Admin SDK
// For now, we'll use the client-side Firebase integration

export interface IStorage {
  // Quiz operations
  getQuiz(id: string): Promise<Quiz | undefined>;
  getQuizzes(): Promise<Quiz[]>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  updateQuiz(id: string, quiz: Partial<InsertQuiz>): Promise<Quiz>;
  deleteQuiz(id: string): Promise<void>;

  // Question operations
  getQuestion(id: string): Promise<Question | undefined>;
  getQuestions(): Promise<Question[]>;
  getQuestionsByQuizId(quizId: string): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  updateQuestion(id: string, question: Partial<InsertQuestion>): Promise<Question>;
  deleteQuestion(id: string): Promise<void>;

  // Participant operations
  getParticipant(id: string): Promise<Participant | undefined>;
  getParticipants(): Promise<Participant[]>;
  createParticipant(participant: InsertParticipant): Promise<Participant>;
  updateParticipant(id: string, participant: Partial<InsertParticipant>): Promise<Participant>;
  deleteParticipant(id: string): Promise<void>;

  // Quiz Session operations
  getQuizSession(id: string): Promise<QuizSession | undefined>;
  getQuizSessions(): Promise<QuizSession[]>;
  getQuizSessionsByQuizId(quizId: string): Promise<QuizSession[]>;
  createQuizSession(session: InsertQuizSession): Promise<QuizSession>;
  updateQuizSession(id: string, session: Partial<InsertQuizSession>): Promise<QuizSession>;
  deleteQuizSession(id: string): Promise<void>;

  // Settings operations
  getSettings(): Promise<Settings | undefined>;
  updateSettings(settings: InsertSettings): Promise<Settings>;

  // Admin operations
  getAdmin(id: string): Promise<Admin | undefined>;
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  getAdmins(): Promise<Admin[]>;
}

// Memory-based storage implementation for development
export class MemStorage implements IStorage {
  private quizzes: Map<string, Quiz> = new Map();
  private questions: Map<string, Question> = new Map();
  private participants: Map<string, Participant> = new Map();
  private sessions: Map<string, QuizSession> = new Map();
  private settings: Settings | undefined;
  private admins: Map<string, Admin> = new Map();

  constructor() {
    // Initialize with default settings
    this.settings = {
      id: 'default',
      defaultQuizDuration: 10,
      defaultQuestionsPerQuiz: 15,
      showCorrectAnswers: 'after_quiz',
      updatedAt: new Date(),
    };
  }

  // Quiz operations
  async getQuiz(id: string): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }

  async getQuizzes(): Promise<Quiz[]> {
    return Array.from(this.quizzes.values());
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const id = `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newQuiz: Quiz = {
      ...quiz,
      id,
      questionCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.quizzes.set(id, newQuiz);
    return newQuiz;
  }

  async updateQuiz(id: string, quiz: Partial<InsertQuiz>): Promise<Quiz> {
    const existing = this.quizzes.get(id);
    if (!existing) {
      throw new Error('Quiz not found');
    }
    const updated: Quiz = {
      ...existing,
      ...quiz,
      updatedAt: new Date(),
    };
    this.quizzes.set(id, updated);
    return updated;
  }

  async deleteQuiz(id: string): Promise<void> {
    if (!this.quizzes.has(id)) {
      throw new Error('Quiz not found');
    }
    this.quizzes.delete(id);
    
    // Also delete associated questions
    const questions = Array.from(this.questions.values()).filter(q => q.quizId === id);
    questions.forEach(q => this.questions.delete(q.id));
  }

  // Question operations
  async getQuestion(id: string): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async getQuestions(): Promise<Question[]> {
    return Array.from(this.questions.values());
  }

  async getQuestionsByQuizId(quizId: string): Promise<Question[]> {
    return Array.from(this.questions.values()).filter(q => q.quizId === quizId);
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const id = `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newQuestion: Question = {
      ...question,
      id,
      options: question.options.map((opt, index) => ({
        id: `option_${Date.now()}_${index}`,
        text: opt.text,
        isCorrect: opt.isCorrect,
      })),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.questions.set(id, newQuestion);
    
    // Update quiz question count
    const quiz = this.quizzes.get(question.quizId);
    if (quiz) {
      quiz.questionCount = Array.from(this.questions.values()).filter(q => q.quizId === question.quizId).length;
      quiz.updatedAt = new Date();
    }
    
    return newQuestion;
  }

  async updateQuestion(id: string, question: Partial<InsertQuestion>): Promise<Question> {
    const existing = this.questions.get(id);
    if (!existing) {
      throw new Error('Question not found');
    }
    const updated: Question = {
      ...existing,
      ...question,
      options: question.options ? question.options.map((opt, index) => ({
        id: `option_${Date.now()}_${index}`,
        text: opt.text,
        isCorrect: opt.isCorrect,
      })) : existing.options,
      updatedAt: new Date(),
    };
    this.questions.set(id, updated);
    return updated;
  }

  async deleteQuestion(id: string): Promise<void> {
    const question = this.questions.get(id);
    if (!question) {
      throw new Error('Question not found');
    }
    
    this.questions.delete(id);
    
    // Update quiz question count
    const quiz = this.quizzes.get(question.quizId);
    if (quiz) {
      quiz.questionCount = Array.from(this.questions.values()).filter(q => q.quizId === question.quizId).length;
      quiz.updatedAt = new Date();
    }
  }

  // Participant operations
  async getParticipant(id: string): Promise<Participant | undefined> {
    return this.participants.get(id);
  }

  async getParticipants(): Promise<Participant[]> {
    return Array.from(this.participants.values());
  }

  async createParticipant(participant: InsertParticipant): Promise<Participant> {
    const id = `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newParticipant: Participant = {
      ...participant,
      id,
      createdAt: new Date(),
    };
    this.participants.set(id, newParticipant);
    return newParticipant;
  }

  async updateParticipant(id: string, participant: Partial<InsertParticipant>): Promise<Participant> {
    const existing = this.participants.get(id);
    if (!existing) {
      throw new Error('Participant not found');
    }
    const updated: Participant = {
      ...existing,
      ...participant,
    };
    this.participants.set(id, updated);
    return updated;
  }

  async deleteParticipant(id: string): Promise<void> {
    if (!this.participants.has(id)) {
      throw new Error('Participant not found');
    }
    this.participants.delete(id);
  }

  // Quiz Session operations
  async getQuizSession(id: string): Promise<QuizSession | undefined> {
    return this.sessions.get(id);
  }

  async getQuizSessions(): Promise<QuizSession[]> {
    return Array.from(this.sessions.values());
  }

  async getQuizSessionsByQuizId(quizId: string): Promise<QuizSession[]> {
    return Array.from(this.sessions.values()).filter(s => s.quizId === quizId);
  }

  async createQuizSession(session: InsertQuizSession): Promise<QuizSession> {
    const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newSession: QuizSession = {
      ...session,
      id,
      completedAt: new Date(),
    };
    this.sessions.set(id, newSession);
    return newSession;
  }

  async updateQuizSession(id: string, session: Partial<InsertQuizSession>): Promise<QuizSession> {
    const existing = this.sessions.get(id);
    if (!existing) {
      throw new Error('Quiz session not found');
    }
    const updated: QuizSession = {
      ...existing,
      ...session,
    };
    this.sessions.set(id, updated);
    return updated;
  }

  async deleteQuizSession(id: string): Promise<void> {
    if (!this.sessions.has(id)) {
      throw new Error('Quiz session not found');
    }
    this.sessions.delete(id);
  }

  // Settings operations
  async getSettings(): Promise<Settings | undefined> {
    return this.settings;
  }

  async updateSettings(settings: InsertSettings): Promise<Settings> {
    this.settings = {
      id: this.settings?.id || 'default',
      ...settings,
      updatedAt: new Date(),
    };
    return this.settings;
  }

  // Admin operations
  async getAdmin(id: string): Promise<Admin | undefined> {
    return this.admins.get(id);
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(admin => admin.email === email);
  }

  async getAdmins(): Promise<Admin[]> {
    return Array.from(this.admins.values());
  }
}

// Export the storage instance
export const storage = new MemStorage();

// Note: In a production environment, this would be replaced with Firebase Admin SDK integration
// The client-side components already use Firebase directly for real-time data
