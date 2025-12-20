import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Folder, Plus, Upload, Trash2, FileText, Image as ImageIcon, Video, File, CheckSquare, Square, Copy, Move } from 'lucide-react';
import CreateFolderModal from './CreateFolderModal';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

interface LegacyFolder {
  id: string;
  folder_name: string;
  description: string | null;
  gradient_color: string;
  created_at: string;
}

interface LegacyFile {
  id: string;
  folder_id: string | null;
  file_name: string;
  file_path: string;
  file_url: string;
  file_type: string;
  file_size: number | null;
  bucket_name: string;
  created_at: string;
}

const LegacyLockerUploads = () => {
  const { toast } = useToast();
  const [folders, setFolders] = useState<LegacyFolder[]>([]);
  const [files, setFiles] = useState<LegacyFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [copiedFiles, setCopiedFiles] = useState<string[]>([]);

  useEffect(() => {
    fetchFolders();
    fetchFiles();
  }, []);

  const fetchFolders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('legacy_locker_folders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load folders',
        variant: 'destructive',
      });
    }
  };

  const fetchFiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('legacy_locker_files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: 'Error',
        description: 'Failed to load files',
        variant: 'destructive',
      });
    }
  };

  const handleCreateFolder = async (name: string, description: string, color: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('legacy_locker_folders')
        .insert({
          user_id: user.id,
          folder_name: name,
          description,
          gradient_color: color,
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Folder created successfully',
      });

      setShowCreateFolderModal(false);
      fetchFolders();
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: 'Error',
        description: 'Failed to create folder',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Are you sure you want to delete this folder? All files in it will be deleted.')) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('legacy_locker_folders')
        .delete()
        .eq('id', folderId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Folder deleted successfully',
      });

      if (selectedFolder === folderId) {
        setSelectedFolder(null);
      }
      fetchFolders();
      fetchFiles();
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete folder',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getBucketName = (fileType: string): string => {
    if (fileType.startsWith('image/')) return 'photos';
    if (fileType.startsWith('video/')) return 'videos';
    return 'documents';
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0 || !selectedFolder) return;

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const uploadPromises = Array.from(fileList).map(async (file) => {
        const bucketName = getBucketName(file.type);
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);

        const { error: dbError } = await supabase
          .from('legacy_locker_files')
          .insert({
            user_id: user.id,
            folder_id: selectedFolder,
            file_name: file.name,
            file_path: fileName,
            file_url: publicUrl,
            file_type: file.type,
            file_size: file.size,
            bucket_name: bucketName,
          });

        if (dbError) throw dbError;
      });

      await Promise.all(uploadPromises);

      toast({
        title: 'Success',
        description: `${fileList.length} file(s) uploaded successfully`,
      });

      fetchFiles();
      event.target.value = '';
    } catch (error: any) {
      console.error('Error uploading files:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload files',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string, filePath: string, bucketName: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await supabase.storage.from(bucketName).remove([filePath]);

      const { error } = await supabase
        .from('legacy_locker_files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'File deleted successfully',
      });

      fetchFiles();
      setSelectedFiles(prev => prev.filter(id => id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete file',
        variant: 'destructive',
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedFiles.length} file(s)?`)) return;

    try {
      const filesToDelete = files.filter(f => selectedFiles.includes(f.id));
      
      for (const file of filesToDelete) {
        await supabase.storage.from(file.bucket_name).remove([file.file_path]);
        await supabase
          .from('legacy_locker_files')
          .delete()
          .eq('id', file.id);
      }

      toast({
        title: 'Success',
        description: `${selectedFiles.length} file(s) deleted successfully`,
      });

      setSelectedFiles([]);
      fetchFiles();
    } catch (error) {
      console.error('Error deleting files:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete files',
        variant: 'destructive',
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5" />;
    } else if (fileType.startsWith('video/')) {
      return <Video className="h-5 w-5" />;
    } else if (fileType.includes('pdf') || fileType.includes('document')) {
      return <FileText className="h-5 w-5" />;
    }
    return <File className="h-5 w-5" />;
  };

  const handleSelectAll = () => {
    const folderFiles = files.filter(f => f.folder_id === selectedFolder);
    setSelectedFiles(folderFiles.map(file => file.id));
  };

  const handleDeselectAll = () => {
    setSelectedFiles([]);
  };

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleCopyFiles = (fileIds: string[]) => {
    setCopiedFiles(fileIds);
    toast({
      title: "Files copied",
      description: `${fileIds.length} file(s) ready to paste`,
    });
  };

  const handlePasteFiles = async (targetFolderId: string) => {
    if (copiedFiles.length === 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('legacy_locker_files')
        .update({ folder_id: targetFolderId })
        .in('id', copiedFiles);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${copiedFiles.length} file(s) moved to folder`,
      });

      setCopiedFiles([]);
      setSelectedFiles([]);
      fetchFiles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredFiles = selectedFolder
    ? files.filter((file) => file.folder_id === selectedFolder)
    : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Folders ({folders.length})</span>
            <Button onClick={() => setShowCreateFolderModal(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Folder
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {folders.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No folders yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {folders.map((folder) => (
                <ContextMenu key={folder.id}>
                  <ContextMenuTrigger>
                    <div
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedFolder === folder.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedFolder(folder.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${folder.gradient_color}`}>
                            <Folder className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium">{folder.folder_name}</h4>
                            {folder.description && (
                              <p className="text-sm text-muted-foreground">{folder.description}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(folder.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem
                      onClick={() => handlePasteFiles(folder.id)}
                      disabled={copiedFiles.length === 0}
                    >
                      <Move className="h-4 w-4 mr-2" />
                      Paste {copiedFiles.length > 0 ? `${copiedFiles.length} file(s)` : ''}
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span>Files ({filteredFiles.length})</span>
              {selectedFiles.length > 0 && (
                <Badge variant="secondary">{selectedFiles.length} selected</Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {filteredFiles.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={selectedFiles.length === filteredFiles.length ? handleDeselectAll : handleSelectAll}
                >
                  {selectedFiles.length === filteredFiles.length ? (
                    <>
                      <Square className="h-4 w-4 mr-2" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Select All
                    </>
                  )}
                </Button>
              )}
              {selectedFiles.length > 0 && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyFiles(selectedFiles)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete ({selectedFiles.length})
                  </Button>
                </>
              )}
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={!selectedFolder || uploading}
              />
              <label htmlFor="file-upload">
                <Button
                  asChild
                  disabled={!selectedFolder || uploading}
                >
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Files'}
                  </span>
                </Button>
              </label>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedFolder ? (
            <p className="text-center text-muted-foreground py-8">
              Select a folder to view and upload files
            </p>
          ) : filteredFiles.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No files in this folder yet. Upload some files to get started.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredFiles.map((file) => (
                <ContextMenu key={file.id}>
                  <ContextMenuTrigger>
                    <div
                      className={`relative border rounded-lg overflow-hidden hover:border-primary transition-colors cursor-pointer ${
                        selectedFiles.includes(file.id) ? 'ring-2 ring-primary' : ''
                      }`}
                    >
                      <div className="absolute top-2 left-2 z-10">
                        <Checkbox
                          checked={selectedFiles.includes(file.id)}
                          onCheckedChange={() => handleFileSelect(file.id)}
                          className="bg-background"
                        />
                      </div>

                      <div className="aspect-square bg-muted flex items-center justify-center">
                        {file.file_type.startsWith('image/') ? (
                          <img
                            src={file.file_url}
                            alt={file.file_name}
                            className="w-full h-full object-cover"
                          />
                        ) : file.file_type.startsWith('video/') ? (
                          <video
                            src={file.file_url}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4">
                            {getFileIcon(file.file_type)}
                            <span className="text-xs mt-2 text-center break-all line-clamp-2">
                              {file.file_name.split('.').pop()?.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-2 bg-background">
                        <p className="text-sm font-medium truncate">{file.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.file_size ? `${(file.file_size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => window.open(file.file_url, '_blank')}>
                      View File
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => handleCopyFiles([file.id])}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => handleDeleteFile(file.id, file.file_path, file.bucket_name)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onCreateFolder={handleCreateFolder}
      />
    </div>
  );
};

export default LegacyLockerUploads;
