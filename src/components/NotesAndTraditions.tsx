import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { BookOpen, Plus, Trash2, Edit, Upload, FileText, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { StorageService } from '@/services/StorageService';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface NoteEntry {
  id: string;
  title: string;
  subject: string | null;
  holiday: string | null;
  content: string | null;
  file_name: string | null;
  file_url: string | null;
  file_path: string | null;
  bucket_name: string | null;
  created_at: string;
}

const NotesAndTraditions: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscriptionTier } = useSubscription();
  const [notes, setNotes] = useState<NoteEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteEntry | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [holiday, setHoliday] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchNotes();
  }, [user]);

  const fetchNotes = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notes_traditions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setNotes((data || []) as NoteEntry[]);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setSubject('');
    setHoliday('');
    setContent('');
    setSelectedFile(null);
    setEditingNote(null);
  };

  const handleSave = async () => {
    if (!user || !title.trim()) {
      toast({ title: 'Error', description: 'Title is required.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      let fileData: { file_path?: string; file_url?: string; file_name?: string; file_size?: number; bucket_name?: string } = {};

      if (selectedFile) {
        const result = await StorageService.uploadFileWithValidation(
          selectedFile, 'documents', user.id, subscriptionTier,
          `notes-traditions/${Date.now()}-${selectedFile.name}`
        );
        fileData = {
          file_path: result.path,
          file_url: result.url,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          bucket_name: 'documents',
        };
      }

      if (editingNote) {
        const { error } = await supabase
          .from('notes_traditions')
          .update({
            title: title.trim(),
            subject: subject.trim() || null,
            holiday: holiday.trim() || null,
            content: content.trim() || null,
            ...fileData,
          })
          .eq('id', editingNote.id);
        if (error) throw error;
        toast({ title: 'Updated', description: 'Note updated successfully.' });
      } else {
        const { error } = await supabase
          .from('notes_traditions')
          .insert({
            user_id: user.id,
            title: title.trim(),
            subject: subject.trim() || null,
            holiday: holiday.trim() || null,
            content: content.trim() || null,
            ...fileData,
          });
        if (error) throw error;
        toast({ title: 'Saved', description: 'Note added successfully.' });
      }

      resetForm();
      setIsOpen(false);
      fetchNotes();
    } catch (error: any) {
      console.error('Error saving note:', error);
      toast({ title: 'Error', description: error.message || 'Failed to save note.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('notes_traditions').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Note removed.' });
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({ title: 'Error', description: 'Failed to delete note.', variant: 'destructive' });
    }
  };

  const openEdit = (note: NoteEntry) => {
    setEditingNote(note);
    setTitle(note.title);
    setSubject(note.subject || '');
    setHoliday(note.holiday || '');
    setContent(note.content || '');
    setSelectedFile(null);
    setIsOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Notes & Traditions</h2>
          <p className="text-muted-foreground text-sm mt-1">Capture family traditions, stories, and important notes.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Note</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingNote ? 'Edit Note' : 'Add Note or Tradition'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="note-title">Title *</Label>
                <Input id="note-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Grandma's Holiday Tradition" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="note-subject">Subject</Label>
                  <Input id="note-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Family Story" />
                </div>
                <div>
                  <Label htmlFor="note-holiday">Holiday / Occasion</Label>
                  <Input id="note-holiday" value={holiday} onChange={(e) => setHoliday(e.target.value)} placeholder="e.g. Christmas" />
                </div>
              </div>
              <div>
                <Label htmlFor="note-content">Details</Label>
                <Textarea id="note-content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your note, tradition, or story here..." rows={5} />
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
                {isSaving ? 'Saving...' : editingNote ? 'Update Note' : 'Save Note'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : notes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No notes or traditions yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Add your first note to preserve family stories and traditions.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{note.title}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(note)} className="h-8 w-8 p-0">
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
                          <AlertDialogTitle>Delete Note</AlertDialogTitle>
                          <AlertDialogDescription>Are you sure you want to delete "{note.title}"? This cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(note.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  {note.subject && <p className="text-sm text-muted-foreground"><span className="font-medium">Subject:</span> {note.subject}</p>}
                  {note.holiday && <p className="text-sm text-muted-foreground"><span className="font-medium">Holiday:</span> {note.holiday}</p>}
                  {note.content && <p className="text-sm mt-2 line-clamp-3">{note.content}</p>}
                  {note.file_name && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      <span className="truncate">{note.file_name}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-3">{new Date(note.created_at).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotesAndTraditions;
