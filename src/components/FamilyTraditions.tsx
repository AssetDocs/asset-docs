// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Sparkles, Plus, Trash2, Edit, Upload, FileText, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { StorageService, buildFamilyArchivePath } from '@/services/StorageService';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface TraditionEntry {
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

interface FamilyTraditionsProps {
  /** UI hint only: opens the existing add dialog. Never performs work. */
  autoOpenAdd?: boolean;
}

const FamilyTraditions: React.FC<FamilyTraditionsProps> = ({ autoOpenAdd = false }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscriptionTier, storageQuotaGb } = useSubscription();
  const [traditions, setTraditions] = useState<TraditionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (autoOpenAdd) setIsOpen(true);
  }, [autoOpenAdd]);

  const [editing, setEditing] = useState<TraditionEntry | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [holiday, setHoliday] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTraditions();
  }, [user?.id]);

  const fetchTraditions = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notes_traditions')
        .select('*')
        .eq('user_id', user.id)
        .eq('record_type', 'tradition')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTraditions((data || []) as TraditionEntry[]);
    } catch (error) {
      console.error('Error fetching traditions:', error);
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
    setEditing(null);
  };

  const handleSave = async () => {
    if (!user || !title.trim()) {
      toast({ title: 'Error', description: 'Title is required.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    let uploadedPath: string | null = null;
    try {
      let fileData: { file_path?: string; file_url?: string; file_name?: string; file_size?: number; bucket_name?: string } = {};

      if (selectedFile) {
        const quota = await StorageService.canUploadFile(user.id, selectedFile.size, subscriptionTier, storageQuotaGb);
        if (!quota.canUpload) {
          toast({ title: 'Upload blocked', description: quota.reason, variant: 'destructive' });
          setIsSaving(false);
          return;
        }
        const fullPath = buildFamilyArchivePath({
          userId: user.id,
          section: 'family-traditions',
          file: selectedFile,
        });
        const result = await StorageService.uploadFileToPath(selectedFile, 'documents', fullPath, user.id);
        uploadedPath = result.path;
        fileData = {
          file_path: result.path,
          file_url: result.url,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          bucket_name: 'documents',
        };
      }

      if (editing) {
        const { error } = await supabase
          .from('notes_traditions')
          .update({
            title: title.trim(),
            subject: subject.trim() || null,
            holiday: holiday.trim() || null,
            content: content.trim() || null,
            ...fileData,
          })
          .eq('id', editing.id);
        if (error) throw error;
        toast({ title: 'Updated', description: 'Tradition updated successfully.' });
      } else {
        const { error } = await supabase
          .from('notes_traditions')
          .insert({
            user_id: user.id,
            record_type: 'tradition',
            title: title.trim(),
            subject: subject.trim() || null,
            holiday: holiday.trim() || null,
            content: content.trim() || null,
            folder_id: null,
            ...fileData,
          });
        if (error) throw error;
        toast({ title: 'Saved', description: 'Tradition added successfully.' });
      }

      uploadedPath = null;
      resetForm();
      setIsOpen(false);
      fetchTraditions();
    } catch (error: any) {
      console.error('Error saving tradition:', error);
      if (uploadedPath) {
        await StorageService.tryCleanupObject('documents', uploadedPath);
      }
      toast({ title: 'Error', description: error.message || 'Failed to save tradition.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const entry = traditions.find(t => t.id === id);
      if (entry?.file_path) {
        const { data, error } = await supabase.functions.invoke('secure-delete-file', {
          body: { resource: 'notes_tradition_attachment', id },
        });
        if (error || (data as any)?.error) {
          toast({
            title: 'Attachment cleanup failed',
            description:
              'The tradition was not deleted. Retry the cleanup from /account/cleanup, then delete it again to finish.',
            variant: 'destructive',
          });
          return;
        }
      }
      const { error } = await supabase.from('notes_traditions').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Deleted', description: 'Tradition removed.' });
      fetchTraditions();
    } catch (error) {
      console.error('Error deleting tradition:', error);
      toast({ title: 'Error', description: 'Failed to delete tradition.', variant: 'destructive' });
    }
  };

  const openEdit = (entry: TraditionEntry) => {
    setEditing(entry);
    setTitle(entry.title);
    setSubject(entry.subject || '');
    setHoliday(entry.holiday || '');
    setContent(entry.content || '');
    setSelectedFile(null);
    setIsOpen(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-blue" />
            Family Traditions
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Preserve family traditions, stories, customs, and meaningful routines.
          </p>
        </CardHeader>
        <CardContent>
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="w-full bg-brand-blue hover:bg-brand-blue/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Tradition
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit Tradition' : 'Add Tradition'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tradition-title">Title *</Label>
                  <Input id="tradition-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Grandma's Holiday Tradition" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="tradition-subject">Subject</Label>
                    <Input id="tradition-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Family Story" />
                  </div>
                  <div>
                    <Label htmlFor="tradition-holiday">Holiday / Occasion</Label>
                    <Input id="tradition-holiday" value={holiday} onChange={(e) => setHoliday(e.target.value)} placeholder="e.g. Christmas" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tradition-content">Description</Label>
                  <Textarea id="tradition-content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Describe the tradition, story, or custom..." rows={5} />
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
                  {isSaving ? 'Saving...' : editing ? 'Update Tradition' : 'Save Tradition'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : traditions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground">No family traditions yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Add your first tradition to preserve family stories and customs.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {traditions.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{entry.title}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(entry)} className="h-8 w-8 p-0">
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
                          <AlertDialogTitle>Delete Tradition</AlertDialogTitle>
                          <AlertDialogDescription>Are you sure you want to delete "{entry.title}"? This cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(entry.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  {entry.subject && <p className="text-sm text-muted-foreground"><span className="font-medium">Subject:</span> {entry.subject}</p>}
                  {entry.holiday && <p className="text-sm text-muted-foreground"><span className="font-medium">Holiday:</span> {entry.holiday}</p>}
                  {entry.content && <p className="text-sm mt-2 line-clamp-3">{entry.content}</p>}
                  {entry.file_name && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      <span className="truncate">{entry.file_name}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-3">{new Date(entry.created_at).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FamilyTraditions;
