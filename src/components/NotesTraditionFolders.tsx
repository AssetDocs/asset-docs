import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Folder, Pencil, Plus, Trash2 } from 'lucide-react';

export interface NoteFolderItem {
  id: string;
  folder_name: string;
  description: string | null;
  gradient_color: string;
  created_at: string;
}

interface NotesTraditionFoldersProps {
  folders: NoteFolderItem[];
  selectedFolder: string | null;
  onFolderSelect: (folderId: string | null) => void;
  totalCount: number;
  counts: Record<string, number>;
  onCreateFolder: () => void;
  onEditFolder: (folder: NoteFolderItem) => void;
  onDeleteFolder: (folderId: string) => void;
}

const NotesTraditionFolders: React.FC<NotesTraditionFoldersProps> = ({
  folders,
  selectedFolder,
  onFolderSelect,
  totalCount,
  counts,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Notes Organization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={onCreateFolder} className="w-full" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Create Folder
        </Button>

        <Button
          variant={selectedFolder === null ? 'default' : 'ghost'}
          className="w-full justify-start p-3 h-auto"
          onClick={() => onFolderSelect(null)}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center mr-3">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="font-medium text-sm">All Notes</div>
            <div className="text-xs text-muted-foreground">View everything</div>
          </div>
          <Badge variant="secondary" className="ml-2">{totalCount}</Badge>
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
                <div key={folder.id} className="flex items-center w-full gap-1">
                  <Button
                    variant={isSelected ? 'default' : 'ghost'}
                    className="flex-1 justify-start p-3 h-auto min-w-0"
                    onClick={() => onFolderSelect(folder.id)}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 shrink-0 ${folder.gradient_color}`}>
                      <Folder className="h-4 w-4 text-white fill-white" />
                    </div>
                    <div className="flex-1 text-left min-w-0 overflow-hidden">
                      <div className="font-medium text-sm truncate">{folder.folder_name}</div>
                      {folder.description && (
                        <div className="text-xs text-muted-foreground truncate">{folder.description}</div>
                      )}
                    </div>
                    <Badge variant="secondary" className="ml-2">{counts[folder.id] || 0}</Badge>
                  </Button>
                  <div className="flex shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-muted"
                      onClick={(e) => { e.stopPropagation(); onEditFolder(folder); }}
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-destructive/10"
                      onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotesTraditionFolders;
