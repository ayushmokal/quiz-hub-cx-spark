import { 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch,
  increment,
  collectionGroup
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User, Topic, Question, QuizAttempt, LeaderboardEntry, DashboardStats, AuditLog, Category } from '../types';

// Helper functions
const createAuditLog = async (
  collectionName: string,
  documentId: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  oldValues?: any,
  newValues?: any
) => {
  const user = auth.currentUser;
  if (!user) return;

  await addDoc(collection(db, 'auditLogs'), {
    collection: collectionName,
    documentId,
    action,
    oldValues: oldValues || null,
    newValues: newValues || null,
    changedBy: user.uid,
    changedAt: Timestamp.now(),
    metadata: {
      userAgent: navigator.userAgent,
      source: 'web'
    }
  });
};

// Update user stats after quiz completion
const updateUserStats = async (userId: string, quizResult: {
  score: number;
  accuracy: number;
  avgTime: number;
  topicId: string;
}) => {
  try {
    console.log('UserStats: Updating stats for user:', userId, 'with result:', quizResult);
    
    const userStatsRef = doc(db, 'userStats', userId);
    const userStatsDoc = await getDoc(userStatsRef);
    
    if (userStatsDoc.exists()) {
      // Update existing stats
      const currentStats = userStatsDoc.data();
      
      // Calculate new aggregated stats
      const totalQuizzes = (currentStats.totalQuizzes || 0) + 1;
      const newTotalPoints = (currentStats.totalPoints || 0) + quizResult.score;
      const newOverallAccuracy = ((currentStats.overallAccuracy || 0) * (totalQuizzes - 1) + quizResult.accuracy) / totalQuizzes;
      const newAvgResponseTime = ((currentStats.avgResponseTime || 0) * (totalQuizzes - 1) + quizResult.avgTime) / totalQuizzes;
      
      // Update streak (simplified - just increment if accuracy >= 70%, reset if not)
      const newStreak = quizResult.accuracy >= 70 ? (currentStats.currentStreak || 0) + 1 : 0;
      
      // Get current week key (e.g., "2024-W01")
      const now = new Date();
      const weekKey = `${now.getFullYear()}-W${Math.ceil((now.getDate() - now.getDay() + 1) / 7)}`;
      
      const updatedStats = {
        totalPoints: Math.round(newTotalPoints),
        overallAccuracy: Math.round(newOverallAccuracy * 10) / 10, // Round to 1 decimal
        avgResponseTime: Math.round(newAvgResponseTime * 10) / 10,
        currentStreak: newStreak,
        totalQuizzes: totalQuizzes,
        weeklyQuizzes: totalQuizzes, // Simplified - could be week-specific
        lastUpdated: Timestamp.now(),
        [`weeklyStats.${weekKey}.quizzes`]: increment(1),
        [`weeklyStats.${weekKey}.points`]: increment(quizResult.score)
      };
      
      await updateDoc(userStatsRef, updatedStats);
      console.log('UserStats: Updated existing stats:', updatedStats);
    } else {
      // Create new stats document
      const newStats = {
        userId: userId,
        totalPoints: quizResult.score,
        overallAccuracy: quizResult.accuracy,
        avgResponseTime: quizResult.avgTime,
        currentStreak: quizResult.accuracy >= 70 ? 1 : 0,
        totalQuizzes: 1,
        weeklyQuizzes: 1,
        bestCategory: '', // Could be derived from topicId
        lastUpdated: Timestamp.now(),
        weeklyStats: {
          [`${new Date().getFullYear()}-W${Math.ceil((new Date().getDate() - new Date().getDay() + 1) / 7)}`]: {
            quizzes: 1,
            points: quizResult.score,
            accuracy: quizResult.accuracy
          }
        }
      };
      
      await setDoc(userStatsRef, newStats);
      console.log('UserStats: Created new stats:', newStats);
    }
  } catch (error) {
    console.error('UserStats: Error updating user stats:', error);
    // Don't throw - we don't want to fail quiz submission if stats update fails
  }
};

