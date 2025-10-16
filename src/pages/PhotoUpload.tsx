
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import UploadSection from '@/components/PhotoUpload/UploadSection';
import ItemDetailsSection from '@/components/PhotoUpload/ItemDetailsSection';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

import { StorageService } from '@/services/StorageService';
import { ItemService } from '@/services/ItemService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UploadedItem {
  id: string;
  file?: File;
  preview?: string;
  name: string;
  description: string;
  estimatedValue: number;
  category: string;
  itemType: string;
  propertyUpgrade?: string;
  propertyId: string;
  location: string;
  isManualEntry?: boolean;
}

const PhotoUpload: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedItems, setUploadedItems] = useState<UploadedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [defaultPropertyId, setDefaultPropertyId] = useState('');
  const [defaultItemType, setDefaultItemType] = useState('');
  const [defaultCategory, setDefaultCategory] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles([...selectedFiles, ...files]);
    }
  };

  const processItems = async () => {
    setIsProcessing(true);
    const newItems: UploadedItem[] = [];

    for (const file of selectedFiles) {
      const preview = URL.createObjectURL(file);
      
      const basicItem: UploadedItem = {
        id: Date.now().toString() + Math.random().toString(),
        file,
        preview,
        name: file.name.replace(/\.[^/.]+$/, ""),
        description: '',
        estimatedValue: 0,
        category: defaultCategory || 'Manual Entry',
        itemType: defaultItemType || 'Other',
        propertyId: defaultPropertyId,
        location: ''
      };
      newItems.push(basicItem);
    }

    setUploadedItems([...uploadedItems, ...newItems]);
    setSelectedFiles([]);
    setIsProcessing(false);
  };


  const updateItemValue = (id: string, field: string, value: string | number | boolean) => {
    setUploadedItems(items =>
      items.map(item =>
        item.id === id 
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setUploadedItems(items => items.filter(item => item.id !== id));
  };

  const saveItems = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to save your items.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // Upload files to storage and save item details
      for (const item of uploadedItems) {
        let photoUrl = '';
        let photoPath = '';

        // Upload file if it exists
        if (item.file) {
          try {
            const uploadResult = await StorageService.uploadFile(
              item.file,
              'photos',
              user.id,
              `${item.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${item.file.name.split('.').pop()}`
            );
            photoUrl = uploadResult.url;
            photoPath = uploadResult.path;
          } catch (uploadError) {
            console.error('Error uploading file:', uploadError);
            throw new Error(`Failed to upload photo for ${item.name}: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
          }
        }

        // Save item to database
        try {
          await ItemService.createItem({
            user_id: user.id,
            name: item.name || 'Untitled Item',
            description: item.description,
            estimated_value: item.estimatedValue,
            category: item.category,
            item_type: item.itemType,
            property_upgrade: item.propertyUpgrade,
            property_id: item.propertyId,
            location: item.location,
            photo_url: photoUrl,
            photo_path: photoPath,
            is_manual_entry: item.isManualEntry
          });
        } catch (dbError) {
          console.error('Error saving item to database:', dbError);
          throw new Error(`Failed to save item ${item.name}: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
        }
      }

      toast({
        title: "Items saved successfully!",
        description: `${uploadedItems.length} item(s) have been saved to your inventory.`,
      });

      // Clear the form
      setSelectedFiles([]);
      setUploadedItems([]);
      
      // Navigate to inventory page
      navigate('/inventory');
    } catch (error) {
      console.error('Error saving items:', error);
      const errorMessage = error instanceof Error ? error.message : 'There was an error saving your items. Please try again.';
      toast({
        title: "Save failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/account')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-brand-blue mb-2">Upload Photos</h1>
            <p className="text-gray-600">Upload photos of your items and document them with estimated values</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UploadSection
              selectedFiles={selectedFiles}
              onFileSelect={handleFileSelect}
              onProcessItems={processItems}
              isAnalyzing={isProcessing}
            />

            <ItemDetailsSection
              uploadedItems={uploadedItems}
              onUpdateItemValue={updateItemValue}
              onRemoveItem={removeItem}
              onSaveItems={saveItems}
              isSaving={isSaving}
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PhotoUpload;
