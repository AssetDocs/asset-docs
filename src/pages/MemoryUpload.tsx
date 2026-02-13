import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Upload, FileText, Trash2, Loader2, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';

interface MemoryFolder {
  id: string;
  folder_name: string;
  gradient_color: string;
}

const NO_FOLDER_VALUE = '__none__';

const MemoryUpload: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const [folders, setFolders] = useState<MemoryFolder[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const { uploadSingleFile, isUploading } = useFileUpload({
    bucket: 'memory-safe',
    onError: (error) => {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    }
  });

  useEffect(() => {
    if (user) fetchFolders();
  }, [user]);

  const fetchFolders = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('memory_safe_folders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setTitle('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const saveMemory = async () => {
    if (!user || !selectedFile) {
      toast({ title: 'Missing information', description: 'Please select a file to upload.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const uploadResult = await uploadSingleFile(selectedFile);
      if (!uploadResult) throw new Error('Failed to upload file');

      const { error: dbError } = await supabase
        .from('memory_safe_items')
        .insert({
          user_id: user.id,
          file_name: selectedFile.name,
          file_path: uploadResult.path,
          file_url: uploadResult.url,
          file_size: selectedFile.size,
          file_type: selectedFile.type || 'application/octet-stream',
          title: title || selectedFile.name.replace(/\.[^/.]+$/, ''),
          description: description || null,
          tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : null,
          folder_id: selectedFolderId || null
        });

      if (dbError) throw new Error('Failed to save memory metadata');

      toast({ title: 'Memory saved', description: 'Your memory has been uploaded successfully.' });
      navigate('/account?tab=memory-safe');
    } catch (error) {
      console.error('Save error:', error);
      toast({ title: 'Save failed', description: error instanceof Error ? error.message : 'Failed to save memory.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = isUploading || isSaving;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow py-8 px-4 bg-muted/50">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => navigate('/account?tab=memory-safe')} className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Memory Safe
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-orange mb-2">Add Memory</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Memory Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Folder Selection */}
              <div>
                <Label className="text-sm font-medium">Folder</Label>
                <Select
                  value={selectedFolderId || NO_FOLDER_VALUE}
                  onValueChange={(v) => setSelectedFolderId(v === NO_FOLDER_VALUE ? '' : v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a folder" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value={NO_FOLDER_VALUE}>None</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded ${folder.gradient_color}`}></div>
                          {folder.folder_name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="memory-title" className="text-sm font-medium">Title</Label>
                <Input
                  id="memory-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter memory title"
                  className="mt-1"
                />
              </div>

              {/* File Upload */}
              <div>
                <Label className="text-sm font-medium">Upload File</Label>
                <Input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp,.mp4,.mov" onChange={handleFileSelect} className="hidden" />
                <Input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileSelect} className="hidden" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <Button onClick={() => cameraInputRef.current?.click()} variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-brand-blue/30 hover:border-brand-blue/50 hover:bg-brand-blue/5" disabled={isLoading}>
                    <Camera className="h-6 w-6 text-brand-blue" />
                    <div className="text-center"><div className="font-medium text-sm">Take Photo</div><div className="text-xs text-muted-foreground">Use camera</div></div>
                  </Button>
                  <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-brand-blue/30 hover:border-brand-blue/50 hover:bg-brand-blue/5" disabled={isLoading}>
                    <Upload className="h-6 w-6 text-brand-blue" />
                    <div className="text-center"><div className="font-medium text-sm">Choose File</div><div className="text-xs text-muted-foreground">From device</div></div>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Supported: Photos, Videos, PDFs, Documents</p>

                {selectedFile && (
                  <div className="mt-3 border rounded-lg p-3 bg-muted/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium truncate max-w-[300px]">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" onClick={removeFile} disabled={isLoading} className="h-8 w-8">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What makes this memory special?" rows={3} className="mt-1" />
              </div>

              {/* Tags */}
              <div>
                <Label htmlFor="tags" className="text-sm font-medium">Tags (comma separated)</Label>
                <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. family, vacation, birthday" className="mt-1" />
              </div>

              {/* Save */}
              <Button onClick={saveMemory} className="w-full bg-brand-blue hover:bg-brand-lightBlue" disabled={!selectedFile || isLoading}>
                {isLoading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>) : 'Save Memory'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MemoryUpload;
