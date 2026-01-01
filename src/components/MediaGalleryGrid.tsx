import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Camera,
  Video,
  FileText,
  Play,
  Eye,
  Download,
  Calendar,
  HardDrive,
  Trash2,
  Clock,
  Pencil,
  FileImage,
  FileSpreadsheet,
  File,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type ViewMode = 'grid' | 'list';
type MediaType = 'photo' | 'video' | 'document';

interface MediaFile {
  id: string;
  name: string;
  url: string;
  filePath?: string;
  bucket?: string;
  uploadDate: string;
  size: string;
  propertyName?: string;
  duration?: string;
  type?: string;
}

interface MediaGalleryGridProps {
  files: MediaFile[];
  viewMode: ViewMode;
  selectedFiles: string[];
  onFileSelect: (fileId: string) => void;
  onDeleteFile: (fileId: string) => void;
  onEditFile?: (fileId: string) => void;
  mediaType: MediaType;
}

const MediaGalleryGrid: React.FC<MediaGalleryGridProps> = ({
  files,
  viewMode,
  selectedFiles,
  onFileSelect,
  onDeleteFile,
  onEditFile,
  mediaType
}) => {
  const { toast } = useToast();
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getIcon = () => {
    switch (mediaType) {
      case 'photo': return Camera;
      case 'video': return Video;
      case 'document': return FileText;
    }
  };

  const getDocumentIcon = (fileType?: string) => {
    const type = fileType?.toLowerCase();
    if (type === 'pdf') return FileText;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type || '')) return FileImage;
    if (['xls', 'xlsx', 'csv'].includes(type || '')) return FileSpreadsheet;
    return File;
  };

  const isImageFile = (fileType?: string) => {
    const type = fileType?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type || '');
  };

  const getSignedUrl = async (file: MediaFile): Promise<string | null> => {
    if (!file.filePath || !file.bucket) {
      return file.url;
    }
    
    try {
      const { data, error } = await supabase.storage
        .from(file.bucket)
        .createSignedUrl(file.filePath, 3600);
      
      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      return null;
    }
  };

  const handlePreview = async (file: MediaFile) => {
    setLoadingFileId(file.id);
    try {
      const url = await getSignedUrl(file);
      if (url) {
        window.open(url, '_blank');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to generate preview URL',
          variant: 'destructive',
        });
      }
    } finally {
      setLoadingFileId(null);
    }
  };

  const handleDownload = async (file: MediaFile) => {
    setLoadingFileId(file.id);
    try {
      const url = await getSignedUrl(file);
      if (!url) {
        toast({
          title: 'Error',
          description: 'Failed to generate download URL',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to download file',
        variant: 'destructive',
      });
    } finally {
      setLoadingFileId(null);
    }
  };

  const Icon = getIcon();
  const emptyMessage = mediaType === 'photo' ? 'No photos found' : 
                       mediaType === 'video' ? 'No videos found' : 
                       'No documents found';

  if (files.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Icon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-600 mb-2">{emptyMessage}</h3>
        <p className="text-gray-500">Upload some files to get started</p>
      </Card>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {files.map((file) => {
          const DocIcon = mediaType === 'document' ? getDocumentIcon(file.type) : Icon;
          return (
            <Card key={file.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedFiles.includes(file.id)}
                    onCheckedChange={() => onFileSelect(file.id)}
                  />
                  
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {mediaType === 'document' && isImageFile(file.type) && file.url ? (
                      <img 
                        src={file.url} 
                        alt={file.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : mediaType === 'video' ? (
                      <Play className="h-6 w-6 text-gray-400" />
                    ) : (
                      <DocIcon className="h-6 w-6 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-lg truncate">{file.name}</h4>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(file.uploadDate)}
                      </span>
                      {mediaType === 'video' && file.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {file.duration}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <HardDrive className="h-3 w-3" />
                        {file.size}
                      </span>
                      {file.type && (
                        <Badge variant="outline" className="text-xs">
                          {file.type}
                        </Badge>
                      )}
                      {file.propertyName && (
                        <Badge variant="outline" className="text-xs">
                          {file.propertyName}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handlePreview(file)}
                      disabled={loadingFileId === file.id}
                    >
                      {loadingFileId === file.id ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Eye className="h-4 w-4 mr-1" />
                      )}
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDownload(file)}
                      disabled={loadingFileId === file.id}
                    >
                      {loadingFileId === file.id ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-1" />
                      )}
                      Download
                    </Button>
                    {onEditFile && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onEditFile(file.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => onDeleteFile(file.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map((file) => {
        const DocIcon = mediaType === 'document' ? getDocumentIcon(file.type) : Icon;
        const showImageThumbnail = (mediaType === 'photo' || (mediaType === 'document' && isImageFile(file.type))) && file.url;
        
        return (
          <Card key={file.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
            <div className={`relative ${mediaType === 'video' ? 'aspect-video' : 'aspect-square'} bg-gray-200 flex items-center justify-center overflow-hidden`}>
              {mediaType === 'video' ? (
                <>
                  <Play className="h-12 w-12 text-gray-400" />
                  {file.duration && (
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                      {file.duration}
                    </div>
                  )}
                </>
              ) : showImageThumbnail ? (
                <img 
                  src={file.url} 
                  alt={file.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <DocIcon className="h-12 w-12 text-gray-400" />
                  {file.type && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {file.type}
                    </Badge>
                  )}
                </div>
              )}
              
              <div className="absolute top-2 left-2 z-10">
                <Checkbox
                  checked={selectedFiles.includes(file.id)}
                  onCheckedChange={() => onFileSelect(file.id)}
                  className="bg-white/80 border-white"
                />
              </div>

              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-[1]">
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => handlePreview(file)}
                  title="Preview"
                  disabled={loadingFileId === file.id}
                >
                  {loadingFileId === file.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => handleDownload(file)}
                  title="Download"
                  disabled={loadingFileId === file.id}
                >
                  {loadingFileId === file.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
                {onEditFile && (
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => onEditFile(file.id)}
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFile(file.id);
                  }}
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <CardContent className="p-3">
              <h4 className="font-medium text-sm truncate mb-1">{file.name}</h4>
              
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>{formatDate(file.uploadDate)}</span>
                <span>{file.size}</span>
              </div>
              
              {file.propertyName && (
                <Badge variant="outline" className="text-xs truncate max-w-full">
                  {file.propertyName}
                </Badge>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MediaGalleryGrid;
