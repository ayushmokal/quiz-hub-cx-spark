import { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, EyeOff, Edit, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useToast } from '../../hooks/use-toast';
import { useGlobalState } from '../../contexts/GlobalStateContext';
import { categoriesAPI, topicsAPI } from '../../services/api';
import type { Category } from '../../types';

export function CategoryManagement() {
  const { toast } = useToast();
  const { 
    invalidateCategories, 
    categoriesNeedRefresh, 
    markCategoriesFresh 
  } = useGlobalState();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newCategory, setNewCategory] = useState({
    displayName: '',
    description: '',
    slug: '',
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, []);

  // Listen for global state changes
  useEffect(() => {
    if (categoriesNeedRefresh) {
      console.log('🔄 CategoryManagement: Global state triggered refresh');
      loadData();
    }
  }, [categoriesNeedRefresh]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      console.log('📊 CategoryManagement: Loading categories with topic/question counts...');
      
      // Load categories and topics in parallel
      const [categoriesData, allTopics] = await Promise.all([
        categoriesAPI.getCategories(),
        topicsAPI.getAllTopics()
      ]);
      
      console.log('📊 CategoryManagement: Loaded categories:', categoriesData);
      console.log('📊 CategoryManagement: All topics for counting:', allTopics);
      
      // Calculate topic and question counts for each category
      const categoriesWithCounts = await Promise.all(
        categoriesData.map(async (category) => {
          // Find topics that belong to this category
          const categoryTopics = allTopics.filter(topic => {
            const topicCategory = topic.category;
            const categoryIdentifiers = [
              category.name,
              category.displayName,
              category.slug,
              category.id
            ].filter(Boolean);
            
            console.log('🔍 CategoryManagement: Checking topic', topic.displayName, 
                       'category:', topicCategory, 'against identifiers:', categoryIdentifiers);
            
            return categoryIdentifiers.includes(topicCategory);
          });
          
          console.log(`📊 CategoryManagement: Category "${category.displayName}" has ${categoryTopics.length} topics`);
          
          // Calculate question count across all topics in this category
          let totalQuestions = 0;
          for (const topic of categoryTopics) {
            totalQuestions += topic.questionCount || 0;
          }
          
          return {
            ...category,
            topicCount: categoryTopics.length,
            questionCount: totalQuestions
          };
        })
      );
      
      console.log('📊 CategoryManagement: Final categories with counts:', categoriesWithCounts);
      setCategories(categoriesWithCounts);
      markCategoriesFresh(); // Mark as fresh after successful load
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createCategory = async () => {
    try {
      if (!newCategory.displayName.trim()) {
        toast({
          title: "Error",
          description: "Category name is required",
          variant: "destructive"
        });
        return;
      }

      const categoryData = {
        name: newCategory.displayName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        displayName: newCategory.displayName.trim(),
        description: newCategory.description.trim(),
        slug: newCategory.slug.trim() || newCategory.displayName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        isActive: newCategory.isActive
      };

      const createdCategory = await categoriesAPI.createCategory(categoryData);
      setCategories(prev => [...prev, createdCategory]);
      
      // Trigger global state invalidation
      invalidateCategories();
      
      setNewCategory({
        displayName: '',
        description: '',
        slug: '',
        isActive: true
      });
      setIsCreateDialogOpen(false);

      toast({
        title: "Success",
        description: `Category "${createdCategory.displayName}" created successfully`,
      });

    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive"
      });
    }
  };



  const toggleCategoryStatus = async (category: Category) => {
    try {
      const updatedCategory = await categoriesAPI.updateCategory(category.id, {
        isActive: !category.isActive
      });
      
      setCategories(prev => 
        prev.map(cat => cat.id === category.id ? updatedCategory : cat)
      );

      toast({
        title: "Updated",
        description: `Category ${updatedCategory.isActive ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setIsDeleting(true);
      
      console.log('🗑️ CategoryManagement: Starting category deletion:', categoryToDelete.displayName);
      
      // Delete the category (this should cascade to delete topics and questions)
      await categoriesAPI.deleteCategory(categoryToDelete.id);
      
      // Remove from local state
      setCategories(prev => prev.filter(cat => cat.id !== categoryToDelete.id));
      
      // Trigger global state invalidation - this will refresh all dependent components
      console.log('🔄 CategoryManagement: Triggering global state invalidation');
      invalidateCategories();
      
      // Close dialog and reset state
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);

      toast({
        title: "Category Deleted",
        description: `"${categoryToDelete.displayName}" and all its content have been permanently deleted.`,
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryStats = (categoryId: string) => {
    // This would be implemented to get actual stats
    return {
      topicCount: 0,
      questionCount: 0
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-[#FF0000] mx-auto mb-4" />
          <p className="text-[#46494D]">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Categories</h1>
          <p className="text-[#46494D]">
            Manage quiz categories and their Google Sheets integration
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-[#FF0000] to-[#FF4500] hover:from-[#FF4500] hover:to-[#FD9400]">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogDescription>
                Add a new quiz category. A Google Sheet will be created automatically for content management.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Category Name</Label>
                <Input
                  id="categoryName"
                  placeholder="e.g., Customer Service"
                  value={newCategory.displayName}
                  onChange={(e) => setNewCategory(prev => ({ 
                    ...prev, 
                    displayName: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-')
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryDescription">Description</Label>
                <Textarea
                  id="categoryDescription"
                  placeholder="Brief description of this category"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categorySlug">Slug (Auto-generated)</Label>
                <Input
                  id="categorySlug"
                  placeholder="category-slug"
                  value={newCategory.slug}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, slug: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createCategory}>
                Create Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Delete Category Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Category
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>"{categoryToDelete?.displayName}"</strong>?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 px-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-800 text-sm font-medium">⚠️ This action cannot be undone!</p>
              <p className="text-red-700 text-sm mt-1">
                This will permanently delete:
              </p>
              <ul className="text-red-700 text-sm mt-2 list-disc list-inside space-y-1">
                <li>The category and all its settings</li>
                <li>All topics within this category</li>
                <li>All questions within those topics</li>
                <li>All quiz attempts and user progress for this content</li>
              </ul>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDeleteCategory}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Permanently
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Categories Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map(category => {
          const stats = getCategoryStats(category.id);
          
          return (
            <Card key={category.id} className="relative border-[#46494D]/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-black">{category.displayName}</CardTitle>
                    <CardDescription className="mt-1 text-[#46494D]">
                      {category.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive ? "Active" : "Draft"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCategoryStatus(category)}
                    >
                      {category.isActive ? (
                        <Eye className="h-4 w-4 text-[#08a104]" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-[#46494D]" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-black">Topics</div>
                    <div className="text-[#46494D]">{stats.topicCount}</div>
                  </div>
                  <div>
                    <div className="font-medium text-black">Questions</div>
                    <div className="text-[#46494D]">{stats.questionCount}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-[#46494D]/20 hover:bg-[#F5F5F5]"
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-[#46494D]/20 hover:bg-[#F5F5F5]"
                    onClick={() => toggleCategoryStatus(category)}
                  >
                    {category.isActive ? (
                      <EyeOff className="mr-1 h-3 w-3" />
                    ) : (
                      <Eye className="mr-1 h-3 w-3" />
                    )}
                    {category.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteCategory(category)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Categories State */}
      {categories.length === 0 && (
        <Card className="border-[#46494D]/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="h-12 w-12 bg-[#46494D]/10 rounded-full flex items-center justify-center mb-4">
              <Plus className="h-6 w-6 text-[#46494D]" />
            </div>
            <h3 className="text-lg font-medium text-black mb-2">No Categories Found</h3>
            <p className="text-[#46494D] text-center mb-4">
              Create your first category to start organizing quiz content.
            </p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-[#FF0000] to-[#FF4500] hover:from-[#FF4500] hover:to-[#FD9400]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create First Category
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
