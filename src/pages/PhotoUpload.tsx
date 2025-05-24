
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload, Camera, Zap, DollarSign } from 'lucide-react';

interface UploadedItem {
  id: string;
  file: File;
  preview: string;
  name: string;
  description: string;
  estimatedValue: number;
  aiGenerated: boolean;
  category: string;
}

const PhotoUpload: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedItems, setUploadedItems] = useState<UploadedItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles([...selectedFiles, ...files]);
    }
  };

  const simulateAIAnalysis = async (file: File): Promise<{ name: string; value: number; category: string; description: string }> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI responses based on file name or random generation
    const categories = ['Electronics', 'Furniture', 'Jewelry', 'Artwork', 'Appliances', 'Collectibles'];
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    const mockResponses = {
      'Electronics': { name: 'Smart TV', value: 850, description: 'Large screen smart television with streaming capabilities' },
      'Furniture': { name: 'Leather Sofa', value: 1200, description: 'Premium leather sectional sofa in excellent condition' },
      'Jewelry': { name: 'Diamond Ring', value: 2500, description: 'Elegant diamond engagement ring with certification' },
      'Artwork': { name: 'Oil Painting', value: 450, description: 'Original oil painting by local artist' },
      'Appliances': { name: 'Refrigerator', value: 1100, description: 'Stainless steel refrigerator with ice maker' },
      'Collectibles': { name: 'Vintage Watch', value: 750, description: 'Vintage mechanical watch in working condition' }
    };

    const response = mockResponses[category as keyof typeof mockResponses];
    return { ...response, category };
  };

  const processWithAI = async () => {
    setIsAnalyzing(true);
    const newItems: UploadedItem[] = [];

    for (const file of selectedFiles) {
      const preview = URL.createObjectURL(file);
      const aiResult = await simulateAIAnalysis(file);
      
      const item: UploadedItem = {
        id: Date.now().toString() + Math.random().toString(),
        file,
        preview,
        name: aiResult.name,
        description: aiResult.description,
        estimatedValue: aiResult.value,
        aiGenerated: true,
        category: aiResult.category
      };
      
      newItems.push(item);
    }

    setUploadedItems([...uploadedItems, ...newItems]);
    setSelectedFiles([]);
    setIsAnalyzing(false);
  };

  const updateItemValue = (id: string, field: string, value: string | number) => {
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
                      onClick={processWithAI}
                      disabled={isAnalyzing}
                      className="w-full mt-4 bg-brand-orange hover:bg-brand-orange/90"
                    >
                      {isAnalyzing ? (
                        <>
                          <Zap className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing with AI...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Analyze with AI
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Analysis Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-6 w-6 mr-2 text-brand-blue" />
                  AI Valuations
                </CardTitle>
                <CardDescription>
                  Review and adjust the AI-generated estimates
                </CardDescription>
              </CardHeader>
              <CardContent>
                {uploadedItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Upload photos to see AI valuations here
                  </p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {uploadedItems.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex space-x-4">
                          <img
                            src={item.preview}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1 space-y-2">
                            <Input
                              value={item.name}
                              onChange={(e) => updateItemValue(item.id, 'name', e.target.value)}
                              placeholder="Item name"
                              className="text-sm"
                            />
                            <div className="flex space-x-2">
                              <Input
                                type="number"
                                value={item.estimatedValue}
                                onChange={(e) => updateItemValue(item.id, 'estimatedValue', Number(e.target.value))}
                                placeholder="Value"
                                className="text-sm"
                              />
                              <Input
                                value={item.category}
                                onChange={(e) => updateItemValue(item.id, 'category', e.target.value)}
                                placeholder="Category"
                                className="text-sm"
                              />
                            </div>
                            <Textarea
                              value={item.description}
                              onChange={(e) => updateItemValue(item.id, 'description', e.target.value)}
                              placeholder="Description"
                              rows={2}
                              className="text-sm"
                            />
                            <div className="flex justify-between items-center">
                              {item.aiGenerated && (
                                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                  AI Generated
                                </span>
                              )}
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
