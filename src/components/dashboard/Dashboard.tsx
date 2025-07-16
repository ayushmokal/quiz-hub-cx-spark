import { Target, Clock, Zap, TrendingUp, Trophy, BookOpen, Play } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { useAuth } from '../../contexts/AuthContext';
import { mockDashboardStats, mockTopics } from '../../data/mockData';

interface DashboardProps {
  onViewChange: (view: string) => void;
}

export function Dashboard({ onViewChange }: DashboardProps) {
  const { user } = useAuth();
  const stats = mockDashboardStats;

  const getCategoryClass = (category: string) => {
    return `category-${category} px-3 py-1 rounded-full text-xs font-medium border`;
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-[hsl(var(--success))]';
    if (accuracy >= 60) return 'text-[hsl(var(--warning))]';
    return 'text-destructive';
  };

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
            <div className="text-2xl font-bold text-accent">{stats.currentStreak}</div>
            <div className="text-sm text-muted-foreground">Current Streak</div>
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
            {mockTopics.map((topic) => (
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
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Sensor Troubleshooting</p>
                  <p className="text-xs text-muted-foreground">Completed 2 hours ago</p>
                </div>
                <Badge className="bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20">
                  95%
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Payment Processing</p>
                  <p className="text-xs text-muted-foreground">Completed yesterday</p>
                </div>
                <Badge className="bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/20">
                  78%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}