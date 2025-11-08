import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Video, Upload, Trash2, Loader2 } from 'lucide-react';
import { usePropertyFiles } from '@/hooks/usePropertyFiles';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

interface PropertyVideosProps {
  propertyId: string | null;
}

const PropertyVideos: React.FC<PropertyVideosProps> = ({ propertyId }) => {
  const { files: videos, isLoading, isUploading, uploadFiles, deleteFile } = usePropertyFiles(propertyId, 'video');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<{id: string, path: string, bucket: string} | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadFiles(Array.from(files));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteClick = (fileId: string, filePath: string, bucketName: string) => {
    setVideoToDelete({ id: fileId, path: filePath, bucket: bucketName });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (videoToDelete) {
      await deleteFile(videoToDelete.id, videoToDelete.path, videoToDelete.bucket);
    }
    setDeleteDialogOpen(false);
    setVideoToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setVideoToDelete(null);
  };

  if (!propertyId) {
    return (
      <div className="mt-6 text-center text-gray-500 p-8 border border-dashed rounded-lg">
        <Video className="h-12 w-12 mx-auto text-gray-300 mb-2" />
        <p>Select a property to view and upload videos</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Upload className="h-4 w-4 mr-2" />
          )}
          Upload Videos
        </Button>
      </div>
      
      <Input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {isLoading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center text-gray-500 p-8 border border-dashed rounded-lg">
          <Video className="h-12 w-12 mx-auto text-gray-300 mb-2" />
          <p className="mb-4">No videos uploaded yet</p>
          <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            <Upload className="h-4 w-4 mr-2" />
            Upload First Video
          </Button>
        </div>
      ) : null}
      
      {videos.map((video) => (
        <Card key={video.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                  <Video className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <h4 className="font-medium truncate">{video.file_name}</h4>
                  <p className="text-sm text-gray-500">
                    Uploaded {formatDate(video.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(video.file_url, '_blank')}
                >
                  Watch
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleDeleteClick(video.id, video.file_path, video.bucket_name)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Video"
        description="Are you sure you want to delete this video? This action cannot be undone."
      />
    </div>
  );
};

export default PropertyVideos;
