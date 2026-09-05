import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FileText, Download, Eye, Upload, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminDoc {
  name: string;
  file: string;
}

const BUCKET = 'admin-docs';

const AdminDocuments: React.FC = () => {
  const [viewDoc, setViewDoc] = useState<(AdminDoc & { url?: string }) | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<AdminDoc | null>(null);
  const [uploaded, setUploaded] = useState<AdminDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const loadUploaded = async () => {
    setLoading(true);
    const { data, error } = await supabase.storage.from(BUCKET).list('', { limit: 200, sortBy: { column: 'created_at', order: 'desc' } });
    if (error) {
      console.error(error);
      setUploaded([]);
    } else {
      setUploaded(
        (data || [])
          .filter((f) => f.name && !f.name.startsWith('.'))
          .map((f) => ({ name: f.name.replace(/^\d+-/, ''), file: f.name }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUploaded();
  }, []);

  const getSignedUrl = async (path: string) => {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 10);
    if (error || !data) throw error || new Error('Failed to sign URL');
    return data.signedUrl;
  };

  const handleView = async (doc: AdminDoc) => {
    try {
      const url = await getSignedUrl(doc.file);
      setViewDoc({ ...doc, url });
    } catch (e: any) {
      toast({ title: 'Unable to open', description: e.message, variant: 'destructive' });
    }
  };

  const handleDownload = async (doc: AdminDoc) => {
    try {
      const url = await getSignedUrl(doc.file);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      a.click();
    } catch (e: any) {
      toast({ title: 'Unable to download', description: e.message, variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteDoc || deletingPath) return;
    const targetDoc = deleteDoc;
    setDeletingPath(targetDoc.file);
    const { error } = await supabase.storage.from(BUCKET).remove([targetDoc.file]);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } else {
      setUploaded((docs) => docs.filter((doc) => doc.file !== targetDoc.file));
      toast({ title: 'Deleted', description: `${targetDoc.name} was removed from the Admin Workspace.` });
      setDeleteDoc(null);
      await loadUploaded();
    }
    setDeletingPath(null);
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    let ok = 0, fail = 0;
    for (const file of Array.from(files)) {
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${Date.now()}-${safe}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
      if (error) { fail++; console.error(error); } else { ok++; }
    }
    setUploading(false);
    if (ok) toast({ title: 'Upload complete', description: `${ok} file(s) uploaded.` });
    if (fail) toast({ title: 'Upload errors', description: `${fail} file(s) failed.`, variant: 'destructive' });
    if (fileInputRef.current) fileInputRef.current.value = '';
    loadUploaded();
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Company Documents</h2>
            <p className="text-muted-foreground">Formation, compliance, and legal filings</p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept="application/pdf,image/*"
              onChange={(e) => handleUpload(e.target.files)}
            />
            <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              {uploading ? 'Uploading…' : 'Upload Document'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {uploaded.map((doc) => (
            <Card key={doc.file} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                <div className="w-full aspect-[3/4] bg-muted rounded-md flex items-center justify-center overflow-hidden">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <FileText className="h-12 w-12" />
                    <span className="text-xs font-medium text-center px-2 leading-tight">PDF</span>
                  </div>
                </div>

                <p className="text-sm font-medium line-clamp-2 leading-tight">{doc.name}</p>

                <div className="flex gap-2 w-full">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleView(doc)}>
                    <Eye className="h-3.5 w-3.5 mr-1" /> View
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleDownload(doc)}>
                    <Download className="h-3.5 w-3.5 mr-1" /> Get
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteDoc(doc)}
                    title="Delete"
                    disabled={deletingPath === doc.file}
                  >
                    {deletingPath === doc.file ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-destructive" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {loading && <p className="text-sm text-muted-foreground">Loading uploaded documents…</p>}
        </div>
      </div>

      <Dialog open={!!viewDoc} onOpenChange={() => setViewDoc(null)}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <DialogTitle className="text-lg">{viewDoc?.name}</DialogTitle>
            <Button size="sm" variant="ghost" onClick={() => viewDoc && handleDownload(viewDoc)}>
              <Download className="h-4 w-4 mr-1" /> Download
            </Button>
          </DialogHeader>
          <div className="flex-1 min-h-0 px-4 pb-4">
            {viewDoc?.url && (
              <iframe src={viewDoc.url} className="w-full h-full rounded-md border" title={viewDoc.name} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteDoc} onOpenChange={(open) => !open && !deletingPath && setDeleteDoc(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteDoc?.name}" will be permanently removed from the Admin Workspace. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingPath}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={!!deletingPath}
              onClick={(event) => {
                event.preventDefault();
                handleDelete();
              }}
            >
              {deletingPath ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete Document
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminDocuments;
