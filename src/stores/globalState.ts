import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface GlobalState {
  // Data invalidation flags
  categoriesNeedRefresh: boolean;
  topicsNeedRefresh: boolean;
  questionsNeedRefresh: boolean;
  dashboardNeedsRefresh: boolean;
  userStatsNeedRefresh: boolean;
  
  // Refresh timestamps for cache invalidation
  lastCategoryUpdate: number;
  lastTopicUpdate: number;
  lastQuestionUpdate: number;
  lastUserStatsUpdate: number;
}

interface GlobalStateActions {
  // Actions to trigger refreshes
  invalidateCategories: () => void;
  invalidateTopics: () => void;
  invalidateQuestions: () => void;
  invalidateDashboard: () => void;
  invalidateUserStats: () => void;
  invalidateAll: () => void;
  
  // Mark data as fresh
  markCategoriesFresh: () => void;
  markTopicsFresh: () => void;
  markQuestionsFresh: () => void;
  markDashboardFresh: () => void;
  markUserStatsFresh: () => void;
}

const GlobalStateContext = createContext<(GlobalState & GlobalStateActions) | null>(null);

export function GlobalStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GlobalState>({
    categoriesNeedRefresh: false,
    topicsNeedRefresh: false,
    questionsNeedRefresh: false,
    dashboardNeedsRefresh: false,
    userStatsNeedRefresh: false,
    lastCategoryUpdate: Date.now(),
    lastTopicUpdate: Date.now(),
    lastQuestionUpdate: Date.now(),
    lastUserStatsUpdate: Date.now()
  });

  const invalidateCategories = useCallback(() => {
    setState(prev => ({
      ...prev,
      categoriesNeedRefresh: true,
      lastCategoryUpdate: Date.now(),
      // Categories affect topics and dashboard
      topicsNeedRefresh: true,
      dashboardNeedsRefresh: true
    }));
  }, []);

  const invalidateTopics = useCallback(() => {
    setState(prev => ({
      ...prev,
      topicsNeedRefresh: true,
      lastTopicUpdate: Date.now(),
      // Topics affect dashboard and questions
      dashboardNeedsRefresh: true,
      questionsNeedRefresh: true
    }));
  }, []);

  const invalidateQuestions = useCallback(() => {
    setState(prev => ({
      ...prev,
      questionsNeedRefresh: true,
      lastQuestionUpdate: Date.now(),
      // Questions affect dashboard stats
      dashboardNeedsRefresh: true
    }));
  }, []);

  const invalidateDashboard = useCallback(() => {
    setState(prev => ({
      ...prev,
      dashboardNeedsRefresh: true
    }));
  }, []);

  const invalidateUserStats = useCallback(() => {
    setState(prev => ({
      ...prev,
      userStatsNeedRefresh: true,
      lastUserStatsUpdate: Date.now(),
      dashboardNeedsRefresh: true
    }));
  }, []);

  const invalidateAll = useCallback(() => {
    setState({
      categoriesNeedRefresh: true,
      topicsNeedRefresh: true,
      questionsNeedRefresh: true,
      dashboardNeedsRefresh: true,
      userStatsNeedRefresh: true,
      lastCategoryUpdate: Date.now(),
      lastTopicUpdate: Date.now(),
      lastQuestionUpdate: Date.now(),
      lastUserStatsUpdate: Date.now()
    });
  }, []);

  const markCategoriesFresh = useCallback(() => {
    setState(prev => ({ ...prev, categoriesNeedRefresh: false }));
  }, []);

  const markTopicsFresh = useCallback(() => {
    setState(prev => ({ ...prev, topicsNeedRefresh: false }));
  }, []);

  const markQuestionsFresh = useCallback(() => {
    setState(prev => ({ ...prev, questionsNeedRefresh: false }));
  }, []);

  const markDashboardFresh = useCallback(() => {
    setState(prev => ({ ...prev, dashboardNeedsRefresh: false }));
  }, []);

  const markUserStatsFresh = useCallback(() => {
    setState(prev => ({ ...prev, userStatsNeedRefresh: false }));
  }, []);

  const value = {
    ...state,
    invalidateCategories,
    invalidateTopics,
    invalidateQuestions,
    invalidateDashboard,
    invalidateUserStats,
    invalidateAll,
    markCategoriesFresh,
    markTopicsFresh,
    markQuestionsFresh,
    markDashboardFresh,
    markUserStatsFresh
  };

  return (
    <GlobalStateContext.Provider value={value}>
      {children}
    </GlobalStateContext.Provider>
  );
}

export function useGlobalState() {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
}
