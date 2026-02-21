import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { StickyNote, Plus, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface QuickNote {
  id: string;
  content: string;
  created_at: string;
}

const QuickNotesSection: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notes, setNotes] = useState<QuickNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) fetchNotes();
  }, [user]);

  const fetchNotes = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_notes')
        .select('id, content, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !newNote.trim()) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_notes')
        .insert({ user_id: user.id, content: newNote.trim() });
      if (error) throw error;
      toast({ title: 'Saved', description: 'Note added.' });
      setNewNote('');
      setIsAdding(false);
      fetchNotes();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save note.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('user_notes').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Note removed.' });
      fetchNotes();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete note.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-primary" />
            Quick Notes
          </CardTitle>
          <p className="text-sm text-muted-foreground">Jot down quick reminders or thoughts.</p>
        </CardHeader>
        <CardContent>
          {isAdding ? (
            <div className="space-y-3">
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write your note here..."
                rows={4}
                autoFocus
              />
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={isSaving || !newNote.trim()} size="sm">
                  {isSaving ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Saving...</> : 'Save Note'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setIsAdding(false); setNewNote(''); }}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setIsAdding(true)} className="w-full" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : notes.length === 0 ? (
        !isAdding && (
          <Card>
            <CardContent className="py-12 text-center">
              <StickyNote className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">No notes yet.</p>
              <p className="text-sm text-muted-foreground mt-1">Add your first note above.</p>
            </CardContent>
          </Card>
        )
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(note.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Note</AlertDialogTitle>
                        <AlertDialogDescription>Are you sure? This cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(note.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuickNotesSection;