// Auth API
export const authAPI = {
  async signIn(email: string, password: string): Promise<User | null> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Get user profile from Firestore
    if (userCredential.user) {
      return await this.getUserProfile(userCredential.user.uid);
    }
    
    return null;
  },

  async signInWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      hd: 'ultrahuman.com' // Restrict to ultrahuman.com domain
    });
    
    const result = await signInWithPopup(auth, provider);
    
    // Auto-create user profile if doesn't exist
    if (result.user) {
      await this.ensureUserProfile(result.user);
    }
    
    return result;
  },

  async signOut(): Promise<void> {
    await signOut(auth);
  },

  async getCurrentUser(): Promise<User | null> {
    const user = auth.currentUser;
    if (!user) return null;
    
    // Check if user is from ultrahuman domain
    if (user.email && !user.email.endsWith('@ultrahuman.com')) {
      throw new Error('Unauthorized: Only @ultrahuman.com emails are allowed');
    }
    
    return await this.getUserProfile(user.uid);
  },

  async getUserProfile(uid: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) return null;
    
    const data = userDoc.data();
    return {
      id: userDoc.id,
      email: data.email,
      name: data.name,
      role: data.role,
      avatar: data.avatar,
      department: data.department,
      joinedAt: data.joinedAt.toDate().toISOString()
    };
  },

  async ensureUserProfile(firebaseUser: FirebaseUser): Promise<User> {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const data = userDoc.data();
      const email = firebaseUser.email!;
      
      // Determine correct role based on current logic
      let correctRole: 'agent' | 'coach' | 'admin' = 'agent';
      if (email === 'admin@ultrahuman.com' || email === 'adi@ultrahuman.com' || email === 'ayush.mokal@ultrahuman.com') {
        correctRole = 'admin';
      } else if (['jaideep@ultrahuman.com', 'munish@ultrahuman.com'].includes(email)) {
        correctRole = 'coach';
      }
      
      // Update role if it has changed + update last login
      const updates: any = {
        lastLoginAt: Timestamp.now()
      };
      
      if (data.role !== correctRole) {
        updates.role = correctRole;
        console.log(`Updating role for ${email}: ${data.role} → ${correctRole}`);
      }
      
      await updateDoc(userDocRef, updates);
      
      return {
        id: userDoc.id,
        email: data.email,
        name: data.name,
        role: correctRole, // Use the updated role
        avatar: data.avatar,
        department: data.department,
        joinedAt: data.joinedAt.toDate().toISOString()
      };
    }
    
    // Create new user profile
    const email = firebaseUser.email!;
    const displayName = firebaseUser.displayName;
    let name = displayName;
    
    if (!name) {
      // Extract name from email: "first.last@ultrahuman.com" -> "First Last"
      const emailPart = email.split('@')[0];
      name = emailPart
        .split('.')
        .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
    }

    // Determine role based on email
    let role: 'agent' | 'coach' | 'admin' = 'agent';
    if (email === 'admin@ultrahuman.com' || email === 'adi@ultrahuman.com' || email === 'ayush.mokal@ultrahuman.com') {
      role = 'admin';
    } else if (['jaideep@ultrahuman.com', 'munish@ultrahuman.com'].includes(email)) {
      role = 'coach';
    }

    const newUser = {
      email,
      name,
      role,
      department: 'Customer Support',
      avatar: firebaseUser.photoURL,
      joinedAt: Timestamp.now(),
      lastLoginAt: Timestamp.now(),
      isActive: true
    };

    await setDoc(userDocRef, newUser);
    
    // Create audit log
    await createAuditLog('users', firebaseUser.uid, 'CREATE', null, newUser);
    
    return {
      id: firebaseUser.uid,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      avatar: newUser.avatar,
      department: newUser.department,
      joinedAt: newUser.joinedAt.toDate().toISOString()
    };
  },

  onAuthStateChanged: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const user = await authAPI.getCurrentUser();
          callback(user);
        } catch (error) {
          console.error('Error getting user profile:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }
};

// Users API
export const usersAPI = {
  async getUsers(): Promise<User[]> {
    const q = query(collection(db, 'users'), orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        name: data.name,
        role: data.role,
        avatar: data.avatar,
        department: data.department,
        joinedAt: data.joinedAt.toDate().toISOString()
      };
    });
  },

  async getUserById(id: string): Promise<User | null> {
    return await authAPI.getUserProfile(id);
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const userDocRef = doc(db, 'users', id);
    const oldDoc = await getDoc(userDocRef);
    const oldData = oldDoc.data();
    
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.role) updateData.role = updates.role;
    if (updates.department) updateData.department = updates.department;
    if (updates.avatar) updateData.avatar = updates.avatar;
    
    updateData.updatedAt = Timestamp.now();
    
    await updateDoc(userDocRef, updateData);
    
    // Create audit log
    await createAuditLog('users', id, 'UPDATE', oldData, updateData);
    
    const updatedDoc = await getDoc(userDocRef);
    const data = updatedDoc.data()!;
    return {
      id: updatedDoc.id,
      email: data.email,
      name: data.name,
      role: data.role,
      avatar: data.avatar,
      department: data.department,
      joinedAt: data.joinedAt.toDate().toISOString()
    };
  }
};

