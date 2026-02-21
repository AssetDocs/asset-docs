import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Upload, FileText, Pencil, Trash2, FolderPlus, Folder, X } from 'lucide-react';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';

interface TaxReturn {
  id: string;
  title: string;
  tax_year: string | null;
  notes: string | null;
  file_name: string | null;
  file_path: string | null;
  file_size: number | null;
  file_type: string | null;
  tags: string | null;
  folder_id: string | null;
  created_at: string;
}

interface TaxFolder {
  id: string;
  folder_name: string;
  description: string | null;
  gradient_color: string;
}

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 20 }, (_, i) => String(currentYear - i));

const TaxReturnOrganizer: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [returns, setReturns] = useState<TaxReturn[]>([]);
  const [folders, setFolders] = useState<TaxFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<TaxReturn | null>(null);
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TaxReturn | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [taxYear, setTaxYear] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [folderName, setFolderName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const [foldersRes, returnsRes] = await Promise.all([
      supabase.from('tax_return_folders').select('*').eq('user_id', user.id).order('display_order'),
      supabase.from('tax_returns').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    ]);
    if (foldersRes.data) setFolders(foldersRes.data);
    if (returnsRes.data) setReturns(returnsRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const openAdd = () => {
    setEditingItem(null);
    setTitle(''); setTaxYear(''); setNotes(''); setTags(''); setFile(null);
    setShowForm(true);
  };

  const openEdit = (item: TaxReturn) => {
    setEditingItem(item);
    setTitle(item.title);
    setTaxYear(item.tax_year || '');
    setNotes(item.notes || '');
    setTags(item.tags || '');
    setFile(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!user || !title.trim()) return;
    setSaving(true);
    let filePath: string | null = editingItem?.file_path || null;
    let fileName: string | null = editingItem?.file_name || null;
    let fileSize: number | null = editingItem?.file_size || null;
    let fileType: string | null = editingItem?.file_type || null;

    if (file) {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/tax-returns/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('documents').upload(path, file);
      if (uploadErr) {
        toast({ title: 'Upload failed', description: uploadErr.message, variant: 'destructive' });
        setSaving(false);
        return;
      }
      filePath = path;
      fileName = file.name;
      fileSize = file.size;
      fileType = file.type;
    }

    const payload = {
      user_id: user.id,
      title: title.trim(),
      tax_year: taxYear || null,
      notes: notes.trim() || null,
      tags: tags.trim() || null,
      folder_id: selectedFolder || null,
      file_name: fileName,
      file_path: filePath,
      file_size: fileSize,
      file_type: fileType,
    };

    if (editingItem) {
      const { error } = await supabase.from('tax_returns').update(payload).eq('id', editingItem.id);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
      else { toast({ title: 'Updated' }); }
    } else {
      const { error } = await supabase.from('tax_returns').insert(payload);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
      else { toast({ title: 'Document saved' }); }
    }

    setSaving(false);
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.file_path) {
      await supabase.storage.from('documents').remove([deleteTarget.file_path]);
    }
    await supabase.from('tax_returns').delete().eq('id', deleteTarget.id);
    toast({ title: 'Deleted' });
    setDeleteTarget(null);
    fetchData();
  };

  const handleAddFolder = async () => {
    if (!user || !folderName.trim()) return;
    await supabase.from('tax_return_folders').insert({ user_id: user.id, folder_name: folderName.trim() });
    setFolderName('');
    setShowFolderForm(false);
    fetchData();
  };

  const filtered = selectedFolder
    ? returns.filter(r => r.folder_id === selectedFolder)
    : returns;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Tax Return Organizer</h2>
        <p className="text-muted-foreground text-sm mt-1">Store and organize previous tax returns and associated documents.</p>
      </div>

      {/* Upload button */}
      <Button onClick={openAdd} className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white">
        <Plus className="h-4 w-4 mr-2" /> Upload Document
      </Button>

      {/* Folders */}
      <div className="flex flex-wrap gap-2 items-center">
        <Button variant={!selectedFolder ? 'default' : 'outline'} size="sm" onClick={() => setSelectedFolder(null)}>All</Button>
        {folders.map(f => (
          <Button key={f.id} variant={selectedFolder === f.id ? 'default' : 'outline'} size="sm" onClick={() => setSelectedFolder(f.id)}>
            <Folder className="h-3 w-3 mr-1" /> {f.folder_name}
          </Button>
        ))}
        <Button variant="ghost" size="sm" onClick={() => setShowFolderForm(true)}>
          <FolderPlus className="h-4 w-4 mr-1" /> New Folder
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">No tax documents yet. Click "Upload Document" to add one.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map(item => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4 flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 flex-shrink-0">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{item.title}</p>
                  {item.tax_year && <p className="text-xs text-muted-foreground">Tax Year: {item.tax_year}</p>}
                  {item.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.notes}</p>}
                  {item.file_name && <p className="text-xs text-muted-foreground mt-1">📎 {item.file_name}</p>}
                  {item.tags && <p className="text-xs text-muted-foreground mt-1">Tags: {item.tags}</p>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(item)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editingItem ? 'Edit Document' : 'Upload Tax Document'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title *</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. 2024 Federal Return" /></div>
            <div>
              <Label>Tax Year</Label>
              <Select value={taxYear} onValueChange={setTaxYear}>
                <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent>{yearOptions.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional notes..." /></div>
            <div><Label>Tags</Label><Input value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. federal, state, w2" /></div>
            <div>
              <Label>Attachment</Label>
              <Input type="file" onChange={e => setFile(e.target.files?.[0] || null)} accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.webp,.txt" />
              {editingItem?.file_name && !file && <p className="text-xs text-muted-foreground mt-1">Current: {editingItem.file_name}</p>}
            </div>
            <Button onClick={handleSave} disabled={saving || !title.trim()} className="w-full">
              {saving ? 'Saving...' : editingItem ? 'Update' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Folder Dialog */}
      <Dialog open={showFolderForm} onOpenChange={setShowFolderForm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Create Folder</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Folder Name</Label><Input value={folderName} onChange={e => setFolderName(e.target.value)} placeholder="e.g. 2024 Tax Season" /></div>
            <Button onClick={handleAddFolder} disabled={!folderName.trim()} className="w-full">Create Folder</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Tax Document"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
      />
    </div>
  );
};

export default TaxReturnOrganizer;
