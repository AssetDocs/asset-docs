
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Folder, Images, Trash2, Plus } from 'lucide-react';

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
  onDeleteFolder: (folderId: string) => void;
  onCreateFolder: () => void;
}

const PhotoGalleryFolders: React.FC<PhotoGalleryFoldersProps> = ({
  folders,
  selectedFolder,
  onFolderSelect,
  photoCount,
  onDeleteFolder,
  onCreateFolder
}) => {

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Images className="h-5 w-5" />
          Photo/Video Organization
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
        
        {/* ALL Photos Option */}
        <Button
          variant={selectedFolder === null ? 'default' : 'ghost'}
          className="w-full justify-start p-3 h-auto"
          onClick={() => onFolderSelect(null)}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center mr-3">
            <Images className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="font-medium text-sm">All Photos and Videos</div>
            <div className="text-xs text-muted-foreground">View all photos and videos</div>
          </div>
          <Badge variant="secondary" className="ml-2">
            {photoCount}
          </Badge>
        </Button>
        
        {folders.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No folders created yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {folders.map((folder) => {
              const isSelected = selectedFolder === folder.id;
              
              return (
                <div key={folder.id} className="relative">
                  <Button
                    variant={isSelected ? 'default' : 'ghost'}
                    className="w-full justify-start p-3 h-auto pr-12"
                    onClick={() => onFolderSelect(folder.id)}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${folder.gradient_color}`}>
                      <Folder className="h-4 w-4 text-white fill-white" />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium text-sm">{folder.folder_name}</div>
                      {folder.description && (
                        <div className="text-xs text-muted-foreground truncate">{folder.description}</div>
                      )}
                    </div>
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

export default PhotoGalleryFolders;
