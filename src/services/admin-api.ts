import { 
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  signInWithEmailAndPassword
} from 'firebase/auth';
import {
  doc,
  setDoc,
  addDoc,
  collection,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { UserRole } from '../types';

interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  department?: string;
  notes?: string;
}

// Admin API for user management
export const adminAPI = {
  async createUser(userData: CreateUserData): Promise<void> {
    const currentUser = auth.currentUser;
    const currentUserEmail = currentUser?.email;
    
    if (!currentUser) {
      throw new Error('Must be authenticated to create users');
    }

    try {
      // Create the user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const newUser = userCredential.user;

      // Update the user's display name
      await updateProfile(newUser, {
        displayName: userData.name
      });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', newUser.uid), {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        department: userData.department || '',
        avatar: '',
        joinedAt: Timestamp.now(),
        lastLoginAt: Timestamp.now(),
        createdBy: currentUser.uid,
        isActive: true,
        notes: userData.notes || '',
        authProvider: 'email_password'
      });

      // Initialize user stats
      await setDoc(doc(db, 'userStats', newUser.uid), {
        userId: newUser.uid,
        totalPoints: 0,
        overallAccuracy: 0,
        avgResponseTime: 0,
        currentStreak: 0,
        totalQuizzes: 0,
        weeklyQuizzes: 0,
        weeklyStats: {},
        categoryStats: {},
        bestCategory: '',
        lastUpdated: Timestamp.now()
      });

      // Create audit log
      await addDoc(collection(db, 'auditLogs'), {
        collection: 'users',
        documentId: newUser.uid,
        action: 'CREATE',
        oldValues: null,
        newValues: {
          email: userData.email,
          name: userData.name,
          role: userData.role,
          department: userData.department,
          authProvider: 'email_password'
        },
        changedBy: currentUser.uid,
        changedAt: Timestamp.now(),
        notes: `Admin created user: ${userData.notes || 'No notes'}`
      });

      console.log('✅ User created successfully:', newUser.uid);
      
      // Note: Admin will be signed out due to Firebase Auth limitations
      // when creating a new user. The UI will handle re-authentication.
      
    } catch (error: any) {
      console.error('❌ Error creating user:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email address is already registered');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use at least 6 characters');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address format');
      } else {
        throw new Error(error.message || 'Failed to create user');
      }
    }
  },

  async updateUserRole(userId: string, newRole: UserRole): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Must be authenticated to update user roles');
    }

    try {
      // Get the old user data for audit log
      const userDocRef = doc(db, 'users', userId);
      
      // Update user role
      await setDoc(userDocRef, {
        role: newRole,
        updatedAt: Timestamp.now(),
        updatedBy: currentUser.uid
      }, { merge: true });

      // Create audit log
      await addDoc(collection(db, 'auditLogs'), {
        collection: 'users',
        documentId: userId,
        action: 'UPDATE',
        oldValues: { role: 'previous_role' }, // Would need to fetch this
        newValues: { role: newRole },
        changedBy: currentUser.uid,
        changedAt: Timestamp.now(),
        notes: `Role updated by admin`
      });

      console.log('✅ User role updated successfully:', userId, newRole);
      
    } catch (error: any) {
      console.error('❌ Error updating user role:', error);
      throw new Error(error.message || 'Failed to update user role');
    }
  },

  async deactivateUser(userId: string): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Must be authenticated to deactivate users');
    }

    try {
      // Update user status
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, {
        isActive: false,
        deactivatedAt: Timestamp.now(),
        deactivatedBy: currentUser.uid
      }, { merge: true });

      // Create audit log
      await addDoc(collection(db, 'auditLogs'), {
        collection: 'users',
        documentId: userId,
        action: 'UPDATE',
        oldValues: { isActive: true },
        newValues: { isActive: false },
        changedBy: currentUser.uid,
        changedAt: Timestamp.now(),
        notes: `User deactivated by admin`
      });

      console.log('✅ User deactivated successfully:', userId);
      
    } catch (error: any) {
      console.error('❌ Error deactivating user:', error);
      throw new Error(error.message || 'Failed to deactivate user');
    }
  }
};
