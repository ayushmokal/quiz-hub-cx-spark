import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Palette } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
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
import { categoriesAPI } from '../../services/api';
import { Category } from '../../types';

interface CategoryFormData {
  name: string;
  displayName: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
}

const availableColors = [
  '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

const availableIcons = [
  '📊', '💍', '💳', '📦', '👤', '🔧', '📱', '🎯', '⚙️', '🏆',
  '📈', '🔍', '💡', '🚀', '📋', '🎪', '🎨', '🎭', '🎲', '🎸'
];

export function CategoryManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    displayName: '',
    description: '',
    icon: '📊',
    color: '#3B82F6',
    isActive: true
  });

  // Check user permissions
  const canManageCategories = user?.role === 'admin' || user?.role === 'coach';

  useEffect(() => {
    if (!canManageCategories) return;
    loadCategories();
  }, [canManageCategories]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const allCategories = await categoriesAPI.getAllCategories();
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: "Error Loading Categories",
        description: "Failed to load categories. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      displayName: '',
      description: '',
      icon: '📊',
      color: '#3B82F6',
      isActive: true
    });
  };

  const generateName = (displayName: string) => {
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
      name: generateName(value)
    }));
  };

  const handleCreateCategory = async () => {
    try {
      const newCategory = await categoriesAPI.createCategory({
        name: formData.name,
        displayName: formData.displayName,
        description: formData.description,
        icon: formData.icon,
        color: formData.color,
        isActive: formData.isActive
      });

      setCategories(prev => [...prev, newCategory]);
      setIsCreateDialogOpen(false);
      resetForm();
      
      toast({
        title: "Category Created",
        description: `"${newCategory.displayName}" has been created successfully.`,
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Error Creating Category",
        description: error.message || "Failed to create category. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      displayName: category.displayName,
      description: category.description || '',
      icon: category.icon || '📊',
      color: category.color || '#3B82F6',
      isActive: category.isActive
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    try {
      const updatedCategory = await categoriesAPI.updateCategory(editingCategory.id, {
        name: formData.name,
        displayName: formData.displayName,
        description: formData.description,
        icon: formData.icon,
        color: formData.color,
        isActive: formData.isActive
      });

      setCategories(prev => prev.map(c => c.id === editingCategory.id ? updatedCategory : c));
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      resetForm();
      
      toast({
        title: "Category Updated",
        description: `"${updatedCategory.displayName}" has been updated successfully.`,
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Error Updating Category",
        description: error.message || "Failed to update category. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    try {
      await categoriesAPI.deleteCategory(category.id);
      setCategories(prev => prev.filter(c => c.id !== category.id));
      
      toast({
        title: "Category Deleted",
        description: `"${category.displayName}" has been deleted successfully.`,
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Error Deleting Category",
        description: error.message || "Failed to delete category. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!canManageCategories) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Access Denied</h3>
        <p className="text-muted-foreground">
          Only admins and coaches can manage categories.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Category Management</h1>
          <p className="text-muted-foreground">
            Manage quiz categories to organize topics effectively
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="quiz-button-primary">
              <Plus className="mr-2 h-4 w-4" />
              Create Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogDescription>
                Add a new category to organize quiz topics.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="displayName">Category Name</Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => handleDisplayNameChange(e.target.value)}
                  placeholder="e.g., Software Issues"
                />
              </div>
              <div>
                <Label htmlFor="name">System Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="auto-generated-from-name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this category covers..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Icon</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {availableIcons.map((icon) => (
                      <Button
                        key={icon}
                        type="button"
                        variant={formData.icon === icon ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, icon }))}
                        className="h-8 w-8 p-0"
                      >
                        {icon}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {availableColors.map((color) => (
                      <Button
                        key={color}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className="h-8 w-8 p-0"
                        style={{ 
                          backgroundColor: formData.color === color ? color : 'transparent',
                          borderColor: color
                        }}
                      >
                        {formData.color === color && <span className="text-white">✓</span>}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => { setIsCreateDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleCreateCategory} disabled={!formData.displayName || !formData.name}>
                <Save className="mr-2 h-4 w-4" />
                Create Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id} className="quiz-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{category.displayName}</CardTitle>
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditCategory(category)}
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
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{category.displayName}"? This may affect existing topics using this category.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteCategory(category)}>
                          Delete Category
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <CardDescription>
                {category.description}
              </CardDescription>
              <div className="text-xs text-muted-foreground">
                System name: {category.name}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <Card className="quiz-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4">🏷️</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Categories Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first category to organize quiz topics.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="quiz-button-primary">
              <Plus className="mr-2 h-4 w-4" />
              Create First Category
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the category information. Changes will be logged for audit purposes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-displayName">Category Name</Label>
              <Input
                id="edit-displayName"
                value={formData.displayName}
                onChange={(e) => handleDisplayNameChange(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-name">System Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                <Label>Icon</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {availableIcons.map((icon) => (
                    <Button
                      key={icon}
                      type="button"
                      variant={formData.icon === icon ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      className="h-8 w-8 p-0"
                    >
                      {icon}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Color</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {availableColors.map((color) => (
                    <Button
                      key={color}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className="h-8 w-8 p-0"
                      style={{ 
                        backgroundColor: formData.color === color ? color : 'transparent',
                        borderColor: color
                      }}
                    >
                      {formData.color === color && <span className="text-white">✓</span>}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="edit-isActive">Active</Label>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setEditingCategory(null); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory} disabled={!formData.displayName || !formData.name}>
              <Save className="mr-2 h-4 w-4" />
              Update Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 