import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Camera,
  Video,
  FileText,
  Eye,
  Download,
  Calendar,
  HardDrive,
  Trash2,
  Clock,
  Pencil,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import MediaThumbnail from '@/components/MediaThumbnail';

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
  emptyMessage?: string;
}

const MediaGalleryGrid: React.FC<MediaGalleryGridProps> = ({
  files,
  viewMode,
  selectedFiles,
  onFileSelect,
  onDeleteFile,
  onEditFile,
  mediaType,
  emptyMessage: emptyMessageOverride
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
  const emptyMessage = emptyMessageOverride || (mediaType === 'photo' ? 'No photos found' : 
                       mediaType === 'video' ? 'No videos found' : 
                       'No documents found');

  if (files.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Icon className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-muted-foreground mb-2">{emptyMessage}</h3>
        <p className="text-muted-foreground/70">Upload some files to get started</p>
      </Card>
    );
  }

  // ─── List View ─────────────────────────────────────────────────────
  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        {files.map((file) => (
          <Card key={file.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              {/* Top row: checkbox + thumbnail + info + desktop buttons */}
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedFiles.includes(file.id)}
                  onCheckedChange={() => onFileSelect(file.id)}
                  className="shrink-0"
                />

                {/* Thumbnail */}
                <MediaThumbnail
                  filePath={file.filePath}
                  bucket={file.bucket}
                  fallbackUrl={file.url}
                  fileName={file.name}
                  fileType={file.type}
                  mediaType={mediaType}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg shrink-0"
                  iconSize="md"
                />

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm sm:text-base truncate">{file.name}</h4>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
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

                {/* Desktop action buttons */}
                <div className="hidden sm:flex gap-2 shrink-0">
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

              {/* Mobile action buttons – second row */}
              <div className="flex sm:hidden gap-2 mt-3 justify-end">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handlePreview(file)}
                  disabled={loadingFileId === file.id}
                  className="h-8 px-2"
                >
                  {loadingFileId === file.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDownload(file)}
                  disabled={loadingFileId === file.id}
                  className="h-8 px-2"
                >
                  {loadingFileId === file.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                </Button>
                {onEditFile && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => onEditFile(file.id)}
                    className="h-8 px-2"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => onDeleteFile(file.id)}
                  className="h-8 px-2"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // ─── Grid View ─────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map((file) => (
        <Card key={file.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
          <div className={`relative ${mediaType === 'video' ? 'aspect-video' : 'aspect-square'} overflow-hidden`}>
            {/* Thumbnail */}
            <MediaThumbnail
              filePath={file.filePath}
              bucket={file.bucket}
              fallbackUrl={file.url}
              fileName={file.name}
              fileType={file.type}
              mediaType={mediaType}
              className="w-full h-full"
              iconSize="lg"
            />

            {/* Video duration badge */}
            {mediaType === 'video' && file.duration && (
              <div className="absolute bottom-2 right-2 bg-black/75 text-white px-2 py-1 rounded text-xs z-[2]">
                {file.duration}
              </div>
            )}

            {/* File type badge for documents */}
            {mediaType === 'document' && file.type && (
              <div className="absolute bottom-2 right-2 z-[2]">
                <Badge variant="secondary" className="text-xs">
                  {file.type}
                </Badge>
              </div>
            )}

            {/* Checkbox */}
            <div className="absolute top-2 left-2 z-10">
              <Checkbox
                checked={selectedFiles.includes(file.id)}
                onCheckedChange={() => onFileSelect(file.id)}
                className="bg-white/80 border-white"
              />
            </div>

            {/* Hover overlay with actions */}
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
            
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
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
      ))}
    </div>
  );
};

export default MediaGalleryGrid;