// Categories API
export const categoriesAPI = {
  async getCategories(): Promise<Category[]> {
    const q = query(
      collection(db, 'categories'),
      where('isActive', '==', true),
      orderBy('displayName')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        icon: data.icon,
        color: data.color,
        isActive: data.isActive,
        createdAt: data.createdAt.toDate().toISOString(),
        createdBy: data.createdBy
      };
    });
  },

  async getAllCategories(): Promise<Category[]> {
    const q = query(collection(db, 'categories'), orderBy('displayName'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        displayName: data.displayName,
        description: data.description,
        icon: data.icon,
        color: data.color,
        isActive: data.isActive,
        createdAt: data.createdAt.toDate().toISOString(),
        createdBy: data.createdBy
      };
    });
  },

  async createCategory(category: Omit<Category, 'id' | 'createdAt' | 'createdBy'>): Promise<Category> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const newCategory = {
      name: category.name,
      displayName: category.displayName,
      description: category.description,
      icon: category.icon,
      color: category.color,
      isActive: category.isActive,
      createdAt: Timestamp.now(),
      createdBy: user.uid
    };
    
    const docRef = await addDoc(collection(db, 'categories'), newCategory);
    
    // Create audit log
    await createAuditLog('categories', docRef.id, 'CREATE', null, newCategory);
    
    return {
      id: docRef.id,
      name: newCategory.name,
      displayName: newCategory.displayName,
      description: newCategory.description,
      icon: newCategory.icon,
      color: newCategory.color,
      isActive: newCategory.isActive,
      createdAt: newCategory.createdAt.toDate().toISOString(),
      createdBy: newCategory.createdBy
    };
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const categoryDocRef = doc(db, 'categories', id);
    const oldDoc = await getDoc(categoryDocRef);
    const oldData = oldDoc.data();
    
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.displayName) updateData.displayName = updates.displayName;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.icon) updateData.icon = updates.icon;
    if (updates.color) updateData.color = updates.color;
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
    
    updateData.updatedAt = Timestamp.now();
    
    await updateDoc(categoryDocRef, updateData);
    
    // Create audit log
    await createAuditLog('categories', id, 'UPDATE', oldData, updateData);
    
    const updatedDoc = await getDoc(categoryDocRef);
    const data = updatedDoc.data()!;
    return {
      id: updatedDoc.id,
      name: data.name,
      displayName: data.displayName,
      description: data.description,
      icon: data.icon,
      color: data.color,
      isActive: data.isActive,
      createdAt: data.createdAt.toDate().toISOString(),
      createdBy: data.createdBy
    };
  },

  async deleteCategory(id: string): Promise<void> {
    const categoryDocRef = doc(db, 'categories', id);
    const oldDoc = await getDoc(categoryDocRef);
    const oldData = oldDoc.data();
    
    await deleteDoc(categoryDocRef);
    
    // Create audit log
    await createAuditLog('categories', id, 'DELETE', oldData, null);
  }
};

