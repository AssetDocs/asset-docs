
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
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  isOpen,
  onClose,
  onCreateFolder
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('from-blue-500 to-purple-600');

  const gradients = [
    { value: 'from-blue-500 to-purple-600', label: 'Ocean', class: 'bg-gradient-to-r from-blue-500 to-purple-600' },
    { value: 'from-pink-500 to-rose-600', label: 'Sunset', class: 'bg-gradient-to-r from-pink-500 to-rose-600' },
    { value: 'from-green-500 to-emerald-600', label: 'Forest', class: 'bg-gradient-to-r from-green-500 to-emerald-600' },
    { value: 'from-orange-500 to-amber-600', label: 'Autumn', class: 'bg-gradient-to-r from-orange-500 to-amber-600' },
    { value: 'from-purple-500 to-pink-600', label: 'Lavender', class: 'bg-gradient-to-r from-purple-500 to-pink-600' },
    { value: 'from-cyan-500 to-blue-600', label: 'Sky', class: 'bg-gradient-to-r from-cyan-500 to-blue-600' },
    { value: 'from-red-500 to-orange-600', label: 'Fire', class: 'bg-gradient-to-r from-red-500 to-orange-600' },
    { value: 'from-indigo-500 to-purple-600', label: 'Galaxy', class: 'bg-gradient-to-r from-indigo-500 to-purple-600' },
    { value: 'from-teal-500 to-green-600', label: 'Mint', class: 'bg-gradient-to-r from-teal-500 to-green-600' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateFolder(name, description, color);
      setName('');
      setDescription('');
      setColor('from-blue-500 to-purple-600');
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setColor('from-blue-500 to-purple-600');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            Create a new folder to organize your photos. You can move photos into this folder later.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              placeholder="Enter folder name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="folder-description">Description (Optional)</Label>
            <Textarea
              id="folder-description"
              placeholder="Enter folder description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>Folder Gradient</Label>
            <RadioGroup value={color} onValueChange={setColor}>
              <div className="grid grid-cols-3 gap-2">
                {gradients.map((gradientOption) => (
                  <div key={gradientOption.value} className="flex flex-col items-center space-y-1">
                    <RadioGroupItem 
                      value={gradientOption.value} 
                      id={gradientOption.value}
                      className="sr-only"
                    />
                    <Label
                      htmlFor={gradientOption.value}
                      className={`cursor-pointer rounded-lg border-2 transition-all w-full ${
                        color === gradientOption.value 
                          ? 'border-primary ring-2 ring-primary/20' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className={`w-full h-12 rounded-md ${gradientOption.class}`} />
                    </Label>
                    <span className="text-xs text-muted-foreground">{gradientOption.label}</span>
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
              Create Folder
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFolderModal;
