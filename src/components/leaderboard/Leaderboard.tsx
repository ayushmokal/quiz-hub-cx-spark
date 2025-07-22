import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Clock, Target, Zap, Crown, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { leaderboardAPI } from '../../services/api';
import { LeaderboardEntry } from '../../types';

export function Leaderboard() {
  const [period, setPeriod] = useState<'current' | 'last'>('current');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const data = await leaderboardAPI.getLeaderboard();
        setLeaderboard(data);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, []);
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-[hsl(var(--warning))]" />;
      case 2: return <Medal className="h-5 w-5 text-muted-foreground" />;
      case 3: return <Award className="h-5 w-5 text-[hsl(var(--category-logistics))]" />;
      default: return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-[hsl(var(--warning))]/20 to-[hsl(var(--warning))]/10 border-[hsl(var(--warning))]/30';
      case 2: return 'bg-gradient-to-r from-muted/40 to-muted/20 border-border';
      case 3: return 'bg-gradient-to-r from-[hsl(var(--category-logistics))]/20 to-[hsl(var(--category-logistics))]/10 border-[hsl(var(--category-logistics))]/30';
      default: return 'quiz-card';
    }
  };

  const getCategoryClass = (category: string) => {
    return `category-${category.toLowerCase()} px-2 py-1 rounded text-xs font-medium border`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Card className="quiz-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-[hsl(var(--warning))]" />
            Leaderboard
          </CardTitle>
          <CardDescription>
            See how you stack up against other CX champions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={period} onValueChange={(value) => setPeriod(value as 'current' | 'last')}>
            <TabsList className="grid w-full grid-cols-2 md:w-64">
              <TabsTrigger value="current">Current Week</TabsTrigger>
              <TabsTrigger value="last">Last Week</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Top 3 Podium */}
      <div className="grid gap-4 md:grid-cols-3">
                    {leaderboard.slice(0, 3).map((entry, index) => {
          const rank = index + 1;
          return (
            <Card key={entry.id} className={`${getRankStyle(rank)} relative overflow-hidden`}>
              {rank === 1 && (
                <div className="absolute top-0 right-0 bg-[hsl(var(--warning))] text-white px-2 py-1 text-xs font-bold">
                  CHAMPION
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <div className="flex justify-center mb-3">
                  {getRankIcon(rank)}
                </div>
                <Avatar className="h-16 w-16 mx-auto mb-3 ring-2 ring-border">
                  <AvatarImage src={entry.avatar} alt={entry.name} />
                  <AvatarFallback className="bg-gradient-to-r from-accent to-[hsl(267_100%_70%)] text-white text-lg">
                    {entry.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-lg">{entry.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{entry.weeklyPoints.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Points</div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center p-2 bg-muted/20 rounded">
                    <div className="font-semibold text-[#08a104]">{entry.accuracy}%</div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                  </div>
                  <div className="text-center p-2 bg-muted/20 rounded">
                    <div className="font-semibold text-foreground">{entry.avgResponseTime}s</div>
                    <div className="text-xs text-muted-foreground">Avg Time</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge className={getCategoryClass(entry.bestCategory)}>
                    {entry.bestCategory}
                  </Badge>
                  <div className="flex items-center gap-1 text-[hsl(var(--warning))]">
                    <Zap className="h-3 w-3" />
                    <span className="text-sm font-medium">{entry.currentStreak}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Full Leaderboard */}
      <Card className="quiz-card">
        <CardHeader>
          <CardTitle className="text-lg">Full Rankings</CardTitle>
          <CardDescription>
            Complete leaderboard with detailed stats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboard.map((entry, index) => {
              const rank = index + 1;
              return (
                <div 
                  key={entry.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-colors hover:bg-muted/30 ${
                    rank <= 3 ? 'border-accent/30 bg-accent/5' : 'border-border'
                  }`}
                >
                  {/* Rank */}
                  <div className="w-12 flex justify-center">
                    {rank <= 3 ? (
                      getRankIcon(rank)
                    ) : (
                      <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
                    )}
                  </div>

                  {/* Avatar & Name */}
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={entry.avatar} alt={entry.name} />
                      <AvatarFallback className="bg-gradient-to-r from-accent to-[hsl(267_100%_70%)] text-white">
                        {entry.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-foreground">{entry.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Best in {entry.bestCategory}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-accent">{entry.weeklyPoints.toLocaleString()}</div>
                      <div className="text-muted-foreground">Points</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-[#08a104]">{entry.accuracy}%</div>
                      <div className="text-muted-foreground">Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-foreground">{entry.avgResponseTime}s</div>
                      <div className="text-muted-foreground">Avg Time</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-[hsl(var(--warning))] flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {entry.currentStreak}
                      </div>
                      <div className="text-muted-foreground">Streak</div>
                    </div>
                  </div>

                  {/* Mobile Stats */}
                  <div className="md:hidden text-right">
                    <div className="font-bold text-accent">{entry.weeklyPoints.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">{entry.accuracy}% acc</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="quiz-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="h-4 w-4 text-[hsl(var(--warning))]" />
              Top Performer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-foreground">{leaderboard[0]?.name || 'No data'}</div>
            <div className="text-sm text-muted-foreground">
              {leaderboard[0]?.weeklyPoints.toLocaleString() || 0} points this week
            </div>
          </CardContent>
        </Card>

        <Card className="quiz-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-[hsl(var(--success))]" />
              Highest Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-[hsl(var(--success))]">
              {leaderboard.length > 0 ? Math.max(...leaderboard.map(e => e.accuracy)) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">
              {leaderboard.length > 0 ? leaderboard.find(e => e.accuracy === Math.max(...leaderboard.map(l => l.accuracy)))?.name : 'No data'}
            </div>
          </CardContent>
        </Card>

        <Card className="quiz-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" />
              Fastest Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-accent">
              {leaderboard.length > 0 ? Math.min(...leaderboard.map(e => e.avgResponseTime)) : 0}s
            </div>
            <div className="text-sm text-muted-foreground">
              {leaderboard.length > 0 ? leaderboard.find(e => e.avgResponseTime === Math.min(...leaderboard.map(l => l.avgResponseTime)))?.name : 'No data'}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}