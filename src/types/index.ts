export type UserRole = 'agent' | 'coach' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  joinedAt: string;
}

export type QuestionType = 'multiple-choice' | 'multi-select' | 'drag-sequence' | 'case-study';

export type Category = 'sensor' | 'logistics' | 'ring' | 'payment' | 'account' | 'general';

export interface Topic {
  id: string;
  displayName: string;
  slug: string;
  description: string;
  category: Category;
  questionCount: number;
  averageAccuracy: number;
  status: 'active' | 'draft' | 'archived';
}

export interface Question {
  id: string;
  topicId: string;
  type: QuestionType;
  content: string;
  options: string[];
  correctAnswers: number[];
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeLimit: number;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  topicId: string;
  questions: Question[];
  answers: number[][];
  score: number;
  accuracy: number;
  avgTime: number;
  streak: number;
  completedAt: string;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  weeklyPoints: number;
  accuracy: number;
  avgResponseTime: number;
  bestCategory: string;
  currentStreak: number;
}

export interface DashboardStats {
  totalPoints: number;
  overallAccuracy: number;
  avgResponseTime: number;
  currentStreak: number;
  weeklyQuizzes: number;
  topCategory: string;
}