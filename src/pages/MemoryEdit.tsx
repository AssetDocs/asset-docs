import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, Archive } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';

interface MemoryFolder {
  id: string;
  folder_name: string;
}

const NO_FOLDER_VALUE = '__no_folder__';

const MemoryEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [folders, setFolders] = useState<MemoryFolder[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    folderId: ''
  });

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id || !id) return;
      try {
        const { data: mem, error } = await supabase
          .from('memory_safe_items')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (error || !mem) {
          toast({ title: 'Memory not found', description: 'The requested memory could not be found.', variant: 'destructive' });
          navigate('/account?tab=memory-safe');
          return;
        }

        setFormData({
          title: mem.title || mem.file_name || '',
          description: mem.description || '',
          tags: Array.isArray(mem.tags) ? mem.tags.join(', ') : '',
          folderId: mem.folder_id || ''
        });

        const { data: foldersData } = await supabase
          .from('memory_safe_folders')
          .select('id, folder_name')
          .eq('user_id', user.id)
          .order('folder_name');

        setFolders(foldersData || []);
      } catch (error) {
        console.error('Error loading memory:', error);
        toast({ title: 'Error', description: 'Failed to load memory details.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user, id, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !id) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('memory_safe_items')
        .update({
          title: formData.title,
          description: formData.description || null,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : null,
          folder_id: formData.folderId || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      toast({ title: 'Memory updated!', description: 'Your memory has been updated successfully.' });
      navigate('/account?tab=memory-safe');
    } catch (error) {
      console.error('Error updating memory:', error);
      toast({ title: 'Failed to update', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-8 px-4 bg-muted/50">
        <div className="max-w-2xl mx-auto">
          <DashboardBreadcrumb />
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate('/account?tab=memory-safe')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center">
                <Archive className="h-6 w-6 mr-2 text-brand-blue" />
                Edit Memory
              </h1>
              <p className="text-sm text-muted-foreground">Update memory details</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader><CardTitle>Memory Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Enter title" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="folder">Folder (Optional)</Label>
                  <Select value={formData.folderId || NO_FOLDER_VALUE} onValueChange={(value) => setFormData({ ...formData, folderId: value === NO_FOLDER_VALUE ? '' : value })}>
                    <SelectTrigger><SelectValue placeholder="Select folder" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_FOLDER_VALUE}>No Folder</SelectItem>
                      {folders.map((folder) => (<SelectItem key={folder.id} value={folder.id}>{folder.folder_name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="What makes this memory special?" rows={3} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (Optional)</Label>
                  <Input id="tags" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="e.g., family, vacation, birthday" />
                  <p className="text-xs text-muted-foreground">Separate tags with commas</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4 mt-6">
              <Button type="button" variant="outline" onClick={() => navigate('/account?tab=memory-safe')}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>) : (<><Save className="h-4 w-4 mr-2" />Save Changes</>)}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MemoryEdit;
