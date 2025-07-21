export type UserRole = 'agent' | 'coach' | 'admin';
export type QuestionType = 'multiple-choice' | 'multi-select' | 'case-study';
export type TopicStatus = 'active' | 'inactive' | 'draft';
export type CategoryType = 'sensor' | 'ring' | 'payment' | 'logistics' | 'account';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  joinedAt: string;
  isActive?: boolean;
}

export interface Category {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
  createdBy?: string;
}

export interface Topic {
  id: string;
  displayName: string;
  slug: string;
  description?: string;
  category: string; // Changed from CategoryType to string to allow any category
  questionCount: number;
  averageAccuracy: number;
  status: TopicStatus;
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

export interface AuditLog {
  id: string;
  tableName: string;
  recordId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  oldValues?: any;
  newValues?: any;
  changedBy: string;
  changedAt: string;
  ipAddress?: string;
  userAgent?: string;
  user?: {
    name: string;
    email: string;
  };
}