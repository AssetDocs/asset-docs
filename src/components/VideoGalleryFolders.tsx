
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Folder, Video, Trash2, Plus } from 'lucide-react';

interface Folder {
  id: number;
  name: string;
  description: string;
  photoCount: number;
  createdDate: string;
  color: string;
}

interface VideoData {
  id: number;
  name: string;
  filename: string;
  url: string;
  duration: string;
  uploadDate: string;
  size: string;
  propertyId: number;
  propertyName: string;
  folderId: number | null;
  tags: string[];
}

interface VideoGalleryFoldersProps {
  folders: Folder[];
  selectedFolder: number | null;
  onFolderSelect: (folderId: number | null) => void;
  videos: VideoData[];
  onDeleteFolder: (folderId: number) => void;
  onCreateFolder: () => void;
}

const VideoGalleryFolders: React.FC<VideoGalleryFoldersProps> = ({
  folders,
  selectedFolder,
  onFolderSelect,
  videos,
  onDeleteFolder,
  onCreateFolder
}) => {
  const getColorClass = (color: string) => {
    switch (color) {
      case 'blue': return 'from-blue-500 to-blue-600';
      case 'green': return 'from-green-500 to-green-600';
      case 'purple': return 'from-purple-500 to-purple-600';
      case 'orange': return 'from-orange-500 to-orange-600';
      case 'red': return 'from-red-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Video className="h-5 w-5" />
          Video Organization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={onCreateFolder}
          className="w-full"
          variant="outline"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Folder
        </Button>
        
        {folders.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No folders created yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {folders.map((folder) => {
              const actualVideoCount = videos.filter(video => video.folderId === folder.id).length;
              const isSelected = selectedFolder === folder.id;
              
              return (
                <div key={folder.id} className="relative">
                  <Button
                    variant={isSelected ? 'default' : 'ghost'}
                    className="w-full justify-start p-3 h-auto pr-12"
                    onClick={() => onFolderSelect(folder.id)}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center mr-3 ${getColorClass(folder.color)}`}>
                      <Folder className="h-4 w-4 text-white fill-white" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium text-sm">{folder.name}</div>
                      {folder.description && (
                        <div className="text-xs text-muted-foreground truncate">{folder.description}</div>
                      )}
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {actualVideoCount}
                    </Badge>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFolder(folder.id);
                    }}
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
  );
};

export default VideoGalleryFolders;
