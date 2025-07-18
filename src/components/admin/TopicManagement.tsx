import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Save, X, History } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { topicsAPI, categoriesAPI } from '../../services/api';
import { Topic, Category } from '../../types';

interface TopicFormData {
  displayName: string;
  slug: string;
  description: string;
  category: string;
  status: 'active' | 'inactive' | 'draft';
}

export function TopicManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [topics, setTopics] = useState<Topic[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<TopicFormData>({
    displayName: '',
    slug: '',
    description: '',
    category: 'sensor',
    status: 'active'
  });

  // Check user permissions
  const canManageTopics = user?.role === 'admin' || user?.role === 'coach';

  useEffect(() => {
    if (!canManageTopics) return;
    loadTopics();
    loadCategories();
  }, [canManageTopics]);

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
      toast({
        title: "Error Loading Categories",
        description: "Failed to load categories. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      displayName: '',
      slug: '',
      description: '',
      category: 'sensor',
      status: 'active'
    });
  };

  const generateSlug = (displayName: string) => {
    return displayName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleDisplayNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      displayName: value,
      slug: generateSlug(value)
    }));
  };

  const handleCreateTopic = async () => {
    try {
      const newTopic = await topicsAPI.createTopic({
        displayName: formData.displayName,
        slug: formData.slug,
        description: formData.description,
        category: formData.category as any,
        status: formData.status
      });

      setTopics(prev => [...prev, newTopic]);
      setIsCreateDialogOpen(false);
      resetForm();
      
      toast({
        title: "Topic Created",
        description: `"${newTopic.displayName}" has been created successfully.`,
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Error Creating Topic",
        description: error.message || "Failed to create topic. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditTopic = (topic: Topic) => {
    setEditingTopic(topic);
    setFormData({
      displayName: topic.displayName,
      slug: topic.slug,
      description: topic.description || '',
      category: topic.category,
      status: topic.status
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateTopic = async () => {
    if (!editingTopic) return;

    try {
      const updatedTopic = await topicsAPI.updateTopic(editingTopic.id, {
        displayName: formData.displayName,
        slug: formData.slug,
        description: formData.description,
        category: formData.category as any,
        status: formData.status
      });

      setTopics(prev => prev.map(t => t.id === editingTopic.id ? updatedTopic : t));
      setIsEditDialogOpen(false);
      setEditingTopic(null);
      resetForm();
      
      toast({
        title: "Topic Updated",
        description: `"${updatedTopic.displayName}" has been updated successfully.`,
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Error Updating Topic",
        description: error.message || "Failed to update topic. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTopic = async (topic: Topic) => {
    try {
      await topicsAPI.deleteTopic(topic.id);
      setTopics(prev => prev.filter(t => t.id !== topic.id));
      
      toast({
        title: "Topic Deleted",
        description: `"${topic.displayName}" has been deleted successfully.`,
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Error Deleting Topic",
        description: error.message || "Failed to delete topic. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getCategoryClass = (category: string) => {
    return `category-${category} px-3 py-1 rounded-full text-xs font-medium border`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-[hsl(var(--success))]';
      case 'inactive': return 'text-muted-foreground';
      case 'draft': return 'text-[hsl(var(--warning))]';
      default: return 'text-muted-foreground';
    }
  };

  if (!canManageTopics) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Access Denied</h3>
        <p className="text-muted-foreground">
          Only admins and coaches can manage topics.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Topic Management</h1>
          <p className="text-muted-foreground">
            Create and manage quiz topics for the CX training platform
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="quiz-button-primary">
              <Plus className="mr-2 h-4 w-4" />
              Create Topic
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Topic</DialogTitle>
              <DialogDescription>
                Add a new quiz topic to the platform. All fields are required.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="displayName">Topic Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => handleDisplayNameChange(e.target.value)}
                  placeholder="e.g., Advanced Ring Troubleshooting"
                />
              </div>
              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="auto-generated-from-name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this topic covers..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.icon && `${category.icon} `}{category.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => { setIsCreateDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleCreateTopic} disabled={!formData.displayName || !formData.description}>
                <Save className="mr-2 h-4 w-4" />
                Create Topic
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Topics List */}
      <div className="grid gap-6">
        {topics.map((topic) => (
          <Card key={topic.id} className="quiz-card">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle>{topic.displayName}</CardTitle>
                    <Badge className={getCategoryClass(topic.category)}>
                      {topic.category}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(topic.status)}>
                      {topic.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">
                    {topic.description}
                  </CardDescription>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span>Slug: {topic.slug}</span>
                    <span>Questions: {topic.questionCount}</span>
                    <span>Avg Accuracy: {topic.averageAccuracy}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTopic(topic)}
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
                        <AlertDialogTitle>Delete Topic</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{topic.displayName}"? This will also delete all associated questions and quiz attempts. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteTopic(topic)}>
                          Delete Topic
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

      {topics.length === 0 && (
        <Card className="quiz-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Topics Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by creating your first quiz topic.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="quiz-button-primary">
              <Plus className="mr-2 h-4 w-4" />
              Create First Topic
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Topic</DialogTitle>
            <DialogDescription>
              Update the topic information. Changes will be logged for audit purposes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-displayName">Topic Name</Label>
              <Input
                id="edit-displayName"
                value={formData.displayName}
                onChange={(e) => handleDisplayNameChange(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-slug">URL Slug</Label>
              <Input
                id="edit-slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.icon && `${category.icon} `}{category.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setEditingTopic(null); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTopic} disabled={!formData.displayName || !formData.description}>
              <Save className="mr-2 h-4 w-4" />
              Update Topic
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 