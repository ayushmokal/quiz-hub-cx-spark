import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ArrowLeft, Save, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { topicsAPI, questionsAPI, categoriesAPI } from '../../services/api';
import { Topic, Question, Category } from '../../types';

interface QuestionFormData {
  type: 'multiple-choice' | 'multi-select' | 'case-study';
  content: string;
  options: string[];
  correctAnswers: number[];
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeLimit: number;
}

interface QuestionManagementProps {
  selectedTopicId?: string;
  onTopicChange?: (topicId: string | null) => void;
}

export function QuestionManagement({ selectedTopicId, onTopicChange }: QuestionManagementProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [topics, setTopics] = useState<Topic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<QuestionFormData>({
    type: 'multiple-choice',
    content: '',
    options: ['', '', '', ''],
    correctAnswers: [],
    explanation: '',
    difficulty: 'beginner',
    timeLimit: 30
  });

  // Check user permissions
  const canManageQuestions = user?.role === 'admin' || user?.role === 'coach';

  useEffect(() => {
    if (!canManageQuestions) return;
    loadTopics();
    loadCategories();
  }, [canManageQuestions]);

  useEffect(() => {
    if (selectedTopicId) {
      const topic = topics.find(t => t.id === selectedTopicId);
      if (topic) {
        setCurrentTopic(topic);
        loadQuestions(selectedTopicId);
      }
    }
  }, [selectedTopicId, topics]);

  const loadTopics = async () => {
    try {
      setIsLoading(true);
      const allTopics = await topicsAPI.getAllTopics();
      setTopics(allTopics);
    } catch (error) {
      console.error('Error loading topics:', error);
      toast({
        title: "Error Loading Topics",
        description: "Failed to load topics. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const allCategories = await categoriesAPI.getAllCategories();
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadQuestions = async (topicId: string) => {
    try {
      const topicQuestions = await questionsAPI.getQuestionsByTopic(topicId);
      setQuestions(topicQuestions);
    } catch (error) {
      console.error('Error loading questions:', error);
      toast({
        title: "Error Loading Questions",
        description: "Failed to load questions. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'multiple-choice',
      content: '',
      options: ['', '', '', ''],
      correctAnswers: [],
      explanation: '',
      difficulty: 'beginner',
      timeLimit: 30
    });
  };

  const handleTopicSelect = (topic: Topic) => {
    setCurrentTopic(topic);
    loadQuestions(topic.id);
    if (onTopicChange) {
      onTopicChange(topic.id);
    }
  };

  const handleAddOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const handleRemoveOption = (index: number) => {
    if (formData.options.length <= 2) return; // Minimum 2 options
    
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
      correctAnswers: prev.correctAnswers.filter(i => i !== index).map(i => i > index ? i - 1 : i)
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option)
    }));
  };

  const handleCorrectAnswerToggle = (index: number) => {
    setFormData(prev => {
      if (prev.type === 'multiple-choice') {
        return {
          ...prev,
          correctAnswers: [index]
        };
      } else {
        const isSelected = prev.correctAnswers.includes(index);
        return {
          ...prev,
          correctAnswers: isSelected 
            ? prev.correctAnswers.filter(i => i !== index)
            : [...prev.correctAnswers, index]
        };
      }
    });
  };

  const handleCreateQuestion = async () => {
    if (!currentTopic) return;

    try {
      const newQuestion = await questionsAPI.createQuestion({
        topicId: currentTopic.id,
        type: formData.type,
        content: formData.content,
        options: formData.options.filter(opt => opt.trim() !== ''),
        correctAnswers: formData.correctAnswers,
        explanation: formData.explanation,
        difficulty: formData.difficulty,
        timeLimit: formData.timeLimit
      });

      setQuestions(prev => [...prev, newQuestion]);
      setIsCreateDialogOpen(false);
      resetForm();
      
      toast({
        title: "Question Created",
        description: "Question has been created successfully.",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Error Creating Question",
        description: error.message || "Failed to create question. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      type: question.type,
      content: question.content,
      options: [...question.options],
      correctAnswers: [...question.correctAnswers],
      explanation: question.explanation,
      difficulty: question.difficulty,
      timeLimit: question.timeLimit
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;

    try {
      const updatedQuestion = await questionsAPI.updateQuestion(editingQuestion.id, {
        type: formData.type,
        content: formData.content,
        options: formData.options.filter(opt => opt.trim() !== ''),
        correctAnswers: formData.correctAnswers,
        explanation: formData.explanation,
        difficulty: formData.difficulty,
        timeLimit: formData.timeLimit
      });

      setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? updatedQuestion : q));
      setIsEditDialogOpen(false);
      setEditingQuestion(null);
      resetForm();
      
      toast({
        title: "Question Updated",
        description: "Question has been updated successfully.",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Error Updating Question",
        description: error.message || "Failed to update question. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteQuestion = async (question: Question) => {
    try {
      await questionsAPI.deleteQuestion(question.id);
      setQuestions(prev => prev.filter(q => q.id !== question.id));
      
      toast({
        title: "Question Deleted",
        description: "Question has been deleted successfully.",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Error Deleting Question",
        description: error.message || "Failed to delete question. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-[hsl(var(--success))]';
      case 'intermediate': return 'text-[hsl(var(--warning))]';
      case 'advanced': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  if (!canManageQuestions) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Access Denied</h3>
        <p className="text-muted-foreground">
          Only admins and coaches can manage questions.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      </div>
    );
  }

  // Topic Selection View
  if (!currentTopic) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Question Management</h1>
          <p className="text-muted-foreground">
            Select a topic to manage its questions
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <Card
              key={topic.id}
              className="quiz-card cursor-pointer hover:scale-105 transition-all"
              onClick={() => handleTopicSelect(topic)}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={`category-${topic.category} px-3 py-1 rounded-full text-xs font-medium border`}>
                    {categories.find(c => c.name === topic.category)?.icon && 
                      `${categories.find(c => c.name === topic.category)?.icon} `
                    }
                    {categories.find(c => c.name === topic.category)?.displayName || topic.category}
                  </Badge>
                  <Badge variant="outline">
                    {topic.status}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{topic.displayName}</CardTitle>
                <CardDescription>{topic.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{topic.questionCount} questions</span>
                  <span>{topic.averageAccuracy}% avg accuracy</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {topics.length === 0 && (
          <Card className="quiz-card">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Topics Available</h3>
              <p className="text-muted-foreground text-center">
                Create some topics first before adding questions.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Question Management View
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setCurrentTopic(null);
              if (onTopicChange) onTopicChange(null);
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Topics
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{currentTopic.displayName}</h1>
            <p className="text-muted-foreground">
              Manage questions for this topic
            </p>
          </div>
        </div>
        <Button
          className="quiz-button-primary"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((question, index) => (
          <Card key={question.id} className="quiz-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Q{index + 1}
                    </span>
                    <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                      {question.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      {question.type}
                    </Badge>
                    <Badge variant="outline">
                      {question.timeLimit}s
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mb-2">{question.content}</CardTitle>
                  <div className="space-y-1">
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2 text-sm">
                        <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs ${
                          question.correctAnswers.includes(optIndex) 
                            ? 'bg-[hsl(var(--success))] text-white border-[hsl(var(--success))]'
                            : 'border-border'
                        }`}>
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        <span>{option}</span>
                      </div>
                    ))}
                  </div>
                  {question.explanation && (
                    <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditQuestion(question)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Question</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this question? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteQuestion(question)}>
                          Delete Question
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {questions.length === 0 && (
        <Card className="quiz-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">❓</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Questions Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start building this topic by adding your first question.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="quiz-button-primary">
              <Plus className="mr-2 h-4 w-4" />
              Add First Question
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Question Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          setEditingQuestion(null);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? 'Edit Question' : 'Create New Question'}
            </DialogTitle>
            <DialogDescription>
              {editingQuestion ? 'Update the question details.' : 'Add a new question to this topic.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Question Type & Settings */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Question Type</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value, correctAnswers: [] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                    <SelectItem value="multi-select">Multi-Select</SelectItem>
                    <SelectItem value="case-study">Case Study</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Difficulty</Label>
                <Select value={formData.difficulty} onValueChange={(value: any) => setFormData(prev => ({ ...prev, difficulty: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Time Limit (seconds)</Label>
                <Input
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 30 }))}
                  min="10"
                  max="300"
                />
              </div>
            </div>

            {/* Question Content */}
            <div>
              <Label>Question</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter your question here..."
                rows={3}
              />
            </div>

            {/* Answer Options */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label>Answer Options</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  disabled={formData.options.length >= 6}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Option
                </Button>
              </div>
              <div className="space-y-3">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {formData.type === 'multiple-choice' ? (
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={formData.correctAnswers.includes(index)}
                          onChange={() => handleCorrectAnswerToggle(index)}
                          className="w-4 h-4"
                        />
                      ) : (
                        <Checkbox
                          checked={formData.correctAnswers.includes(index)}
                          onCheckedChange={() => handleCorrectAnswerToggle(index)}
                        />
                      )}
                      <span className="text-sm font-medium w-6">
                        {String.fromCharCode(65 + index)}
                      </span>
                    </div>
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      className="flex-1"
                    />
                    {formData.options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {formData.type === 'multiple-choice' 
                  ? 'Select the correct answer by clicking the radio button.'
                  : 'Check all correct answers using the checkboxes.'
                }
              </p>
            </div>

            {/* Explanation */}
            <div>
              <Label>Explanation (Optional)</Label>
              <Textarea
                value={formData.explanation}
                onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
                placeholder="Explain why this is the correct answer..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
              setEditingQuestion(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={editingQuestion ? handleUpdateQuestion : handleCreateQuestion}
              disabled={!formData.content || formData.correctAnswers.length === 0 || formData.options.filter(opt => opt.trim()).length < 2}
            >
              <Save className="mr-2 h-4 w-4" />
              {editingQuestion ? 'Update Question' : 'Create Question'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 