// Topics API  
export const topicsAPI = {
  async getTopics(): Promise<Topic[]> {
    try {
      console.log('Topics: Fetching active topics...');
      // Get all topics first, then filter by status (avoids index requirement)
      const q = query(collection(db, 'topics'));
      const querySnapshot = await getDocs(q);
      
      console.log('Topics: Found', querySnapshot.docs.length, 'total topics, filtering for active...');
      
      const topics = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            displayName: data.displayName,
            slug: data.slug,
            description: data.description,
            category: data.category,
            questionCount: data.questionCount || 0,
            averageAccuracy: data.averageAccuracy || 0,
            status: data.status,
            data: data // Include raw data for debugging
          };
        })
        .filter(topic => {
          console.log('Topic status check:', topic.displayName, 'status:', topic.status);
          return topic.status === 'active';
        })
        .sort((a, b) => a.displayName.localeCompare(b.displayName));
      
      console.log('Topics: Found', topics.length, 'active topics after filtering');
      return topics;
    } catch (error) {
      console.error('Topics: Error fetching topics:', error);
      return [];
    }
  },

  async getAllTopics(): Promise<Topic[]> {
    try {
      console.log('Topics: Fetching ALL topics (any status)...');
      const q = query(collection(db, 'topics'), orderBy('displayName'));
      const querySnapshot = await getDocs(q);
      
      console.log('Topics: Found', querySnapshot.docs.length, 'total topics');
      
      const topics = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('All topics - Topic data:', { id: doc.id, ...data });
        return {
          id: doc.id,
          displayName: data.displayName,
          slug: data.slug,
          description: data.description,
          category: data.category,
          questionCount: data.questionCount || 0,
          averageAccuracy: data.averageAccuracy || 0,
          status: data.status
        };
      });
      
      return topics;
    } catch (error) {
      console.error('Topics: Error fetching all topics:', error);
      return [];
    }
  },

  async getTopicById(id: string): Promise<Topic | null> {
    const docSnap = await getDoc(doc(db, 'topics', id));
    if (!docSnap.exists()) return null;
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      displayName: data.displayName,
      slug: data.slug,
      description: data.description,
      category: data.category,
      questionCount: data.questionCount || 0,
      averageAccuracy: data.averageAccuracy || 0,
      status: data.status
    };
  },

  async createTopic(topic: Omit<Topic, 'id' | 'questionCount' | 'averageAccuracy'>): Promise<Topic> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const newTopic = {
      displayName: topic.displayName,
      slug: topic.slug,
      description: topic.description,
      category: topic.category,
      status: topic.status || 'active', // Default to 'active' if not specified
      questionCount: 0,
      averageAccuracy: 0,
      createdAt: Timestamp.now(),
      createdBy: user.uid,
      stats: {
        totalAttempts: 0,
        avgScore: 0,
        avgTime: 0
      }
    };
    
    const docRef = await addDoc(collection(db, 'topics'), newTopic);
    
    // Create audit log
    await createAuditLog('topics', docRef.id, 'CREATE', null, newTopic);
    
    return {
      id: docRef.id,
      displayName: newTopic.displayName,
      slug: newTopic.slug,
      description: newTopic.description,
      category: newTopic.category,
      questionCount: newTopic.questionCount,
      averageAccuracy: newTopic.averageAccuracy,
      status: newTopic.status
    };
  },

  async updateTopic(id: string, updates: Partial<Topic>): Promise<Topic> {
    const topicDocRef = doc(db, 'topics', id);
    const oldDoc = await getDoc(topicDocRef);
    const oldData = oldDoc.data();
    
    const updateData: any = {};
    if (updates.displayName) updateData.displayName = updates.displayName;
    if (updates.slug) updateData.slug = updates.slug;
    if (updates.description) updateData.description = updates.description;
    if (updates.category) updateData.category = updates.category;
    if (updates.status) updateData.status = updates.status;
    
    updateData.updatedAt = Timestamp.now();
    
    await updateDoc(topicDocRef, updateData);
    
    // Create audit log
    await createAuditLog('topics', id, 'UPDATE', oldData, updateData);
    
    const updatedDoc = await getDoc(topicDocRef);
    const data = updatedDoc.data()!;
    return {
      id: updatedDoc.id,
      displayName: data.displayName,
      slug: data.slug,
      description: data.description,
      category: data.category,
      questionCount: data.questionCount || 0,
      averageAccuracy: data.averageAccuracy || 0,
      status: data.status
    };
  },

  async deleteTopic(id: string): Promise<void> {
    const topicDocRef = doc(db, 'topics', id);
    const oldDoc = await getDoc(topicDocRef);
    const oldData = oldDoc.data();
    
    await deleteDoc(topicDocRef);
    
    // Create audit log
    await createAuditLog('topics', id, 'DELETE', oldData, null);
  }
};

