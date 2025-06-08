
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertySelector from '@/components/PropertySelector';
import ItemTypeSelector from '@/components/ItemTypeSelector';
import PropertyUpgradeSelector from '@/components/PropertyUpgradeSelector';
import CategorySelector from '@/components/CategorySelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Upload, Camera, Zap, DollarSign, MapPin, Key, AlertCircle, Plus, FileText } from 'lucide-react';
import { aiAnalysisService } from '@/components/AIAnalysisService';

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedItems, setUploadedItems] = useState<UploadedItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

  const saveItems = () => {
    console.log('Saving items:', uploadedItems);
    // Here you would save to your backend/database
    navigate('/account/photos');
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

          {/* AI Configuration */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="h-5 w-5 mr-2 text-orange-500" />
                AI Configuration & Defaults
              </CardTitle>
              <CardDescription>
                Configure AI settings and default values for your uploads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter OpenAI API key for AI analysis"
                  className="flex-1"
                />
                <Button onClick={handleApiKeyUpdate}>
                  Save Key
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="use-ai"
                  checked={defaultUseAI}
                  onCheckedChange={setDefaultUseAI}
                />
                <Label htmlFor="use-ai">Use AI for automatic item analysis</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Default Property</Label>
                  <PropertySelector
                    value={defaultPropertyId}
                    onChange={setDefaultPropertyId}
                    placeholder="Select default property"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Item Type</Label>
                  <ItemTypeSelector
                    value={defaultItemType}
                    onChange={setDefaultItemType}
                    placeholder="Select default item type"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Category</Label>
                  <CategorySelector
                    value={defaultCategory}
                    onChange={setDefaultCategory}
                    placeholder="Select default category"
                  />
                </div>
              </div>

              <div className="flex items-start space-x-2 text-xs text-gray-500">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  Without an API key, the system will skip AI analysis. For production use, 
                  connect to Supabase for secure key storage.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-6 w-6 mr-2 text-brand-blue" />
                  Photo Upload
                </CardTitle>
                <CardDescription>
                  Select photos of items you want to document and value
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="photos">Select Photos</Label>
                  <Input
                    id="photos"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="mt-2"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      {selectedFiles.length} file(s) selected
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-20 object-cover rounded border"
                          />
                          <p className="text-xs truncate mt-1">{file.name}</p>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      onClick={processItems}
                      disabled={isAnalyzing}
                      className="w-full mt-4 bg-brand-orange hover:bg-brand-orange/90"
                    >
                      {isAnalyzing ? (
                        <>
                          <Zap className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Process Items
                        </>
                      )}
                    </Button>
                  </div>
                )}

                <div className="border-t pt-4">
                  <Button 
                    onClick={addManualEntry}
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Manual Entry
                  </Button>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Add items without photos or videos
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Item Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-6 w-6 mr-2 text-brand-blue" />
                  Item Details
                </CardTitle>
                <CardDescription>
                  Review and adjust item information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {uploadedItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Upload photos or add manual entries to start
                  </p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {uploadedItems.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4 bg-white">
                        <div className="space-y-3">
                          <div className="flex space-x-4">
                            {item.preview ? (
                              <img
                                src={item.preview}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                <FileText className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1 space-y-2">
                              <Input
                                value={item.name}
                                onChange={(e) => updateItemValue(item.id, 'name', e.target.value)}
                                placeholder="Item name"
                                className="text-sm"
                              />
                              
                              <div className="space-y-2">
                                <PropertySelector
                                  value={item.propertyId}
                                  onChange={(value) => updateItemValue(item.id, 'propertyId', value)}
                                  placeholder="Select property"
                                />
                                
                                <div className="grid grid-cols-2 gap-2">
                                  <ItemTypeSelector
                                    value={item.itemType}
                                    onChange={(value) => updateItemValue(item.id, 'itemType', value)}
                                    placeholder="Select item type"
                                  />
                                  
                                  <CategorySelector
                                    value={item.category}
                                    onChange={(value) => updateItemValue(item.id, 'category', value)}
                                    placeholder="Select category"
                                  />
                                </div>
                                
                                {item.itemType === 'Property Upgrades' && (
                                  <PropertyUpgradeSelector
                                    value={item.propertyUpgrade || ''}
                                    onChange={(value) => updateItemValue(item.id, 'propertyUpgrade', value)}
                                    placeholder="Select upgrade type"
                                  />
                                )}
                              </div>
                              
                              <div className="flex space-x-2">
                                <Input
                                  type="number"
                                  value={item.estimatedValue}
                                  onChange={(e) => updateItemValue(item.id, 'estimatedValue', Number(e.target.value))}
                                  placeholder="Value ($)"
                                  className="text-sm"
                                />
                                <div className="flex items-center space-x-2 flex-1">
                                  <MapPin className="h-4 w-4 text-gray-500" />
                                  <Input
                                    value={item.location}
                                    onChange={(e) => updateItemValue(item.id, 'location', e.target.value)}
                                    placeholder="Room/Location"
                                    className="text-sm"
                                  />
                                </div>
                              </div>
                              
                              <Textarea
                                value={item.description}
                                onChange={(e) => updateItemValue(item.id, 'description', e.target.value)}
                                placeholder="Detailed description"
                                rows={3}
                                className="text-sm"
                              />
                              
                              <div className="flex justify-between items-center">
                                <div className="flex space-x-2">
                                  {item.isManualEntry && (
                                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                      Manual Entry
                                    </span>
                                  )}
                                  {item.aiGenerated && (
                                    <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                      AI Generated
                                    </span>
                                  )}
                                  {item.confidence && (
                                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                      {item.confidence}% confidence
                                    </span>
                                  )}
                                </div>
                                <Button
                                  onClick={() => removeItem(item.id)}
                                  variant="destructive"
                                  size="sm"
                                  className="text-xs"
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {uploadedItems.length > 0 && (
                  <Button 
                    onClick={saveItems}
                    className="w-full mt-4 bg-brand-blue hover:bg-brand-lightBlue"
                  >
                    Save All Items
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PhotoUpload;
