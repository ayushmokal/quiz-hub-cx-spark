# Firestore Schema Design

## Collections Structure

### 1. **users** (Collection)
```typescript
{
  id: string,                    // Document ID (auto-generated)
  email: string,
  name: string,
  role: 'agent' | 'coach' | 'admin',
  avatar?: string,
  department?: string,
  joinedAt: timestamp,
  lastLoginAt?: timestamp,
  isActive: boolean,
  customClaims?: {              // For role-based access
    role: string,
    permissions: string[]
  }
}
```

### 2. **categories** (Collection)
```typescript
{
  id: string,                   // Document ID
  name: string,                 // Unique identifier
  displayName: string,
  description?: string,
  icon?: string,
  color?: string,
  isActive: boolean,
  createdAt: timestamp,
  createdBy: string,            // User ID
  updatedAt?: timestamp
}
```

### 3. **topics** (Collection)
```typescript
{
  id: string,                   // Document ID
  displayName: string,
  slug: string,                 // Unique URL slug
  description?: string,
  category: string,             // Category name
  status: 'active' | 'inactive' | 'draft',
  questionCount: number,        // Computed field
  averageAccuracy: number,      // Computed field
  createdAt: timestamp,
  createdBy: string,
  updatedAt?: timestamp,
  
  // Computed stats (updated via cloud functions)
  stats: {
    totalAttempts: number,
    avgScore: number,
    avgTime: number
  }
}
```

### 4. **questions** (Subcollection under topics)
```typescript
// Path: topics/{topicId}/questions/{questionId}
{
  id: string,                   // Document ID
  topicId: string,              // Parent topic reference
  type: 'multiple-choice' | 'multi-select' | 'case-study',
  content: string,
  options: string[],
  correctAnswers: number[],
  explanation: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  timeLimit: number,
  createdAt: timestamp,
  createdBy: string,
  updatedAt?: timestamp,
  isActive: boolean
}
```

### 5. **quizAttempts** (Collection)
```typescript
{
  id: string,                   // Document ID
  userId: string,               // Reference to user
  topicId: string,              // Reference to topic
  questions: Question[],        // Snapshot of questions at time of attempt
  answers: number[][],
  score: number,
  accuracy: number,
  avgTime: number,
  streak: number,
  completedAt: timestamp,
  
  // Additional metadata
  metadata: {
    userAgent?: string,
    ipAddress?: string,
    deviceType?: string
  }
}
```

### 6. **userStats** (Collection)
```typescript
{
  id: string,                   // Document ID (same as userId)
  userId: string,               // Reference to user
  totalPoints: number,
  overallAccuracy: number,
  avgResponseTime: number,
  currentStreak: number,
  weeklyQuizzes: number,
  bestCategory?: string,
  
  // Detailed stats
  categoryStats: {
    [categoryName: string]: {
      attempts: number,
    accuracy: number,
      avgTime: number,
      bestStreak: number
    }
  },
  
  // Time-based stats
  weeklyStats: {
    [weekKey: string]: {        // Format: "2024-W01"
      quizzes: number,
      points: number,
      accuracy: number
    }
  },
  
  lastUpdated: timestamp
}
```

### 7. **auditLogs** (Collection)
```typescript
{
  id: string,                   // Document ID
  collection: string,           // Collection name (users, topics, etc.)
  documentId: string,           // Document ID that was changed
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  oldValues?: any,
  newValues?: any,
  changedBy: string,            // User ID
  changedAt: timestamp,
  
  // Request metadata
  metadata: {
    ipAddress?: string,
    userAgent?: string,
    source?: string             // 'web', 'admin', 'api'
  }
}
```

## Security Rules Strategy

### Role-Based Access Control
```javascript
// Custom claims structure in Firebase Auth
{
  role: 'admin' | 'coach' | 'agent',
  permissions: ['read', 'write', 'delete', 'admin'],
  department?: string
}
```

### Access Patterns
- **Agents**: Read-only access to active topics/questions, create quiz attempts
- **Coaches**: All agent permissions + create/edit topics/questions 
- **Admins**: All permissions + user management, audit logs, categories

## Indexing Strategy

### Composite Indexes
1. `quizAttempts`: `userId` + `completedAt` (desc)
2. `quizAttempts`: `topicId` + `completedAt` (desc)
3. `auditLogs`: `collection` + `changedAt` (desc)
4. `auditLogs`: `documentId` + `changedAt` (desc)
5. `userStats`: `totalPoints` (desc) for leaderboard

### Single Field Indexes
- All timestamp fields for ordering
- All status/isActive fields for filtering
- userId, topicId fields for lookups

## Migration Notes

### Data Transformation
1. **Snake_case → camelCase**: Convert all field names
2. **Foreign Keys → References**: Use document references or IDs
3. **JOINs → Denormalization**: Embed related data where appropriate
4. **SQL Triggers → Cloud Functions**: Migrate audit logging to Firestore triggers

### Performance Considerations
1. **Subcollections vs Arrays**: Use subcollections for questions (scalable)
2. **Computed Fields**: Use cloud functions to maintain counts/averages
3. **Pagination**: Use Firestore cursor pagination for large datasets
4. **Real-time**: Leverage Firestore real-time listeners for live features 