// Questions API
export const questionsAPI = {
  async getQuestionsByTopic(topicId: string): Promise<Question[]> {
    try {
      console.log('Questions: Loading questions for topic:', topicId);
      // Get all questions first, then filter by isActive (avoids index requirement)
      const q = query(collection(db, 'topics', topicId, 'questions'));
      const querySnapshot = await getDocs(q);
      
      console.log('Questions: Found', querySnapshot.docs.length, 'total questions, filtering for active...');
      
      const questions = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            topicId: data.topicId,
            type: data.type,
            content: data.content,
            options: data.options,
            correctAnswers: data.correctAnswers,
            explanation: data.explanation,
            difficulty: data.difficulty,
            timeLimit: data.timeLimit,
            isActive: data.isActive,
            createdAt: data.createdAt
          };
        })
        .filter(question => {
          console.log('Question active check:', question.content.substring(0, 50), 'isActive:', question.isActive);
          return question.isActive !== false; // Include questions where isActive is true or undefined
        })
        .sort((a, b) => {
          // Sort by createdAt if available, otherwise by id
          if (a.createdAt && b.createdAt) {
            return a.createdAt.toMillis() - b.createdAt.toMillis();
          }
          return a.id.localeCompare(b.id);
        });
      
      console.log('Questions: Found', questions.length, 'active questions after filtering');
      return questions;
    } catch (error) {
      console.error('Questions: Error fetching questions:', error);
      return [];
    }
  },

  async createQuestion(question: Omit<Question, 'id'>): Promise<Question> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    const newQuestion = {
      topicId: question.topicId,
      type: question.type,
      content: question.content,
      options: question.options,
      correctAnswers: question.correctAnswers,
      explanation: question.explanation,
      difficulty: question.difficulty,
      timeLimit: question.timeLimit,
      createdAt: Timestamp.now(),
      createdBy: user.uid,
      isActive: true
    };
    
    const docRef = await addDoc(
      collection(db, 'topics', question.topicId, 'questions'),
      newQuestion
    );
    
    // Update topic question count
    const topicRef = doc(db, 'topics', question.topicId);
    await updateDoc(topicRef, {
      questionCount: increment(1)
    });
    
    // Create audit log
    await createAuditLog('questions', docRef.id, 'CREATE', null, newQuestion);
    
    return {
      id: docRef.id,
      topicId: newQuestion.topicId,
      type: newQuestion.type,
      content: newQuestion.content,
      options: newQuestion.options,
      correctAnswers: newQuestion.correctAnswers,
      explanation: newQuestion.explanation,
      difficulty: newQuestion.difficulty,
      timeLimit: newQuestion.timeLimit
    };
  },

  async updateQuestion(id: string, updates: Partial<Question>): Promise<Question> {
    if (!updates.topicId) throw new Error('Topic ID is required for question updates');
    
    const questionDocRef = doc(db, 'topics', updates.topicId, 'questions', id);
    const oldDoc = await getDoc(questionDocRef);
    const oldData = oldDoc.data();
    
    const updateData: any = {};
    if (updates.content) updateData.content = updates.content;
    if (updates.options) updateData.options = updates.options;
    if (updates.correctAnswers) updateData.correctAnswers = updates.correctAnswers;
    if (updates.explanation) updateData.explanation = updates.explanation;
    if (updates.difficulty) updateData.difficulty = updates.difficulty;
    if (updates.timeLimit) updateData.timeLimit = updates.timeLimit;
    
    updateData.updatedAt = Timestamp.now();
    
    await updateDoc(questionDocRef, updateData);
    
    // Create audit log
    await createAuditLog('questions', id, 'UPDATE', oldData, updateData);
    
    const updatedDoc = await getDoc(questionDocRef);
    const data = updatedDoc.data()!;
    return {
      id: updatedDoc.id,
      topicId: data.topicId,
      type: data.type,
      content: data.content,
      options: data.options,
      correctAnswers: data.correctAnswers,
      explanation: data.explanation,
      difficulty: data.difficulty,
      timeLimit: data.timeLimit
    };
  },

  async deleteQuestion(topicId: string, questionId: string): Promise<void> {
    const questionDocRef = doc(db, 'topics', topicId, 'questions', questionId);
    const oldDoc = await getDoc(questionDocRef);
    const oldData = oldDoc.data();
    
    await deleteDoc(questionDocRef);
    
    // Update topic question count
    const topicRef = doc(db, 'topics', topicId);
    await updateDoc(topicRef, {
      questionCount: increment(-1)
    });
    
    // Create audit log
    await createAuditLog('questions', questionId, 'DELETE', oldData, null);
  }
};

