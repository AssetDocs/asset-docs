import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { StickyNote, Plus, Trash2, Loader2, Upload, FileText, X, Paperclip } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { StorageService } from '@/services/StorageService';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface QuickNote {
  id: string;
  title: string | null;
  content: string;
  file_name: string | null;
  file_path: string | null;
  bucket_name: string | null;
  created_at: string;
}

const QuickNotesSection: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscriptionTier } = useSubscription();
  const [notes, setNotes] = useState<QuickNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [newNote, setNewNote] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) fetchNotes();
  }, [user]);

  const fetchNotes = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_notes')
        .select('id, title, content, file_name, file_path, bucket_name, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setNotes((data || []) as QuickNote[]);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setNewNote('');
    setSelectedFile(null);
    setIsAdding(false);
  };

  const handleSave = async () => {
    if (!user || !newNote.trim()) return;
    setIsSaving(true);
    try {
      let fileData: { file_path?: string; file_name?: string; bucket_name?: string } = {};

      if (selectedFile) {
        const result = await StorageService.uploadFileWithValidation(
          selectedFile, 'documents', user.id, subscriptionTier,
          `quick-notes/${Date.now()}-${selectedFile.name}`
        );
        fileData = {
          file_path: result.path,
          file_name: selectedFile.name,
          bucket_name: 'documents',
        };
      }

      const { error } = await supabase
        .from('user_notes')
        .insert({
          user_id: user.id,
          title: title.trim() || null,
          content: newNote.trim(),
          ...fileData,
        });
      if (error) throw error;
      toast({ title: 'Saved', description: 'Note added.' });
      resetForm();
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
              <div>
                <Label htmlFor="note-title">Title</Label>
                <Input
                  id="note-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Reminder, To-Do, Idea..."
                  autoFocus
                />
              </div>
              <div>
                <Label htmlFor="note-content">Note *</Label>
                <Textarea
                  id="note-content"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Write your note here..."
                  rows={4}
                />
              </div>
              <div>
                <Label>Attachment</Label>
                <div className="mt-1">
                  {selectedFile ? (
                    <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm truncate flex-1">{selectedFile.name}</span>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-1" /> Choose File
                    </Button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.csv"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={isSaving || !newNote.trim()} size="sm">
                  {isSaving ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Saving...</> : 'Save Note'}
                </Button>
                <Button variant="outline" size="sm" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setIsAdding(true)} className="w-full">
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
                    {note.title && (
                      <h4 className="font-semibold text-sm mb-1">{note.title}</h4>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    {note.file_name && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Paperclip className="h-3 w-3" />
                        <span className="truncate">{note.file_name}</span>
                      </div>
                    )}
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
