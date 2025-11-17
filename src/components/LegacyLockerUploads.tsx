import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Folder, Plus, Upload, Trash2, FileText, Image as ImageIcon, Video, File } from 'lucide-react';
import CreateFolderModal from './CreateFolderModal';
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        // Determine bucket based on file type
        let bucketName = 'documents';
        if (file.type.startsWith('image/')) {
          bucketName = 'photos';
        } else if (file.type.startsWith('video/')) {
          bucketName = 'videos';
        }

        // Upload file
        const filePath = `${user.id}/legacy-locker/${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        // Save file metadata to database
        const { error: dbError } = await supabase
          .from('legacy_locker_files')
          .insert({
            user_id: user.id,
            folder_id: selectedFolder,
            file_name: file.name,
            file_path: filePath,
            file_url: publicUrl,
            file_type: file.type,
            file_size: file.size,
            bucket_name: bucketName,
          });

        if (dbError) throw dbError;
      }

      toast({
        title: 'Success',
        description: `${selectedFiles.length} file(s) uploaded successfully`,
      });

      fetchFiles();
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload files',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string, filePath: string, bucketName: string) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      setLoading(true);
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('legacy_locker_files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      toast({
        title: 'Success',
        description: 'File deleted successfully',
      });

      fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete file',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (fileType.startsWith('video/')) {
      return <Video className="h-4 w-4" />;
    } else {
      return <FileText className="h-4 w-4" />;
    }
  };

  const filteredFiles = selectedFolder
    ? files.filter(file => file.folder_id === selectedFolder)
    : files.filter(file => !file.folder_id);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Folders Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Folders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => setShowCreateFolderModal(true)}
              className="w-full"
              variant="outline"
              disabled={loading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Folder
            </Button>

            <Button
              onClick={() => setSelectedFolder(null)}
              variant={selectedFolder === null ? 'default' : 'ghost'}
              className="w-full justify-start"
            >
              <File className="h-4 w-4 mr-2" />
              All Files
              <Badge variant="secondary" className="ml-auto">
                {files.filter(f => !f.folder_id).length}
              </Badge>
            </Button>

            {folders.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No folders yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {folders.map((folder) => {
                  const folderFileCount = files.filter(f => f.folder_id === folder.id).length;
                  const isSelected = selectedFolder === folder.id;

                  return (
                    <div key={folder.id} className="relative">
                      <Button
                        variant={isSelected ? 'default' : 'ghost'}
                        className="w-full justify-start p-3 h-auto pr-12"
                        onClick={() => setSelectedFolder(folder.id)}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${folder.gradient_color}`}>
                          <Folder className="h-4 w-4 text-white fill-white" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="font-medium text-sm">{folder.folder_name}</div>
                          {folder.description && (
                            <div className="text-xs text-muted-foreground truncate">
                              {folder.description}
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          {folderFileCount}
                        </Badge>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder.id);
                        }}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Files Section */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {selectedFolder
                  ? folders.find(f => f.id === selectedFolder)?.folder_name
                  : 'All Files'}
              </CardTitle>
              <div className="flex gap-2">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                />
                <Button
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={uploading || loading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredFiles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No files yet</p>
                <p className="text-sm">Upload photos, videos, or documents to get started</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {getFileIcon(file.file_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {file.file_size ? `${(file.file_size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(file.file_url, '_blank')}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFile(file.id, file.file_path, file.bucket_name)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onCreateFolder={handleCreateFolder}
      />
    </div>
  );
};

export default LegacyLockerUploads;
