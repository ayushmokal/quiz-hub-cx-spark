import { useState, useEffect, useCallback } from 'react';
import { Target, Clock, Zap, TrendingUp, Trophy, BookOpen, Play } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { useAuth } from '../../contexts/AuthContext';
import { useGlobalState } from '../../contexts/GlobalStateContext';
import { dashboardAPI, topicsAPI, quizAPI } from '../../services/api';
import { Topic, DashboardStats, QuizAttempt } from '../../types';
import { analytics } from '../../services/analytics';

interface DashboardProps {
  onViewChange: (view: string) => void;
  refreshTrigger?: number; // Add prop to trigger refresh
}

export function Dashboard({ onViewChange, refreshTrigger }: DashboardProps) {
  const { user } = useAuth();
  const { 
    dashboardNeedsRefresh, 
    topicsNeedRefresh, 
    markDashboardFresh, 
    markTopicsFresh 
  } = useGlobalState();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<QuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('📊 Dashboard: Refreshing data for user:', user.id);
      
      // Load data with error handling for each API call
      const [userStats, availableTopics, userAttempts] = await Promise.allSettled([
        dashboardAPI.getUserDashboardStats(user.id),
        topicsAPI.getTopics(),
        quizAPI.getUserQuizAttempts(user.id)
      ]);
      
      // Handle user stats
      if (userStats.status === 'fulfilled') {
        console.log('📊 Dashboard: Loaded stats:', userStats.value);
        setStats(userStats.value);
      } else {
        console.error('📊 Dashboard: Failed to load user stats:', userStats.reason);
        setStats(null);
      }
      
      // Handle topics
      if (availableTopics.status === 'fulfilled') {
        console.log('📊 Dashboard: Loaded topics:', availableTopics.value.length);
        setTopics(availableTopics.value);
      } else {
        console.error('📊 Dashboard: Failed to load topics:', availableTopics.reason);
        setTopics([]);
      }
      
      // Handle quiz attempts
      if (userAttempts.status === 'fulfilled') {
        console.log('📊 Dashboard: Recent attempts:', userAttempts.value);
        // Get the 5 most recent attempts
        const sortedAttempts = userAttempts.value
          .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
          .slice(0, 5);
        setRecentAttempts(sortedAttempts);
      } else {
        console.error('📊 Dashboard: Failed to load quiz attempts:', userAttempts.reason);
        setRecentAttempts([]);
      }
      
      // Mark data as fresh in global state
      markDashboardFresh();
      markTopicsFresh();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, markDashboardFresh, markTopicsFresh]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Track dashboard view
  useEffect(() => {
    if (user) {
      analytics.trackDashboardView();
      analytics.trackPageView('dashboard', { user_role: user.role });
    }
  }, [user]);

  // Listen for global state changes
  useEffect(() => {
    if (dashboardNeedsRefresh || topicsNeedRefresh) {
      console.log('📊 Dashboard: Global state triggered refresh', { 
        dashboardNeedsRefresh, 
        topicsNeedRefresh 
      });
      loadDashboardData();
    }
  }, [dashboardNeedsRefresh, topicsNeedRefresh, loadDashboardData]);

  // Refresh when refreshTrigger changes (legacy support)
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      console.log('Dashboard: Triggered refresh due to refreshTrigger:', refreshTrigger);
      // Add a small delay to ensure backend stats are updated
      setTimeout(() => {
        loadDashboardData();
      }, 1000);
    }
  }, [refreshTrigger, loadDashboardData]);

  const getCategoryClass = (category: string) => {
    return `category-${category} px-3 py-1 rounded-full text-xs font-medium border`;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-[hsl(var(--success))]';
    if (accuracy >= 60) return 'text-[hsl(var(--warning))]';
    return 'text-destructive';
  };

  const getAccuracyBadgeClass = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20';
    if (accuracy >= 60) return 'bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/20';
    return 'bg-destructive/10 text-destructive border-destructive/20';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const getTopicNameById = (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    return topic?.displayName || 'Unknown Topic';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Error loading dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="quiz-card p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Hello, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Ready to level up your customer experience skills today?
            </p>
          </div>
          <div className="text-right">
            <div className="text-xl md:text-2xl font-bold text-accent">{stats.totalPoints.toLocaleString()}</div>
            <div className="text-xs md:text-sm text-muted-foreground">Total Points</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="quiz-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Total Points</CardTitle>
            <Trophy className="h-3 w-3 md:h-4 md:w-4 text-[hsl(var(--warning))]" />
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="text-lg md:text-2xl font-bold text-foreground">{stats.totalPoints.toLocaleString()}</div>
            <p className="text-xs text-[hsl(var(--success))] flex items-center mt-1">
              <TrendingUp className="h-2 w-2 md:h-3 md:w-3 mr-1" />
              +12% from last week
            </p>
          </CardContent>
        </Card>

        <Card className="quiz-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Overall Accuracy</CardTitle>
            <Target className="h-3 w-3 md:h-4 md:w-4 text-[hsl(var(--success))]" />
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className={`text-lg md:text-2xl font-bold ${getAccuracyColor(stats.overallAccuracy)}`}>
              {stats.overallAccuracy}%
            </div>
            <Progress value={stats.overallAccuracy} className="mt-2 h-1 md:h-2" />
          </CardContent>
        </Card>

        <Card className="quiz-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-3 w-3 md:h-4 md:w-4 text-accent" />
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="text-lg md:text-2xl font-bold text-foreground">{stats.avgResponseTime}s</div>
            <p className="text-xs text-muted-foreground mt-1">
              Target: &lt;25s
            </p>
          </CardContent>
        </Card>

        <Card className="quiz-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs md:text-sm font-medium">Current Streak</CardTitle>
            <Zap className="h-3 w-3 md:h-4 md:w-4 text-[hsl(var(--warning))]" />
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="text-lg md:text-2xl font-bold text-[hsl(var(--warning))]">{stats.currentStreak}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Best: 15 questions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Topics Grid */}
      <Card className="quiz-card">
        <CardHeader className="p-3 md:p-6">
          <CardTitle className="text-base md:text-lg flex items-center gap-2">
            <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
            Knowledge Topics
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Track your progress across different CX domains
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 md:p-6 pt-0">
          <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {topics.slice(0, 6).map((topic) => (
              <div
                key={topic.id}
                className="p-3 md:p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer group"
                onClick={() => onViewChange('quiz')}
              >
                <div className="flex items-start justify-between mb-2 md:mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm md:text-base font-semibold text-foreground group-hover:text-accent transition-colors truncate">
                      {topic.displayName}
                    </h3>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-2">
                      {topic.description}
                    </p>
                  </div>
                  <Badge className={`${getCategoryClass(topic.category)} text-xs ml-2 flex-shrink-0`}>
                    {topic.category}
                  </Badge>
                </div>
                
                <div className="space-y-1 md:space-y-2">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-muted-foreground">Accuracy</span>
                    <span className={getAccuracyColor(topic.averageAccuracy)}>
                      {topic.averageAccuracy}%
                    </span>
                  </div>
                  <Progress 
                    value={topic.averageAccuracy} 
                    className="h-1 md:h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{topic.questionCount} questions</span>
                    <span>{topic.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2">
        <Card className="quiz-card">
          <CardHeader className="p-3 md:p-6">
            <CardTitle className="text-base md:text-lg">Quick Quiz</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Jump into a focused practice session
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0 space-y-2 md:space-y-3">
            <Button 
              onClick={() => {
                analytics.trackFeatureUsed('quick_quiz_button');
                onViewChange('quiz');
              }}
              className="w-full quiz-button-primary h-auto py-2 md:py-3"
            >
              <Play className="mr-2 h-3 w-3 md:h-4 md:w-4" />
              <div className="text-left">
                <div className="text-xs md:text-sm font-medium">Start Random Quiz</div>
              </div>
            </Button>
            <Button 
              onClick={() => {
                analytics.trackFeatureUsed('leaderboard_button');
                onViewChange('leaderboard');
              }}
              variant="outline" 
              className="w-full h-auto py-2 md:py-3"
            >
              <Trophy className="mr-2 h-3 w-3 md:h-4 md:w-4" />
              <div className="text-left">
                <div className="text-xs md:text-sm font-medium">View Leaderboard</div>
              </div>
            </Button>
          </CardContent>
        </Card>

        <Card className="quiz-card">
          <CardHeader className="p-3 md:p-6">
            <CardTitle className="text-base md:text-lg">Recent Activity</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Your latest quiz attempts and achievements
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 md:p-6 pt-0">
            <div className="space-y-2 md:space-y-3">
              {recentAttempts.length > 0 ? (
                recentAttempts.map((attempt) => (
                  <div key={attempt.id} className="flex items-center justify-between p-2 md:p-3 bg-muted/20 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium truncate">{getTopicNameById(attempt.topicId)}</p>
                      <p className="text-xs text-muted-foreground">
                        Completed {formatTimeAgo(attempt.completedAt)}
                      </p>
                    </div>
                    <Badge className={`${getAccuracyBadgeClass(attempt.accuracy)} text-xs ml-2 flex-shrink-0`}>
                      {Math.round(attempt.accuracy)}%
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 md:py-8">
                  <div className="text-2xl md:text-4xl mb-2">🎯</div>
                  <p className="text-xs md:text-sm text-muted-foreground">No quiz attempts yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Take your first quiz to see activity here!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}