// Quiz API
export const quizAPI = {
  async submitQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'completedAt'>): Promise<QuizAttempt> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');
    
    // Serialize nested arrays for Firestore compatibility
    const serializedQuestions = attempt.questions.map(q => ({
      id: q.id,
      topicId: q.topicId,
      type: q.type,
      content: q.content,
      options: q.options, // Keep as array (single level is OK)
      correctAnswers: q.correctAnswers, // Keep as array (single level is OK)
      explanation: q.explanation,
      difficulty: q.difficulty,
      timeLimit: q.timeLimit
    }));
    
    // Convert 2D answers array to flat structure
    const serializedAnswers = attempt.answers.map((answerSet, index) => ({
      questionIndex: index,
      selectedOptions: answerSet || []
    }));
    
    const newAttempt: any = {
      userId: attempt.userId,
      topicId: attempt.topicId,
      questions: serializedQuestions,
      answers: serializedAnswers, // Flattened structure for Firestore
      score: attempt.score,
      accuracy: attempt.accuracy,
      avgTime: attempt.avgTime,
      streak: attempt.streak,
      completedAt: Timestamp.now(),
      metadata: {
        userAgent: navigator.userAgent,
        deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop'
      }
    };
    
    console.log('Quiz: Submitting attempt with serialized data');
    const docRef = await addDoc(collection(db, 'quizAttempts'), newAttempt);
    
    // Update user stats after successful submission
    await updateUserStats(attempt.userId, {
      score: attempt.score,
      accuracy: attempt.accuracy,
      avgTime: attempt.avgTime,
      topicId: attempt.topicId
    });
    
    // Convert back to original format for return value
    const originalAnswers = serializedAnswers.map(a => a.selectedOptions);
    
    return {
      id: docRef.id,
      userId: newAttempt.userId,
      topicId: newAttempt.topicId,
      questions: attempt.questions, // Return original questions format
      answers: originalAnswers, // Convert back to 2D array
      score: newAttempt.score,
      accuracy: newAttempt.accuracy,
      avgTime: newAttempt.avgTime,
      streak: newAttempt.streak,
      completedAt: newAttempt.completedAt.toDate().toISOString()
    };
  },

  async getUserQuizAttempts(userId: string): Promise<QuizAttempt[]> {
    const q = query(
      collection(db, 'quizAttempts'),
      where('userId', '==', userId),
      orderBy('completedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        topicId: data.topicId,
        questions: data.questions,
        answers: data.answers,
        score: data.score,
        accuracy: data.accuracy,
        avgTime: data.avgTime,
        streak: data.streak,
        completedAt: data.completedAt.toDate().toISOString()
      };
    });
  }
};

// Dashboard API
export const dashboardAPI = {
  async getUserDashboardStats(userId: string): Promise<DashboardStats> {
    try {
      console.log('Dashboard: Fetching stats for user:', userId);
      const userStatsDoc = await getDoc(doc(db, 'userStats', userId));
      
      if (!userStatsDoc.exists()) {
        console.log('Dashboard: No user stats found, returning defaults');
        // Return default stats for new users
        return {
          totalPoints: 0,
          overallAccuracy: 0,
          avgResponseTime: 0,
          currentStreak: 0,
          weeklyQuizzes: 0,
          topCategory: 'sensor'
        };
      }
      
      const data = userStatsDoc.data();
      console.log('Dashboard: User stats found:', data);
      return {
        totalPoints: data.totalPoints || 0,
        overallAccuracy: data.overallAccuracy || 0,
        avgResponseTime: data.avgResponseTime || 0,
        currentStreak: data.currentStreak || 0,
        weeklyQuizzes: data.weeklyQuizzes || 0,
        topCategory: data.bestCategory || 'sensor'
      };
    } catch (error) {
      console.error('Dashboard: Error fetching user stats:', error);
      // Return defaults on error
      return {
        totalPoints: 0,
        overallAccuracy: 0,
        avgResponseTime: 0,
        currentStreak: 0,
        weeklyQuizzes: 0,
        topCategory: 'sensor'
      };
    }
  }
};

