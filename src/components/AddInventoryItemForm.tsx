import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Save, Loader2, X, Upload, Image, Video, FileText, Trash2 } from 'lucide-react';
import PropertySelector from '@/components/PropertySelector';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ItemService } from '@/services/ItemService';

const ROOM_OPTIONS = [
  'Living Room',
  'Kitchen',
  'Master Bedroom',
  'Bedroom',
  'Bathroom',
  'Dining Room',
  'Office',
  'Garage',
  'Basement',
  'Attic',
  'Laundry Room',
  'Outdoor/Patio',
  'Storage',
  'Other'
];

const CATEGORY_OPTIONS = [
  'Electronics',
  'Furniture',
  'Appliances',
  'Jewelry',
  'Art',
  'Collectibles',
  'Sports Equipment',
  'Musical Instruments',
  'Tools',
  'Clothing',
  'Other'
];

interface AddInventoryItemFormProps {
  onItemAdded?: () => void;
  onCancel?: () => void;
}

interface UploadedFile {
  file: File;
  preview?: string;
  type: 'image' | 'video' | 'document';
}

const AddInventoryItemForm: React.FC<AddInventoryItemFormProps> = ({ onItemAdded, onCancel }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    propertyId: '',
    name: '',
    location: '',
    estimatedValue: '',
    description: '',
    category: '',
    brand: '',
    model: '',
    condition: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'video' | 'document') => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newFiles: UploadedFile[] = files.map(file => {
        const uploadedFile: UploadedFile = {
          file,
          type: fileType,
        };
        
        // Create preview for images
        if (fileType === 'image') {
          uploadedFile.preview = URL.createObjectURL(file);
        }
        
        return uploadedFile;
      });
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
    // Reset the input
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const file = prev[index];
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to add items.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await ItemService.createItem({
        user_id: user.id,
        name: formData.name || 'Untitled Item',
        description: formData.description || null,
        estimated_value: formData.estimatedValue ? parseFloat(formData.estimatedValue) : null,
        category: formData.category || null,
        location: formData.location || null,
        property_id: formData.propertyId || null,
        brand: formData.brand || null,
        model: formData.model || null,
        condition: formData.condition || null,
        is_manual_entry: true
      });

      // TODO: Handle file uploads to storage when implemented

      toast({
        title: "Item added!",
        description: "Your item has been saved to your inventory.",
      });

      // Cleanup previews
      uploadedFiles.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });

      // Reset form
      setFormData({
        propertyId: '',
        name: '',
        location: '',
        estimatedValue: '',
        description: '',
        category: '',
        brand: '',
        model: '',
        condition: ''
      });
      setUploadedFiles([]);

      onItemAdded?.();
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Failed to add item",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const imageFiles = uploadedFiles.filter(f => f.type === 'image');
  const videoFiles = uploadedFiles.filter(f => f.type === 'video');
  const documentFiles = uploadedFiles.filter(f => f.type === 'document');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-brand-blue" />
              Manual Entry
            </CardTitle>
            <CardDescription>
              Add an item to your inventory with photos, videos, and documents.
            </CardDescription>
          </div>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Property Selection */}
            <div className="space-y-2">
              <Label htmlFor="property">Property</Label>
              <PropertySelector
                value={formData.propertyId}
                onChange={(value) => handleInputChange('propertyId', value)}
                placeholder="Select a property (optional)"
              />
            </div>

            {/* Item Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Item Name / Title</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Samsung 65 inch TV"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Room/Space */}
            <div className="space-y-2">
              <Label htmlFor="location">Space / Room</Label>
              <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select room (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_OPTIONS.map((room) => (
                    <SelectItem key={room} value={room}>{room}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estimated Value */}
            <div className="space-y-2">
              <Label htmlFor="estimatedValue">Estimated Value ($)</Label>
              <Input
                id="estimatedValue"
                type="number"
                min="0"
                step="0.01"
                value={formData.estimatedValue}
                onChange={(e) => handleInputChange('estimatedValue', e.target.value)}
                placeholder="e.g., 1500"
              />
            </div>

            {/* Brand */}
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder="e.g., Samsung, Apple"
              />
            </div>

            {/* Model */}
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                placeholder="e.g., QN65Q80C"
              />
            </div>

            {/* Condition */}
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Like New">Like New</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description / Details</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Add any additional details about this item..."
              rows={3}
            />
          </div>

          {/* File Upload Section */}
          <div className="space-y-4 pt-4 border-t">
            <Label className="text-base font-semibold">Attachments</Label>
            
            {/* Upload Buttons */}
            <div className="flex flex-wrap gap-2">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e, 'image')}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e, 'video')}
              />
              <input
                ref={documentInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e, 'document')}
              />
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => photoInputRef.current?.click()}
              >
                <Image className="h-4 w-4 mr-2" />
                Add Photos
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => videoInputRef.current?.click()}
              >
                <Video className="h-4 w-4 mr-2" />
                Add Videos
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => documentInputRef.current?.click()}
              >
                <FileText className="h-4 w-4 mr-2" />
                Add Documents
              </Button>
            </div>

            {/* Uploaded Files Display */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-3">
                {/* Images */}
                {imageFiles.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Photos ({imageFiles.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {imageFiles.map((file, idx) => {
                        const globalIdx = uploadedFiles.findIndex(f => f === file);
                        return (
                          <div key={idx} className="relative group">
                            <img
                              src={file.preview}
                              alt={file.file.name}
                              className="h-20 w-20 object-cover rounded-md border"
                            />
                            <button
                              type="button"
                              onClick={() => removeFile(globalIdx)}
                              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Videos */}
                {videoFiles.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Videos ({videoFiles.length})</p>
                    <div className="space-y-1">
                      {videoFiles.map((file, idx) => {
                        const globalIdx = uploadedFiles.findIndex(f => f === file);
                        return (
                          <div key={idx} className="flex items-center justify-between bg-muted p-2 rounded-md">
                            <div className="flex items-center gap-2">
                              <Video className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm truncate max-w-[200px]">{file.file.name}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(globalIdx)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Documents */}
                {documentFiles.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Documents ({documentFiles.length})</p>
                    <div className="space-y-1">
                      {documentFiles.map((file, idx) => {
                        const globalIdx = uploadedFiles.findIndex(f => f === file);
                        return (
                          <div key={idx} className="flex items-center justify-between bg-muted p-2 rounded-md">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm truncate max-w-[200px]">{file.file.name}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(globalIdx)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className="bg-brand-blue hover:bg-brand-lightBlue">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Item
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddInventoryItemForm;
