import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProperties } from '@/hooks/useProperties';

interface Folder {
  id: string;
  folder_name: string;
  gradient_color: string;
}

interface MovePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (propertyId: string | null, folderId: string | null) => void;
  folders: Folder[];
  currentPropertyId?: string | null;
  currentFolderId?: string | null;
  photoCount: number;
}

const MovePhotoModal: React.FC<MovePhotoModalProps> = ({
  isOpen,
  onClose,
  onMove,
  folders,
  currentPropertyId,
  currentFolderId,
  photoCount
}) => {
  const { properties } = useProperties();
  const [selectedProperty, setSelectedProperty] = useState<string | null>(currentPropertyId || null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(currentFolderId || null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onMove(selectedProperty, selectedFolder);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Move {photoCount > 1 ? `${photoCount} Photos` : 'Photo'}</DialogTitle>
          <DialogDescription>
            Select a property and folder to organize your photos
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="property">Property</Label>
            <Select 
              value={selectedProperty || 'none'} 
              onValueChange={(value) => setSelectedProperty(value === 'none' ? null : value)}
            >
              <SelectTrigger id="property">
                <SelectValue placeholder="Select a property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Property</SelectItem>
                {properties.map(property => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="folder">Folder</Label>
            <Select 
              value={selectedFolder || 'none'} 
              onValueChange={(value) => setSelectedFolder(value === 'none' ? null : value)}
            >
              <SelectTrigger id="folder">
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Folder</SelectItem>
                {folders.map(folder => (
                  <SelectItem key={folder.id} value={folder.id}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded bg-gradient-to-r ${folder.gradient_color}`} />
                      {folder.folder_name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Move {photoCount > 1 ? 'Photos' : 'Photo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MovePhotoModal;