// Leaderboard API
export const leaderboardAPI = {
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const q = query(
      collection(db, 'userStats'),
      orderBy('totalPoints', 'desc'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    
    const leaderboard: LeaderboardEntry[] = [];
    
    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();
      const userDocRef = doc(db, 'users', data.userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        leaderboard.push({
          id: docSnapshot.id,
          userId: data.userId,
          name: userData.name,
          avatar: userData.avatar,
          weeklyPoints: data.totalPoints, // TODO: Calculate actual weekly points
          accuracy: data.overallAccuracy || 0,
          avgResponseTime: data.avgResponseTime || 0,
          bestCategory: data.bestCategory || 'sensor',
          currentStreak: data.currentStreak || 0
        });
      }
    }
    
    return leaderboard;
  }
};

// Audit API
export const auditAPI = {
  async getAuditLogs(collectionName?: string, recordId?: string, limitCount: number = 50): Promise<AuditLog[]> {
    let q = query(
      collection(db, 'auditLogs'),
      orderBy('changedAt', 'desc'),
      limit(limitCount)
    );
    
    if (collectionName) {
      q = query(
        collection(db, 'auditLogs'),
        where('collection', '==', collectionName),
        orderBy('changedAt', 'desc'),
        limit(limitCount)
      );
    }
    
    if (recordId) {
      q = query(
        collection(db, 'auditLogs'),
        where('documentId', '==', recordId),
        orderBy('changedAt', 'desc'),
        limit(limitCount)
      );
    }
    
    const querySnapshot = await getDocs(q);
    const auditLogs: AuditLog[] = [];
    
    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();
      const userDocRef = doc(db, 'users', data.changedBy);
      const userDoc = await getDoc(userDocRef);
      
      let userName = 'Unknown User';
      let userEmail = '';
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        userName = userData.name;
        userEmail = userData.email;
      }
      
      auditLogs.push({
        id: docSnapshot.id,
        tableName: data.collection,
        recordId: data.documentId,
        action: data.action,
        oldValues: data.oldValues,
        newValues: data.newValues,
        changedBy: data.changedBy,
        changedAt: data.changedAt.toDate().toISOString(),
        ipAddress: data.metadata?.ipAddress,
        userAgent: data.metadata?.userAgent,
        user: {
          name: userName,
          email: userEmail
        }
      });
    }
    
    return auditLogs;
  },

  async getTopicAuditLogs(topicId: string): Promise<AuditLog[]> {
    return this.getAuditLogs('topics', topicId);
  },

  async getQuestionAuditLogs(questionId: string): Promise<AuditLog[]> {
    return this.getAuditLogs('questions', questionId);
  },

  async getCategoryAuditLogs(categoryId: string): Promise<AuditLog[]> {
    return this.getAuditLogs('categories', categoryId);
  }
};

// Debug function - you can call this from browser console
(window as any).debugFirestore = async () => {
  try {
    console.log('=== FIRESTORE DEBUG ===');
    
    // Check current user
    const currentUser = auth.currentUser;
    console.log('Current user:', currentUser?.email, currentUser?.uid);
    
    // Check all topics
    console.log('--- ALL TOPICS ---');
    const allTopics = await topicsAPI.getAllTopics();
    console.log('All topics:', allTopics);
    
    // Check active topics specifically
    console.log('--- ACTIVE TOPICS ---');
    const activeTopics = await topicsAPI.getTopics();
    console.log('Active topics:', activeTopics);
    
    // Check user stats
    if (currentUser) {
      console.log('--- USER STATS ---');
      const userStats = await dashboardAPI.getUserDashboardStats(currentUser.uid);
      console.log('User stats:', userStats);
    }
    
    console.log('=== DEBUG COMPLETE ===');
  } catch (error) {
    console.error('Debug error:', error);
  }
}; 