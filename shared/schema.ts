import { z } from "zod";

// Quiz Schema
export const quizSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  duration: z.number(), // minutes
  questionCount: z.number(),
  isActive: z.boolean(),
  customSuccessMessage: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertQuizSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  isActive: z.boolean().default(true),
  customSuccessMessage: z.string().optional(),
});

// Question Schema
export const questionSchema = z.object({
  id: z.string(),
  quizId: z.string(),
  text: z.string(),
  imageUrl: z.string().optional(),
  options: z.array(z.object({
    id: z.string(),
    text: z.string(),
    isCorrect: z.boolean(),
  })),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertQuestionSchema = z.object({
  quizId: z.string(),
  text: z.string().min(1, "Question text is required"),
  imageUrl: z.string().optional(),
  options: z.array(z.object({
    text: z.string().min(1, "Option text is required"),
    isCorrect: z.boolean(),
  })).min(2, "At least 2 options required").max(4, "Maximum 4 options allowed"),
});

// Participant Schema
export const participantSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  organization: z.string().optional(),
  createdAt: z.date(),
});

export const insertParticipantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  organization: z.string().optional(),
});

// Quiz Session Schema
export const quizSessionSchema = z.object({
  id: z.string(),
  quizId: z.string(),
  participantId: z.string().optional(),
  participantName: z.string(),
  score: z.number(),
  totalQuestions: z.number(),
  timeUsed: z.number(), // seconds
  answers: z.array(z.object({
    questionId: z.string(),
    selectedOptionId: z.string(),
    isCorrect: z.boolean(),
  })),
  completedAt: z.date(),
});

export const insertQuizSessionSchema = z.object({
  quizId: z.string(),
  participantId: z.string().optional(),
  participantName: z.string().min(1, "Participant name is required"),
  score: z.number(),
  totalQuestions: z.number(),
  timeUsed: z.number(),
  answers: z.array(z.object({
    questionId: z.string(),
    selectedOptionId: z.string(),
    isCorrect: z.boolean(),
  })),
});

// Settings Schema
export const settingsSchema = z.object({
  id: z.string(),
  defaultQuizDuration: z.number(),
  defaultQuestionsPerQuiz: z.number(),
  showCorrectAnswers: z.enum(["never", "after_quiz", "immediately"]),
  updatedAt: z.date(),
});

export const insertSettingsSchema = z.object({
  defaultQuizDuration: z.number().min(1),
  defaultQuestionsPerQuiz: z.number().min(1),
  showCorrectAnswers: z.enum(["never", "after_quiz", "immediately"]),
});

// Admin Schema
export const adminSchema = z.object({
  id: z.string(),
  email: z.string(),
  createdAt: z.date(),
});

// Type exports
export type Quiz = z.infer<typeof quizSchema>;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Question = z.infer<typeof questionSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Participant = z.infer<typeof participantSchema>;
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type QuizSession = z.infer<typeof quizSessionSchema>;
export type InsertQuizSession = z.infer<typeof insertQuizSessionSchema>;
export type Settings = z.infer<typeof settingsSchema>;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Admin = z.infer<typeof adminSchema>;