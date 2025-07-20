import { useState, useEffect } from 'react';
import { Play, Clock, HelpCircle, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { topicsAPI, categoriesAPI } from '../../services/api';
import { Topic, Category } from '../../types';

interface QuizSelectionProps {
  onStartQuiz: (topic: Topic) => void;
}

export function QuizSelection({ onStartQuiz }: QuizSelectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('QuizSelection: Loading topics and categories...');
        const [availableTopics, availableCategories] = await Promise.all([
          topicsAPI.getAllTopics(), // Use getAllTopics to see all topics regardless of status
          categoriesAPI.getAllCategories() // Use getAllCategories to avoid index requirement
        ]);
        console.log('QuizSelection: Loaded topics:', availableTopics);
        console.log('QuizSelection: Loaded categories:', availableCategories);
        console.log('QuizSelection: Topic categories:', availableTopics.map(t => t.category));
        console.log('QuizSelection: Available category names:', availableCategories.map(c => c.name));
        setTopics(availableTopics);
        setCategories(availableCategories);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredTopics = selectedCategory === 'all' 
    ? topics 
    : topics.filter(topic => topic.category === selectedCategory);

  console.log('QuizSelection: Selected category:', selectedCategory);
  console.log('QuizSelection: All topics:', topics);
  console.log('QuizSelection: Filtered topics:', filteredTopics);

  const getCategoryClass = (category: string) => {
    return `category-${category} px-3 py-1 rounded-full text-xs font-medium border`;
  };

  const getDifficultyInfo = (questionCount: number) => {
    if (questionCount <= 10) return { label: 'Quick', color: 'text-[hsl(var(--success))]', icon: Target };
    if (questionCount <= 20) return { label: 'Standard', color: 'text-[hsl(var(--warning))]', icon: Clock };
    return { label: 'Comprehensive', color: 'text-destructive', icon: HelpCircle };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <Card className="quiz-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-6 w-6 text-accent" />
            Select Quiz Topic
          </CardTitle>
          <CardDescription>
            Choose a knowledge domain to test your expertise and improve your CX skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Filter by Category
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              {isLoading ? "Loading..." : `${filteredTopics.length} topics available`}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Topics Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="quiz-card animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-muted rounded w-full mb-2"></div>
                <div className="h-12 bg-muted rounded w-full"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-16 bg-muted rounded"></div>
                  <div className="h-16 bg-muted rounded"></div>
                </div>
                <div className="h-10 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTopics.map((topic) => {
            const difficultyInfo = getDifficultyInfo(topic.questionCount);
            const DifficultyIcon = difficultyInfo.icon;

          return (
            <Card key={topic.id} className="quiz-card group hover:scale-105 transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge className={getCategoryClass(topic.category)}>
                    {topic.category.toUpperCase()}
                  </Badge>
                  <div className={`flex items-center gap-1 ${difficultyInfo.color}`}>
                    <DifficultyIcon className="h-4 w-4" />
                    <span className="text-xs font-medium">{difficultyInfo.label}</span>
                  </div>
                </div>
                <CardTitle className="text-lg group-hover:text-accent transition-colors">
                  {topic.displayName}
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {topic.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-muted/20 rounded-lg">
                    <div className="text-lg font-bold text-foreground">{topic.questionCount}</div>
                    <div className="text-muted-foreground">Questions</div>
                  </div>
                  <div className="text-center p-3 bg-muted/20 rounded-lg">
                    <div className={`text-lg font-bold ${
                      topic.averageAccuracy >= 80 ? 'text-[hsl(var(--success))]' :
                      topic.averageAccuracy >= 60 ? 'text-[hsl(var(--warning))]' : 'text-destructive'
                    }`}>
                      {topic.averageAccuracy}%
                    </div>
                    <div className="text-muted-foreground">Avg Score</div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    ~{Math.ceil(topic.questionCount * 0.5)} min
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {topic.status}
                  </div>
                </div>

                {/* Start Button */}
                <Button
                  onClick={() => onStartQuiz(topic)}
                  className="w-full quiz-button-primary group-hover:scale-105 transition-transform"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Quiz
                </Button>
              </CardContent>
            </Card>
          );
        })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredTopics.length === 0 && (
        <Card className="quiz-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No topics found</h3>
            <p className="text-muted-foreground text-center mb-4">
              {topics.length === 0 
                ? "No quiz topics are available yet. Please contact an administrator to create some topics."
                : "No quiz topics match your current filter selection."
              }
            </p>
            {topics.length > 0 && (
              <Button 
                onClick={() => setSelectedCategory('all')}
                variant="outline"
              >
                Show All Topics
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}