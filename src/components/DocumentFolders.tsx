import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Folder, FileText, Trash2, Plus, GripVertical, Pencil } from 'lucide-react';

interface FolderItem {
  id: string;
  folder_name: string;
  description: string | null;
  gradient_color: string;
  created_at: string;
  display_order?: number;
}

interface DocumentFoldersProps {
  folders: FolderItem[];
  selectedFolder: string | null;
  onFolderSelect: (folderId: string | null) => void;
  documentCount: number;
  onDeleteFolder: (folderId: string) => void;
  onCreateFolder: () => void;
  onReorderFolders?: (folders: FolderItem[]) => void;
  onEditFolder?: (folder: FolderItem) => void;
}

const DocumentFolders: React.FC<DocumentFoldersProps> = ({
  folders,
  selectedFolder,
  onFolderSelect,
  documentCount,
  onDeleteFolder,
  onCreateFolder,
  onReorderFolders,
  onEditFolder
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newFolders = [...folders];
    const [removed] = newFolders.splice(draggedIndex, 1);
    newFolders.splice(dropIndex, 0, removed);

    if (onReorderFolders) {
      onReorderFolders(newFolders);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Organization
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
        
        {/* ALL Documents Option */}
        <Button
          variant={selectedFolder === null ? 'default' : 'ghost'}
          className="w-full justify-start p-3 h-auto"
          onClick={() => onFolderSelect(null)}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center mr-3">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="font-medium text-sm">All Documents</div>
            <div className="text-xs text-muted-foreground">View all documents</div>
          </div>
          <Badge variant="secondary" className="ml-2">
            {documentCount}
          </Badge>
        </Button>
        
        {folders.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No folders created yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {folders.map((folder, index) => {
              const isSelected = selectedFolder === folder.id;
              const isDragging = draggedIndex === index;
              const isDragOver = dragOverIndex === index;
              
              return (
                <div 
                  key={folder.id} 
                  className={`relative transition-all duration-200 ${isDragging ? 'opacity-50' : ''} ${isDragOver ? 'transform translate-y-1' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  {isDragOver && (
                    <div className="absolute -top-1 left-0 right-0 h-0.5 bg-brand-blue rounded-full" />
                  )}
                  <Button
                    variant={isSelected ? 'default' : 'ghost'}
                    className="w-full justify-start p-3 h-auto pr-20"
                    onClick={() => onFolderSelect(folder.id)}
                  >
                    <div className="cursor-grab active:cursor-grabbing mr-2 text-muted-foreground hover:text-foreground">
                      <GripVertical className="h-4 w-4" />
                    </div>
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
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    {onEditFolder && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditFolder(folder);
                        }}
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFolder(folder.id);
                      }}
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

export default DocumentFolders;
