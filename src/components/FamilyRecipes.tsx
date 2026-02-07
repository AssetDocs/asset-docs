import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ChefHat, Plus, Trash2, Edit, Upload, FileText, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { StorageService } from '@/services/StorageService';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface RecipeEntry {
  id: string;
  recipe_name: string;
  created_by_person: string | null;
  details: string | null;
  file_name: string | null;
  file_url: string | null;
  file_path: string | null;
  bucket_name: string | null;
  created_at: string;
}

const FamilyRecipes: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscriptionTier } = useSubscription();
  const [recipes, setRecipes] = useState<RecipeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<RecipeEntry | null>(null);
  const [recipeName, setRecipeName] = useState('');
  const [createdByPerson, setCreatedByPerson] = useState('');
  const [details, setDetails] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchRecipes();
  }, [user]);

  const fetchRecipes = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('family_recipes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRecipes((data || []) as RecipeEntry[]);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setRecipeName('');
    setCreatedByPerson('');
    setDetails('');
    setSelectedFile(null);
    setEditingRecipe(null);
  };

  const handleSave = async () => {
    if (!user || !recipeName.trim()) {
      toast({ title: 'Error', description: 'Recipe name is required.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      let fileData: { file_path?: string; file_url?: string; file_name?: string; file_size?: number; bucket_name?: string } = {};

      if (selectedFile) {
        const result = await StorageService.uploadFileWithValidation(
          selectedFile, 'documents', user.id, subscriptionTier,
          `family-recipes/${Date.now()}-${selectedFile.name}`
        );
        fileData = {
          file_path: result.path,
          file_url: result.url,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          bucket_name: 'documents',
        };
      }

      if (editingRecipe) {
        const { error } = await supabase
          .from('family_recipes')
          .update({
            recipe_name: recipeName.trim(),
            created_by_person: createdByPerson.trim() || null,
            details: details.trim() || null,
            ...fileData,
          })
          .eq('id', editingRecipe.id);
        if (error) throw error;
        toast({ title: 'Updated', description: 'Recipe updated successfully.' });
      } else {
        const { error } = await supabase
          .from('family_recipes')
          .insert({
            user_id: user.id,
            recipe_name: recipeName.trim(),
            created_by_person: createdByPerson.trim() || null,
            details: details.trim() || null,
            ...fileData,
          });
        if (error) throw error;
        toast({ title: 'Saved', description: 'Recipe added successfully.' });
      }

      resetForm();
      setIsOpen(false);
      fetchRecipes();
    } catch (error: any) {
      console.error('Error saving recipe:', error);
      toast({ title: 'Error', description: error.message || 'Failed to save recipe.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('family_recipes').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Recipe removed.' });
      fetchRecipes();
    } catch (error) {
      console.error('Error deleting recipe:', error);
      toast({ title: 'Error', description: 'Failed to delete recipe.', variant: 'destructive' });
    }
  };

  const openEdit = (recipe: RecipeEntry) => {
    setEditingRecipe(recipe);
    setRecipeName(recipe.recipe_name);
    setCreatedByPerson(recipe.created_by_person || '');
    setDetails(recipe.details || '');
    setSelectedFile(null);
    setIsOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Family Recipes</h2>
          <p className="text-muted-foreground text-sm mt-1">Preserve cherished family recipes for generations.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Recipe</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingRecipe ? 'Edit Recipe' : 'Add Family Recipe'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="recipe-name">Recipe Name *</Label>
                <Input id="recipe-name" value={recipeName} onChange={(e) => setRecipeName(e.target.value)} placeholder="e.g. Grandma's Apple Pie" />
              </div>
              <div>
                <Label htmlFor="recipe-creator">Who's Recipe / Created By</Label>
                <Input id="recipe-creator" value={createdByPerson} onChange={(e) => setCreatedByPerson(e.target.value)} placeholder="e.g. Grandma Rose" />
              </div>
              <div>
                <Label htmlFor="recipe-details">Recipe Details</Label>
                <Textarea id="recipe-details" value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Ingredients, instructions, family notes..." rows={6} />
              </div>
              <div>
                <Label>Or Upload a File</Label>
                <div className="mt-1">
                  {selectedFile ? (
                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm truncate flex-1">{selectedFile.name}</span>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}><X className="h-4 w-4" /></Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-1" />Choose File
                    </Button>
                  )}
                  <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx,.txt" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                </div>
              </div>
              <Button onClick={handleSave} disabled={isSaving} className="w-full">
                {isSaving ? 'Saving...' : editingRecipe ? 'Update Recipe' : 'Save Recipe'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : recipes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ChefHat className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No family recipes yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Add your first recipe to preserve it for generations.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recipes.map((recipe) => (
            <Card key={recipe.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{recipe.recipe_name}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(recipe)} className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
                          <AlertDialogDescription>Are you sure you want to delete "{recipe.recipe_name}"? This cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(recipe.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  {recipe.created_by_person && <p className="text-sm text-muted-foreground"><span className="font-medium">By:</span> {recipe.created_by_person}</p>}
                  {recipe.details && <p className="text-sm mt-2 line-clamp-4">{recipe.details}</p>}
                  {recipe.file_name && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      <span className="truncate">{recipe.file_name}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-3">{new Date(recipe.created_at).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FamilyRecipes;
