import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authAPI } from '../services/firebase-api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Handle redirect result if any
      try {
        await authAPI.handleRedirectResult();
      } catch (error) {
        console.error('Redirect result error:', error);
      }
    };
    
    initAuth();
    
    // Listen for auth changes using Firebase
    const unsubscribe = authAPI.onAuthStateChanged((user) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const user = await authAPI.signIn(email, password);
      setUser(user);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      await authAPI.signInWithGoogle();
      // The auth state change listener will handle setting the user
      return true;
    } catch (error: any) {
      console.error('Google login error:', error);
      
      // If redirect was initiated, don't treat it as an error
      if (error.message === 'REDIRECT_INITIATED') {
        // Don't set loading to false, let the redirect happen
        return true;
      }
      
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authAPI.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}