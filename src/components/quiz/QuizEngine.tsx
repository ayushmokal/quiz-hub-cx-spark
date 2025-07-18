import { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle, XCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { Topic, Question } from '../../types';
import { questionsAPI, quizAPI } from '../../services/api';

interface QuizEngineProps {
  topic: Topic;
  onComplete: (score: number, accuracy: number) => void;
  onExit: () => void;
}

interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  answers: number[][];
  startTime: number;
  questionStartTime: number;
  timePerQuestion: number[];
  isSubmitting: boolean;
  showResults: boolean;
  score: number;
  accuracy: number;
}

export function QuizEngine({ topic, onComplete, onExit }: QuizEngineProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    currentQuestionIndex: 0,
    answers: [],
    startTime: Date.now(),
    questionStartTime: Date.now(),
    timePerQuestion: [],
    isSubmitting: false,
    showResults: false,
    score: 0,
    accuracy: 0
  });

  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isLoading, setIsLoading] = useState(true);

  // Load questions when component mounts
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const questions = await questionsAPI.getQuestionsByTopic(topic.id);
        if (questions.length === 0) {
          toast({
            title: "No Questions Available",
            description: "This topic doesn't have any questions yet.",
            variant: "destructive"
          });
          onExit();
          return;
        }

        // Shuffle questions and take first 10
        const shuffledQuestions = questions.sort(() => Math.random() - 0.5).slice(0, 10);
        
        setQuizState(prev => ({
          ...prev,
          questions: shuffledQuestions,
          answers: new Array(shuffledQuestions.length).fill([]),
          timePerQuestion: new Array(shuffledQuestions.length).fill(0)
        }));
        
        setTimeLeft(shuffledQuestions[0]?.timeLimit || 30);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading questions:', error);
        toast({
          title: "Error Loading Quiz",
          description: "Failed to load questions. Please try again.",
          variant: "destructive"
        });
        onExit();
      }
    };

    loadQuestions();
  }, [topic.id, toast, onExit]);

  // Timer effect
  useEffect(() => {
    if (isLoading || quizState.showResults) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleNextQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizState.currentQuestionIndex, isLoading, quizState.showResults]);

  const currentQuestion = quizState.questions[quizState.currentQuestionIndex];

  const handleAnswerSelect = (answerIndex: number) => {
    if (currentQuestion.type === 'multiple-choice') {
      setSelectedAnswers([answerIndex]);
    } else if (currentQuestion.type === 'multi-select') {
      setSelectedAnswers(prev => {
        if (prev.includes(answerIndex)) {
          return prev.filter(i => i !== answerIndex);
        } else {
          return [...prev, answerIndex];
        }
      });
    }
  };

  const handleNextQuestion = useCallback(() => {
    if (quizState.showResults) return;

    const questionTime = (Date.now() - quizState.questionStartTime) / 1000;
    
    // Update answers and time tracking
    setQuizState(prev => {
      const newAnswers = [...prev.answers];
      const newTimePerQuestion = [...prev.timePerQuestion];
      
      newAnswers[prev.currentQuestionIndex] = selectedAnswers;
      newTimePerQuestion[prev.currentQuestionIndex] = questionTime;

      if (prev.currentQuestionIndex >= prev.questions.length - 1) {
        // Quiz complete
        calculateResults(newAnswers, newTimePerQuestion, prev.questions);
        return {
          ...prev,
          answers: newAnswers,
          timePerQuestion: newTimePerQuestion,
          showResults: true
        };
      } else {
        // Next question
        const nextIndex = prev.currentQuestionIndex + 1;
        const nextQuestion = prev.questions[nextIndex];
        setTimeLeft(nextQuestion?.timeLimit || 30);
        setSelectedAnswers([]);
        
        return {
          ...prev,
          currentQuestionIndex: nextIndex,
          answers: newAnswers,
          timePerQuestion: newTimePerQuestion,
          questionStartTime: Date.now()
        };
      }
    });
  }, [selectedAnswers, quizState.questionStartTime, quizState.showResults]);

  const calculateResults = (answers: number[][], times: number[], questions: Question[]) => {
    let correctAnswers = 0;
    let totalScore = 0;

    answers.forEach((answer, index) => {
      const question = questions[index];
      const isCorrect = arraysEqual(answer.sort(), question.correctAnswers.sort());
      
      if (isCorrect) {
        correctAnswers++;
        // Score based on difficulty and time
        let baseScore = question.difficulty === 'beginner' ? 10 : 
                       question.difficulty === 'intermediate' ? 15 : 20;
        
        // Time bonus (up to 50% more points for quick answers)
        const timeBonus = Math.max(0, (question.timeLimit - times[index]) / question.timeLimit) * 0.5;
        totalScore += Math.round(baseScore * (1 + timeBonus));
      }
    });

    const accuracy = (correctAnswers / questions.length) * 100;
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;

    setQuizState(prev => ({
      ...prev,
      score: totalScore,
      accuracy: accuracy
    }));

    // Submit to backend
    submitQuizResults(totalScore, accuracy, avgTime, answers, questions);
  };

  const submitQuizResults = async (score: number, accuracy: number, avgTime: number, answers: number[][], questions: Question[]) => {
    if (!user) return;

    setQuizState(prev => ({ ...prev, isSubmitting: true }));

    try {
      await quizAPI.submitQuizAttempt({
        userId: user.id,
        topicId: topic.id,
        questions: questions,
        answers: answers,
        score: score,
        accuracy: accuracy,
        avgTime: avgTime,
        streak: 1 // TODO: Calculate actual streak
      });

      toast({
        title: "Quiz Completed!",
        description: `You scored ${score} points with ${accuracy.toFixed(1)}% accuracy.`,
        variant: "default"
      });

      // Don't call onComplete immediately - let user see results
      // onComplete will be called when they click "Back to Dashboard"
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast({
        title: "Error Saving Results",
        description: "Your quiz was completed but results couldn't be saved.",
        variant: "destructive"
      });
    } finally {
      setQuizState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const arraysEqual = (a: number[], b: number[]) => {
    return a.length === b.length && a.every((val, i) => val === b[i]);
  };

  const handleRetry = () => {
    setQuizState({
      questions: quizState.questions,
      currentQuestionIndex: 0,
      answers: new Array(quizState.questions.length).fill([]),
      startTime: Date.now(),
      questionStartTime: Date.now(),
      timePerQuestion: new Array(quizState.questions.length).fill(0),
      isSubmitting: false,
      showResults: false,
      score: 0,
      accuracy: 0
    });
    setSelectedAnswers([]);
    setTimeLeft(quizState.questions[0]?.timeLimit || 30);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (quizState.showResults) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="quiz-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {quizState.accuracy >= 70 ? (
                <CheckCircle className="h-16 w-16 text-[hsl(var(--success))]" />
              ) : (
                <XCircle className="h-16 w-16 text-destructive" />
              )}
            </div>
            <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
            <CardDescription>{topic.displayName}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Results Summary */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-accent">{quizState.score}</div>
                <div className="text-sm text-muted-foreground">Points</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[hsl(var(--success))]">
                  {quizState.accuracy.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-muted-foreground">
                  {Math.round(quizState.timePerQuestion.reduce((sum, time) => sum + time, 0) / quizState.timePerQuestion.length)}s
                </div>
                <div className="text-sm text-muted-foreground">Avg Time</div>
              </div>
            </div>

            {/* Performance Message */}
            <div className="text-center p-4 rounded-lg bg-muted/30">
              {quizState.accuracy >= 90 ? (
                <p className="text-[hsl(var(--success))]">🎉 Excellent work! You've mastered this topic.</p>
              ) : quizState.accuracy >= 70 ? (
                <p className="text-accent">👍 Good job! You have a solid understanding.</p>
              ) : (
                <p className="text-destructive">📚 Keep practicing! Review the explanations and try again.</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <Button onClick={handleRetry} variant="outline" disabled={quizState.isSubmitting}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button onClick={() => {
                onComplete(quizState.score, quizState.accuracy);
                onExit();
              }} className="quiz-button-primary">
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="text-center">
        <p>No questions available for this topic.</p>
        <Button onClick={onExit} className="mt-4">Back to Topics</Button>
      </div>
    );
  }

  const progress = ((quizState.currentQuestionIndex) / quizState.questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Quiz Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{topic.displayName}</h1>
            <p className="text-muted-foreground">
              Question {quizState.currentQuestionIndex + 1} of {quizState.questions.length}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={timeLeft <= 10 ? "destructive" : "secondary"}>
              <Clock className="mr-1 h-3 w-3" />
              {timeLeft}s
            </Badge>
            <Badge className={`category-${topic.category}`}>
              {currentQuestion.difficulty}
            </Badge>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card className="quiz-card mb-6">
        <CardHeader>
          <CardTitle className="text-lg leading-relaxed">
            {currentQuestion.content}
          </CardTitle>
          {currentQuestion.type === 'multi-select' && (
            <CardDescription>
              Select all that apply
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={index}
                variant={selectedAnswers.includes(index) ? "default" : "outline"}
                className={`w-full text-left justify-start p-4 h-auto whitespace-normal ${
                  selectedAnswers.includes(index) 
                    ? 'bg-gradient-to-r from-accent to-[hsl(267_100%_70%)] text-white' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handleAnswerSelect(index)}
              >
                <span className="mr-3 flex-shrink-0 w-6 h-6 rounded-full border border-current flex items-center justify-center text-sm">
                  {selectedAnswers.includes(index) ? '✓' : String.fromCharCode(65 + index)}
                </span>
                <span className="flex-1">{option}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button onClick={onExit} variant="outline">
          Exit Quiz
        </Button>
        <Button 
          onClick={handleNextQuestion}
          disabled={selectedAnswers.length === 0}
          className="quiz-button-primary"
        >
          {quizState.currentQuestionIndex >= quizState.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 