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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (name: string, description: string, color: string) => void;
  titleOverride?: string;
  descriptionOverride?: string;
  buttonTextOverride?: string;
  placeholderOverride?: string;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onCreateFolder,
  titleOverride,
  descriptionOverride,
  buttonTextOverride,
  placeholderOverride
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateFolder(name, description, color);
      setName('');
      setDescription('');
      setColor('bg-blue-500');
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setColor('bg-blue-500');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{titleOverride || 'Create New Folder'}</DialogTitle>
          <DialogDescription>
            {descriptionOverride || 'Create a new folder to organize your photos. You can move photos into this folder later.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name">{titleOverride ? 'Room Name' : 'Folder Name'}</Label>
            <Input
              id="folder-name"
              placeholder={placeholderOverride || 'Enter folder name...'}
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
                      id={colorOption.value}
                      className="sr-only"
                    />
                    <Label
                      htmlFor={colorOption.value}
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
              {buttonTextOverride || 'Create Folder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolderModal;
