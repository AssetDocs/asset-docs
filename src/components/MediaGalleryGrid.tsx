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
  Clock
} from 'lucide-react';

type ViewMode = 'grid' | 'list';
type MediaType = 'photo' | 'video' | 'document';

interface MediaFile {
  id: string;
  name: string;
  url: string;
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
  mediaType: MediaType;
}

const MediaGalleryGrid: React.FC<MediaGalleryGridProps> = ({
  files,
  viewMode,
  selectedFiles,
  onFileSelect,
  onDeleteFile,
  mediaType
}) => {
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
        {files.map((file) => (
          <Card key={file.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={selectedFiles.includes(file.id)}
                  onCheckedChange={() => onFileSelect(file.id)}
                />
                
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  {mediaType === 'video' ? (
                    <Play className="h-6 w-6 text-gray-400" />
                  ) : (
                    <Icon className="h-6 w-6 text-gray-400" />
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
                    onClick={() => window.open(file.url, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = file.url;
                      link.download = file.name;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
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
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map((file) => (
        <Card key={file.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
          <div className={`relative ${mediaType === 'video' ? 'aspect-video' : 'aspect-square'} bg-gray-200 flex items-center justify-center`}>
            {mediaType === 'video' ? (
              <>
                <Play className="h-12 w-12 text-gray-400" />
                {file.duration && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                    {file.duration}
                  </div>
                )}
              </>
            ) : (
              <Icon className="h-12 w-12 text-gray-400" />
            )}
            
            <div className="absolute top-2 left-2">
              <Checkbox
                checked={selectedFiles.includes(file.id)}
                onCheckedChange={() => onFileSelect(file.id)}
                className="bg-white/80 border-white"
              />
            </div>

            <div className="absolute bottom-2 right-2">
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => onDeleteFile(file.id)}
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => window.open(file.url, '_blank')}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = file.url;
                  link.download = file.name;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                <Download className="h-4 w-4" />
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
      ))}
    </div>
  );
};

export default MediaGalleryGrid;
