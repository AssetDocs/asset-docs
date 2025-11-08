
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Folder, FolderOpen, Images } from 'lucide-react';

interface Folder {
  id: number;
  name: string;
  description: string;
  photoCount: number;
  createdDate: string;
  color: string;
}

interface Photo {
  id: number;
  name: string;
  filename: string;
  url: string;
  uploadDate: string;
  size: string;
  propertyId: number;
  propertyName: string;
  folderId: number | null;
  tags: string[];
}

interface PhotoGalleryFoldersProps {
  folders: Folder[];
  selectedFolder: number | null;
  onFolderSelect: (folderId: number | null) => void;
  photos: Photo[];
}

const PhotoGalleryFolders: React.FC<PhotoGalleryFoldersProps> = ({
  folders,
  selectedFolder,
  onFolderSelect,
  photos
}) => {
  const getColorClass = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600 bg-blue-50';
      case 'green': return 'text-green-600 bg-green-50';
      case 'purple': return 'text-purple-600 bg-purple-50';
      case 'orange': return 'text-orange-600 bg-orange-50';
      case 'red': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const unorganizedCount = photos.filter(photo => photo.folderId === null).length;

  return (
    <div className="space-y-2">
      {folders.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <Folder className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No folders created yet</p>
        </div>
      ) : (
        folders.map((folder) => {
          const actualPhotoCount = photos.filter(photo => photo.folderId === folder.id).length;
          const isSelected = selectedFolder === folder.id;
          
          return (
            <Button
              key={folder.id}
              variant={isSelected ? 'default' : 'ghost'}
              className="w-full justify-start p-3 h-auto"
              onClick={() => onFolderSelect(folder.id)}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${getColorClass(folder.color)}`}>
                {isSelected ? (
                  <FolderOpen className="h-4 w-4" />
                ) : (
                  <Folder className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-sm">{folder.name}</div>
                <div className="text-xs text-gray-500 truncate">{folder.description}</div>
              </div>
              <Badge variant="secondary" className="ml-2">
                {actualPhotoCount}
              </Badge>
            </Button>
          );
        })
      )}
    </div>
  );
};

export default PhotoGalleryFolders;
