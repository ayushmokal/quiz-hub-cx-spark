import { User, Topic, Question, LeaderboardEntry, DashboardStats, QuizAttempt } from '../types';

// Mock users based on the provided email list
export const mockUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@ultrahuman.com',
    name: 'Admin User',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    department: 'Operations',
    joinedAt: '2023-01-15'
  },
  {
    id: 'coach-1',
    email: 'simran.rajput@ultrahuman.com',
    name: 'Simran Rajput',
    role: 'coach',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Simran',
    department: 'Customer Experience',
    joinedAt: '2023-03-20'
  },
  {
    id: 'agent-1',
    email: 'priya.sharma@ultrahuman.com',
    name: 'Priya Sharma',
    role: 'agent',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    department: 'Customer Support',
    joinedAt: '2024-01-10'
  },
  {
    id: 'agent-2',
    email: 'arjun.verma@ultrahuman.com',
    name: 'Arjun Verma',
    role: 'agent',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun',
    department: 'Technical Support',
    joinedAt: '2023-11-05'
  },
  {
    id: 'agent-3',
    email: 'aditya.sharma@ultrahuman.com',
    name: 'Aditya Sharma',
    role: 'agent',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya',
    department: 'Customer Support',
    joinedAt: '2024-02-14'
  }
];

export const mockTopics: Topic[] = [
  {
    id: 'topic-1',
    displayName: 'Sensor Troubleshooting',
    slug: 'sensor-troubleshooting',
    description: 'Learn to diagnose and resolve common sensor connectivity and accuracy issues',
    category: 'sensor',
    questionCount: 25,
    averageAccuracy: 87,
    status: 'active'
  },
  {
    id: 'topic-2',
    displayName: 'Ring Device Support',
    slug: 'ring-device-support',
    description: 'Comprehensive guide to Ring device features, troubleshooting, and user guidance',
    category: 'ring',
    questionCount: 18,
    averageAccuracy: 91,
    status: 'active'
  },
  {
    id: 'topic-3',
    displayName: 'Payment Processing',
    slug: 'payment-processing',
    description: 'Handle payment failures, refunds, and billing inquiries effectively',
    category: 'payment',
    questionCount: 22,
    averageAccuracy: 83,
    status: 'active'
  },
  {
    id: 'topic-4',
    displayName: 'Logistics & Shipping',
    slug: 'logistics-shipping',
    description: 'Manage shipping delays, tracking issues, and delivery complications',
    category: 'logistics',
    questionCount: 15,
    averageAccuracy: 79,
    status: 'active'
  },
  {
    id: 'topic-5',
    displayName: 'Account Management',
    slug: 'account-management',
    description: 'User account setup, data management, and privacy settings',
    category: 'account',
    questionCount: 20,
    averageAccuracy: 88,
    status: 'active'
  }
];

export const mockQuestions: Question[] = [
  {
    id: 'q1',
    topicId: 'topic-1',
    type: 'multiple-choice',
    content: 'A customer reports their Ring is not tracking sleep data. What is the first troubleshooting step?',
    options: [
      'Reset the device to factory settings',
      'Check if the Ring is worn snugly on the finger',
      'Update the mobile app',
      'Contact technical support immediately'
    ],
    correctAnswers: [1],
    explanation: 'Proper Ring placement is crucial for accurate sleep tracking. The Ring should be worn snugly but comfortably on the finger.',
    difficulty: 'beginner',
    timeLimit: 30
  },
  {
    id: 'q2',
    topicId: 'topic-1',
    type: 'multi-select',
    content: 'Which factors can affect sensor accuracy? (Select all that apply)',
    options: [
      'Device placement',
      'Skin moisture',
      'Environmental temperature',
      'User age',
      'Battery level'
    ],
    correctAnswers: [0, 1, 2, 4],
    explanation: 'Device placement, skin moisture, environmental temperature, and battery level all directly impact sensor accuracy. User age is not a significant factor.',
    difficulty: 'intermediate',
    timeLimit: 45
  },
  {
    id: 'q3',
    topicId: 'topic-2',
    type: 'multiple-choice',
    content: 'What is the recommended charging frequency for the Ultrahuman Ring?',
    options: [
      'Daily',
      'Every 2-3 days',
      'Weekly',
      'Every 4-7 days'
    ],
    correctAnswers: [3],
    explanation: 'The Ultrahuman Ring typically lasts 4-7 days on a single charge, depending on usage patterns.',
    difficulty: 'beginner',
    timeLimit: 30
  },
  {
    id: 'q4',
    topicId: 'topic-3',
    type: 'case-study',
    content: 'Case Study: A customer purchased a Ring 3 months ago and wants to return it due to "inaccurate readings." They have not contacted support before and seem frustrated. They mention the Ring feels loose and they often forget to wear it. How would you handle this situation?',
    options: [
      'Immediately process a full refund',
      'Educate about proper wear and offer to troubleshoot first',
      'Offer a replacement device',
      'Escalate to technical team'
    ],
    correctAnswers: [1],
    explanation: 'The customer\'s issues (loose fit, inconsistent wear) suggest user education could resolve the problem. Address the root cause first before considering returns.',
    difficulty: 'advanced',
    timeLimit: 90
  }
];

export const mockLeaderboard: LeaderboardEntry[] = [
  {
    id: 'lb1',
    userId: 'agent-2',
    name: 'Arjun Verma',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun',
    weeklyPoints: 2450,
    accuracy: 94,
    avgResponseTime: 18,
    bestCategory: 'sensor',
    currentStreak: 12
  },
  {
    id: 'lb2',
    userId: 'agent-1',
    name: 'Priya Sharma',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    weeklyPoints: 2280,
    accuracy: 91,
    avgResponseTime: 22,
    bestCategory: 'ring',
    currentStreak: 8
  },
  {
    id: 'lb3',
    userId: 'agent-3',
    name: 'Aditya Sharma',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya',
    weeklyPoints: 2150,
    accuracy: 89,
    avgResponseTime: 25,
    bestCategory: 'payment',
    currentStreak: 15
  }
];

export const mockDashboardStats: DashboardStats = {
  totalPoints: 18750,
  overallAccuracy: 87,
  avgResponseTime: 22,
  currentStreak: 8,
  weeklyQuizzes: 12,
  topCategory: 'sensor'
};

export const mockQuizAttempts: QuizAttempt[] = [
  {
    id: 'attempt-1',
    userId: 'agent-1',
    topicId: 'topic-1',
    questions: mockQuestions.slice(0, 2),
    answers: [[1], [0, 1, 2, 4]],
    score: 20,
    accuracy: 100,
    avgTime: 28,
    streak: 2,
    completedAt: '2024-07-15T10:30:00Z'
  }
];