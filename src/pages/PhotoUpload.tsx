
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AIConfigurationCard from '@/components/PhotoUpload/AIConfigurationCard';
import UploadSection from '@/components/PhotoUpload/UploadSection';
import ItemDetailsSection from '@/components/PhotoUpload/ItemDetailsSection';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { aiAnalysisService } from '@/components/AIAnalysisService';
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
  aiGenerated: boolean;
  category: string;
  itemType: string;
  propertyUpgrade?: string;
  propertyId: string;
  location: string;
  confidence?: number;
  condition?: string;
  brand?: string;
  model?: string;
  useAI: boolean;
  isManualEntry?: boolean;
}

const PhotoUpload: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedItems, setUploadedItems] = useState<UploadedItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [defaultUseAI, setDefaultUseAI] = useState(true);
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
    setIsAnalyzing(true);
    const newItems: UploadedItem[] = [];

    for (const file of selectedFiles) {
      const preview = URL.createObjectURL(file);
      
      if (defaultUseAI && apiKey) {
        try {
          const aiResult = await aiAnalysisService.analyzeImage(file);
          
          const item: UploadedItem = {
            id: Date.now().toString() + Math.random().toString(),
            file,
            preview,
            name: aiResult.name,
            description: aiResult.description,
            estimatedValue: aiResult.estimatedValue,
            aiGenerated: true,
            category: defaultCategory || aiResult.category,
            itemType: defaultItemType || aiResult.category,
            propertyId: defaultPropertyId,
            location: '',
            confidence: aiResult.confidence,
            condition: aiResult.condition,
            brand: aiResult.brand,
            model: aiResult.model,
            useAI: true
          };
          
          newItems.push(item);
        } catch (error) {
          console.error('AI analysis failed for file:', file.name, error);
          // Fallback to basic item structure
          const basicItem: UploadedItem = {
            id: Date.now().toString() + Math.random().toString(),
            file,
            preview,
            name: file.name.replace(/\.[^/.]+$/, ""),
            description: '',
            estimatedValue: 0,
            aiGenerated: false,
            category: defaultCategory || 'Uncategorized',
            itemType: defaultItemType || 'Other',
            propertyId: defaultPropertyId,
            location: '',
            useAI: false
          };
          newItems.push(basicItem);
        }
      } else {
        // Create basic item without AI analysis
        const basicItem: UploadedItem = {
          id: Date.now().toString() + Math.random().toString(),
          file,
          preview,
          name: file.name.replace(/\.[^/.]+$/, ""),
          description: '',
          estimatedValue: 0,
          aiGenerated: false,
          category: defaultCategory || 'Manual Entry',
          itemType: defaultItemType || 'Other',
          propertyId: defaultPropertyId,
          location: '',
          useAI: false
        };
        newItems.push(basicItem);
      }
    }

    setUploadedItems([...uploadedItems, ...newItems]);
    setSelectedFiles([]);
    setIsAnalyzing(false);
  };

  const addManualEntry = () => {
    const manualItem: UploadedItem = {
      id: Date.now().toString() + Math.random().toString(),
      name: '',
      description: '',
      estimatedValue: 0,
      aiGenerated: false,
      category: defaultCategory || '',
      itemType: defaultItemType || 'Other',
      propertyId: defaultPropertyId,
      location: '',
      useAI: false,
      isManualEntry: true
    };

    setUploadedItems([...uploadedItems, manualItem]);
  };

  const handleApiKeyUpdate = () => {
    aiAnalysisService.setApiKey(apiKey);
    console.log('OpenAI API key updated');
  };

  const updateItemValue = (id: string, field: string, value: string | number | boolean) => {
    setUploadedItems(items =>
      items.map(item =>
        item.id === id 
          ? { ...item, [field]: value, aiGenerated: false }
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
          const uploadResult = await StorageService.uploadFile(
            item.file,
            'photos',
            user.id,
            `${item.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.${item.file.name.split('.').pop()}`
          );
          photoUrl = uploadResult.url;
          photoPath = uploadResult.path;
        }

        // Save item to database
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
          condition: item.condition,
          brand: item.brand,
          model: item.model,
          photo_url: photoUrl,
          photo_path: photoPath,
          ai_generated: item.aiGenerated,
          confidence: item.confidence,
          is_manual_entry: item.isManualEntry
        });
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
      toast({
        title: "Save failed",
        description: "There was an error saving your items. Please try again.",
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
            <p className="text-gray-600">Upload photos of your items and get AI-powered value estimates</p>
          </div>

          <AIConfigurationCard
            apiKey={apiKey}
            setApiKey={setApiKey}
            defaultUseAI={defaultUseAI}
            setDefaultUseAI={setDefaultUseAI}
            defaultPropertyId={defaultPropertyId}
            setDefaultPropertyId={setDefaultPropertyId}
            defaultItemType={defaultItemType}
            setDefaultItemType={setDefaultItemType}
            defaultCategory={defaultCategory}
            setDefaultCategory={setDefaultCategory}
            onApiKeyUpdate={handleApiKeyUpdate}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UploadSection
              selectedFiles={selectedFiles}
              onFileSelect={handleFileSelect}
              onProcessItems={processItems}
              onAddManualEntry={addManualEntry}
              isAnalyzing={isAnalyzing}
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
