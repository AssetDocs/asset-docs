import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface FolderData {
  id: string;
  folder_name: string;
  description: string | null;
  gradient_color: string;
}

interface EditFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, name: string, description: string, color: string) => void;
  folder: FolderData | null;
  isRoomBased?: boolean;
}

const EditFolderModal: React.FC<EditFolderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  folder,
  isRoomBased = false
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('bg-blue-500');

  const colors = [
    { value: 'bg-blue-500', label: 'Blue' },
    { value: 'bg-red-500', label: 'Red' },
    { value: 'bg-green-500', label: 'Green' },
    { value: 'bg-yellow-500', label: 'Yellow' },
    { value: 'bg-purple-500', label: 'Purple' },
    { value: 'bg-pink-500', label: 'Pink' },
    { value: 'bg-indigo-500', label: 'Indigo' },
    { value: 'bg-orange-500', label: 'Orange' },
    { value: 'bg-teal-500', label: 'Teal' },
    { value: 'bg-cyan-500', label: 'Cyan' },
    { value: 'bg-rose-500', label: 'Rose' },
    { value: 'bg-emerald-500', label: 'Emerald' }
  ];

  useEffect(() => {
    if (folder) {
      setName(folder.folder_name);
      setDescription(folder.description || '');
      setColor(folder.gradient_color || 'bg-blue-500');
    }
  }, [folder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (folder && name.trim()) {
      onSave(folder.id, name, description, color);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit {isRoomBased ? 'Room' : 'Folder'}</DialogTitle>
          <DialogDescription>
            Update the {isRoomBased ? 'room' : 'folder'} name, description, and color.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name">{isRoomBased ? 'Room Name' : 'Folder Name'}</Label>
            <Input
              id="folder-name"
              placeholder={isRoomBased ? 'Enter room name...' : 'Enter folder name...'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="folder-description">Description (Optional)</Label>
            <Textarea
              id="folder-description"
              placeholder="Enter description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>Color</Label>
            <RadioGroup value={color} onValueChange={setColor}>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((colorOption) => (
                  <div key={colorOption.value} className="flex flex-col items-center space-y-1">
                    <RadioGroupItem 
                      value={colorOption.value} 
                      id={`edit-${colorOption.value}`}
                      className="sr-only"
                    />
                    <Label
                      htmlFor={`edit-${colorOption.value}`}
                      className={`cursor-pointer rounded-lg border-2 transition-all w-full ${
                        color === colorOption.value 
                          ? 'border-primary ring-2 ring-primary/20' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className={`w-full h-10 rounded-md ${colorOption.value}`} />
                    </Label>
                    <span className="text-xs text-muted-foreground">{colorOption.label}</span>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditFolderModal;
