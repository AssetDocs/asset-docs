
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Folder, FolderOpen, Images } from 'lucide-react';

interface Folder {
  id: string;
  folder_name: string;
  description: string | null;
  gradient_color: string;
  created_at: string;
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
  selectedFolder: string | null;
  onFolderSelect: (folderId: string | null) => void;
  photoCount: number;
}

const PhotoGalleryFolders: React.FC<PhotoGalleryFoldersProps> = ({
  folders,
  selectedFolder,
  onFolderSelect,
  photoCount
}) => {

  return (
    <div className="space-y-2">
      {folders.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <Folder className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No folders created yet</p>
        </div>
      ) : (
        folders.map((folder) => {
          const isSelected = selectedFolder === folder.id;
          
          return (
            <Button
              key={folder.id}
              variant={isSelected ? 'default' : 'ghost'}
              className="w-full justify-start p-3 h-auto"
              onClick={() => onFolderSelect(folder.id)}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${folder.gradient_color}`}>
                {isSelected ? (
                  <FolderOpen className="h-4 w-4 text-white" />
                ) : (
                  <Folder className="h-4 w-4 text-white" />
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-sm">{folder.folder_name}</div>
                {folder.description && (
                  <div className="text-xs text-muted-foreground truncate">{folder.description}</div>
                )}
              </div>
              <Badge variant="secondary" className="ml-2">
                {photoCount}
              </Badge>
            </Button>
          );
        })
      )}
    </div>
  );
};

export default PhotoGalleryFolders;
