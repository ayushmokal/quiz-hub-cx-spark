import { useState, useEffect, useCallback } from 'react';
import { Target, Clock, Zap, TrendingUp, Trophy, BookOpen, Play } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardAPI, topicsAPI, quizAPI } from '../../services/api';
import { Topic, DashboardStats, QuizAttempt } from '../../types';

interface DashboardProps {
  onViewChange: (view: string) => void;
  refreshTrigger?: number; // Add prop to trigger refresh
}

export function Dashboard({ onViewChange, refreshTrigger }: DashboardProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [recentAttempts, setRecentAttempts] = useState<QuizAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('📊 Dashboard: Refreshing data for user:', user.id);
      const [userStats, availableTopics, userAttempts] = await Promise.all([
        dashboardAPI.getUserDashboardStats(user.id),
        topicsAPI.getTopics(),
        quizAPI.getUserQuizAttempts(user.id)
      ]);
      
      console.log('📊 Dashboard: Loaded stats:', userStats);
      console.log('📊 Dashboard: Recent attempts:', userAttempts);
      
      setStats(userStats);
      setTopics(availableTopics);
      // Get the 5 most recent attempts
      const sortedAttempts = userAttempts
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
        .slice(0, 5);
      setRecentAttempts(sortedAttempts);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Refresh when refreshTrigger changes
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
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="quiz-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Hello, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-muted-foreground">
              Ready to level up your customer experience skills today?
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-accent">{stats.totalPoints.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Points</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="quiz-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-[hsl(var(--warning))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalPoints.toLocaleString()}</div>
            <p className="text-xs text-[hsl(var(--success))] flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from last week
            </p>
          </CardContent>
        </Card>

        <Card className="quiz-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Accuracy</CardTitle>
            <Target className="h-4 w-4 text-[hsl(var(--success))]" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getAccuracyColor(stats.overallAccuracy)}`}>
              {stats.overallAccuracy}%
            </div>
            <Progress value={stats.overallAccuracy} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="quiz-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.avgResponseTime}s</div>
            <p className="text-xs text-muted-foreground mt-1">
              Target: &lt;25s
            </p>
          </CardContent>
        </Card>

        <Card className="quiz-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Zap className="h-4 w-4 text-[hsl(var(--warning))]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[hsl(var(--warning))]">{stats.currentStreak}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Best: 15 questions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Topics Grid */}
      <Card className="quiz-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Knowledge Topics
          </CardTitle>
          <CardDescription>
            Track your progress across different CX domains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topics.slice(0, 6).map((topic) => (
              <div
                key={topic.id}
                className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer group"
                onClick={() => onViewChange('quiz')}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                      {topic.displayName}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {topic.description}
                    </p>
                  </div>
                  <Badge className={getCategoryClass(topic.category)}>
                    {topic.category}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Accuracy</span>
                    <span className={getAccuracyColor(topic.averageAccuracy)}>
                      {topic.averageAccuracy}%
                    </span>
                  </div>
                  <Progress 
                    value={topic.averageAccuracy} 
                    className="h-2"
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
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="quiz-card">
          <CardHeader>
            <CardTitle>Quick Quiz</CardTitle>
            <CardDescription>
              Jump into a focused practice session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={() => onViewChange('quiz')}
              className="w-full quiz-button-primary"
            >
              <Play className="mr-2 h-4 w-4" />
              Start Random Quiz
            </Button>
            <Button 
              onClick={() => onViewChange('leaderboard')}
              variant="outline" 
              className="w-full"
            >
              <Trophy className="mr-2 h-4 w-4" />
              View Leaderboard
            </Button>
          </CardContent>
        </Card>

        <Card className="quiz-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest quiz attempts and achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAttempts.length > 0 ? (
                recentAttempts.map((attempt) => (
                  <div key={attempt.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{getTopicNameById(attempt.topicId)}</p>
                      <p className="text-xs text-muted-foreground">
                        Completed {formatTimeAgo(attempt.completedAt)}
                      </p>
                    </div>
                    <Badge className={getAccuracyBadgeClass(attempt.accuracy)}>
                      {Math.round(attempt.accuracy)}%
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🎯</div>
                  <p className="text-sm text-muted-foreground">No quiz attempts yet</p>
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