import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Folder, FolderOpen, FileText, Trash2 } from 'lucide-react';

interface Folder {
  id: string;
  folder_name: string;
  description: string | null;
  gradient_color: string;
  created_at: string;
}

interface DocumentFoldersProps {
  folders: Folder[];
  selectedFolder: string | null;
  onFolderSelect: (folderId: string | null) => void;
  documentCount: number;
  onDeleteFolder: (folderId: string) => void;
}

const DocumentFolders: React.FC<DocumentFoldersProps> = ({
  folders,
  selectedFolder,
  onFolderSelect,
  documentCount,
  onDeleteFolder
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Organization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant={selectedFolder === null ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onFolderSelect(null)}
          >
            <FileText className="h-4 w-4 mr-2" />
            All Documents
            <Badge variant="secondary" className="ml-auto">
              {documentCount}
            </Badge>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Folders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {folders.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <Folder className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No folders created yet</p>
            </div>
          ) : (
            folders.map((folder) => {
              const isSelected = selectedFolder === folder.id;
              
              return (
                <div key={folder.id} className="relative group">
                  <Button
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
                      {documentCount}
                    </Badge>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteFolder(folder.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentFolders;
