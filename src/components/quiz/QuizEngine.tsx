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
import { QuizResults } from './QuizResults';

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
  avgTime: number;
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
    accuracy: 0,
    avgTime: 0
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
      accuracy: accuracy,
      avgTime: avgTime,
      showResults: true
    }));

    // Submit to backend
    submitQuizResults(totalScore, accuracy, avgTime, answers, questions);
  };

  const submitQuizResults = async (score: number, accuracy: number, avgTime: number, answers: number[][], questions: Question[]) => {
    if (!user) return;

    setQuizState(prev => ({ ...prev, isSubmitting: true }));

    try {
      console.log('QuizEngine: Submitting quiz results for user:', user.id, {
        score, accuracy, avgTime, topicId: topic.id
      });
      
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

      console.log('QuizEngine: Quiz results submitted successfully');

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-slate-200 rounded-full animate-spin">
              <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Loading Quiz</h2>
            <p className="text-slate-600">Preparing your {topic.displayName} questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (quizState.showResults) {
    return (
      <QuizResults
        questions={quizState.questions}
        userAnswers={quizState.answers}
        score={quizState.score}
        accuracy={quizState.accuracy}
        avgTime={quizState.avgTime}
        topicName={topic.displayName}
        onReturnToDashboard={async () => {
          console.log('QuizEngine: Back to Dashboard clicked, calling onComplete with:', quizState.score, quizState.accuracy);
          
          // Small delay to ensure stats are saved
          await new Promise(resolve => setTimeout(resolve, 500));
          
          onComplete(quizState.score, quizState.accuracy);
          onExit();
        }}
        onRetakeQuiz={handleRetry}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center">
            <XCircle className="w-8 h-8 text-slate-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">No Questions Available</h2>
            <p className="text-slate-600">This topic doesn't have any questions yet.</p>
          </div>
          <button
            onClick={onExit}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
          >
            Back to Topics
          </button>
        </div>
      </div>
    );
  }

  const progress = ((quizState.currentQuestionIndex) / quizState.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-2 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Modern Header */}
        <div className="mb-4 md:mb-8">
          <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0 mb-4 md:mb-6">
            <div className="space-y-1 md:space-y-2">
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="px-2 py-1 md:px-3 md:py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-bold text-xs md:text-sm">
                  Q{quizState.currentQuestionIndex + 1}
                </div>
                <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                  {topic.displayName}
                </h1>
              </div>
              <p className="text-slate-500 text-sm md:text-lg font-medium">
                Question {quizState.currentQuestionIndex + 1} of {quizState.questions.length}
              </p>
            </div>
            
            {/* Status Pills */}
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className={`px-2 md:px-4 py-1 md:py-2 rounded-full font-semibold text-xs md:text-sm transition-all duration-200 ${
                timeLeft <= 10 
                  ? 'bg-red-100 text-red-700 ring-2 ring-red-200 animate-pulse' 
                  : 'bg-slate-100 text-slate-700'
              }`}>
                <Clock className="inline mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                {timeLeft}s
              </div>
              <div className="px-2 md:px-4 py-1 md:py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full font-semibold text-xs md:text-sm">
                {currentQuestion.difficulty}
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="absolute -top-1 right-0 transform translate-x-2">
              <div className="w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-sm" />
            </div>
          </div>
        </div>

        {/* Question Card - Ultra Modern Design */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl md:rounded-3xl transform rotate-1 opacity-5" />
          <div className="relative bg-white rounded-2xl md:rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
            {/* Card Header */}
            <div className="p-4 md:p-8 lg:p-10 border-b border-slate-100">
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm md:text-lg">
                    {quizState.currentQuestionIndex + 1}
                  </span>
                </div>
                {currentQuestion.type === 'multi-select' && (
                  <div className="px-2 py-1 md:px-3 md:py-1 bg-amber-100 text-amber-800 rounded-full text-xs md:text-sm font-medium">
                    Select all that apply
                  </div>
                )}
              </div>
              
              <h2 className="text-lg md:text-2xl lg:text-3xl font-bold text-slate-900 leading-relaxed">
                {currentQuestion.content}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="p-4 md:p-8 lg:p-10 space-y-3 md:space-y-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`group w-full text-left p-3 md:p-6 rounded-xl md:rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.01] ${
                    selectedAnswers.includes(index)
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg ring-4 ring-blue-100'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center font-semibold transition-all duration-200 ${
                      selectedAnswers.includes(index)
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-slate-300 text-slate-600 group-hover:border-slate-400'
                    }`}>
                      {selectedAnswers.includes(index) ? (
                        <CheckCircle className="w-3 h-3 md:w-5 md:h-5" />
                      ) : (
                        <span className="text-xs md:text-sm">{String.fromCharCode(65 + index)}</span>
                      )}
                    </div>
                    <span className={`flex-1 text-sm md:text-lg font-medium transition-colors duration-200 ${
                      selectedAnswers.includes(index) ? 'text-slate-900' : 'text-slate-700'
                    }`}>
                      {option}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation - Modern Floating Bar */}
        <div className="mt-4 md:mt-8 flex flex-col space-y-3 md:flex-row md:justify-between md:items-center md:space-y-0">
          <button
            onClick={onExit}
            className="px-4 py-2 md:px-6 md:py-3 text-slate-600 hover:text-slate-900 font-semibold transition-colors duration-200 hover:bg-slate-100 rounded-xl order-2 md:order-1"
          >
            Exit Quiz
          </button>
          
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:space-x-4 order-1 md:order-2">
            <div className="text-xs md:text-sm text-slate-500 font-medium text-center md:text-left">
              {selectedAnswers.length === 0 ? 'Select an answer to continue' : 'Ready to proceed'}
            </div>
            <button
              onClick={handleNextQuestion}
              disabled={selectedAnswers.length === 0}
              className={`px-6 py-3 md:px-8 md:py-3 rounded-xl font-semibold text-white transition-all duration-200 transform ${
                selectedAnswers.length === 0
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-105 shadow-lg hover:shadow-xl'
              }`}
            >
              <span className="flex items-center justify-center">
                {quizState.currentQuestionIndex >= quizState.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 