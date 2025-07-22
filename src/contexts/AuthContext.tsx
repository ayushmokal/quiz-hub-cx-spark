import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authAPI } from '../services/firebase-api';
import { analytics } from '../services/analytics';
import { ErrorTracker, PerformanceMonitor } from '../services/monitoring';

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
        const result = await authAPI.handleRedirectResult();
        if (result) {
          // Redirect result processed successfully
        }
      } catch (error) {
        console.error('Redirect result error:', error);
      }
    };
    
    initAuth();
    
    // Listen for auth changes using Firebase
    const unsubscribe = authAPI.onAuthStateChanged((user) => {
      setUser(user);
      setIsLoading(false);
      
      // Track user authentication with Mixpanel
      if (user) {
        analytics.identify(user.id, {
          email: user.email,
          role: user.role,
          department: user.department,
          name: user.name,
          created_at: user.joinedAt
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      PerformanceMonitor.startTrace('auth_login_email');
      const user = await authAPI.signIn(email, password);
      setUser(user);
      
      // Track login event
      analytics.trackLogin('email', user.role);
      ErrorTracker.setUser({
        id: user.id,
        email: user.email,
        username: user.name
      });
      
      PerformanceMonitor.stopTrace('auth_login_email');
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      
      // Track login error
      const errorInstance = error instanceof Error ? error : new Error('Login failed');
      ErrorTracker.trackAuthError(errorInstance, 'email_login');
      
      analytics.trackError({
        error_type: 'authentication',
        error_message: errorInstance.message,
        user_action: 'email_login'
      });
      
      PerformanceMonitor.stopTrace('auth_login_email');
      setIsLoading(false);
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      await authAPI.signInWithGoogle();
      // The auth state change listener will handle setting the user and tracking
      return true;
    } catch (error: any) {
      console.error('Google login error:', error);
      
      // Track Google login error
      analytics.trackError({
        error_type: 'authentication',
        error_message: error.message || 'Google login failed',
        user_action: 'google_login'
      });
      
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
      // Track logout before clearing user
      analytics.trackLogout();
      
      await authAPI.signOut();
      setUser(null);
      
      // Reset Mixpanel identity
      analytics.reset();
    } catch (error) {
      console.error('Logout error:', error);
      
      // Track logout error
      analytics.trackError({
        error_type: 'authentication',
        error_message: error instanceof Error ? error.message : 'Logout failed',
        user_action: 'logout'
      });
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