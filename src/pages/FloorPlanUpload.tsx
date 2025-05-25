import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileImage, Upload, Home, Scan } from 'lucide-react';
import FloorPlanScanner from '@/components/FloorPlanScanner';

interface UploadedFloorPlan {
  id: string;
  file: File;
  preview?: string;
  name: string;
  description: string;
  floor: string;
  propertySection: string;
}

const FloorPlanUpload: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedPlans, setUploadedPlans] = useState<UploadedFloorPlan[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles([...selectedFiles, ...files]);
    }
  };

  const processFloorPlans = () => {
    const newPlans: UploadedFloorPlan[] = selectedFiles.map(file => {
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
      
      return {
        id: Date.now().toString() + Math.random().toString(),
        file,
        preview,
        name: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
        description: '',
        floor: '',
        propertySection: ''
      };
    });

    setUploadedPlans([...uploadedPlans, ...newPlans]);
    setSelectedFiles([]);
  };

  const updatePlanValue = (id: string, field: string, value: string) => {
    setUploadedPlans(plans =>
      plans.map(plan =>
        plan.id === id 
          ? { ...plan, [field]: value }
          : plan
      )
    );
  };

  const removePlan = (id: string) => {
    setUploadedPlans(plans => plans.filter(plan => plan.id !== id));
  };

  const savePlans = () => {
    console.log('Saving floor plans:', uploadedPlans);
    // Here you would save to your backend/database
    navigate('/account/floorplans');
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
            <h1 className="text-3xl font-bold text-brand-blue mb-2">Floor Plans & Scanning</h1>
            <p className="text-gray-600">Upload floor plans or scan rooms to create digital floor plans</p>
          </div>

          <Tabs defaultValue="upload" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="flex items-center">
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </TabsTrigger>
              <TabsTrigger value="scan" className="flex items-center">
                <Scan className="h-4 w-4 mr-2" />
                Live Scanner
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileImage className="h-6 w-6 mr-2 text-brand-blue" />
                      Floor Plan Upload
                    </CardTitle>
                    <CardDescription>
                      Select images or PDF files containing floor plans and architectural drawings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="floorplans">Select Floor Plans</Label>
                      <Input
                        id="floorplans"
                        type="file"
                        multiple
                        accept="image/*,application/pdf"
                        onChange={handleFileSelect}
                        className="mt-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Supported formats: Images (JPG, PNG, etc.) and PDF files
                      </p>
                    </div>

                    {selectedFiles.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          {selectedFiles.length} file(s) selected
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedFiles.map((file, index) => (
                            <div key={index} className="relative">
                              {file.type.startsWith('image/') ? (
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={file.name}
                                  className="w-full h-20 object-cover rounded border"
                                />
                              ) : (
                                <div className="w-full h-20 bg-gray-200 rounded border flex items-center justify-center">
                                  <FileImage className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                              <p className="text-xs truncate mt-1">{file.name}</p>
                            </div>
                          ))}
                        </div>
                        
                        <Button 
                          onClick={processFloorPlans}
                          className="w-full mt-4 bg-brand-orange hover:bg-brand-orange/90"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Process Floor Plans
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Floor Plan Management */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Home className="h-6 w-6 mr-2 text-brand-blue" />
                      Floor Plan Details
                    </CardTitle>
                    <CardDescription>
                      Add details and organize your floor plans
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {uploadedPlans.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        Upload floor plans to add details here
                      </p>
                    ) : (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {uploadedPlans.map((plan) => (
                          <div key={plan.id} className="border rounded-lg p-4 bg-white">
                            <div className="flex space-x-4">
                              {plan.preview ? (
                                <img
                                  src={plan.preview}
                                  alt={plan.name}
                                  className="w-16 h-16 object-cover rounded"
                                />
                              ) : (
                                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                  <FileImage className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                              
                              <div className="flex-1 space-y-2">
                                <Input
                                  value={plan.name}
                                  onChange={(e) => updatePlanValue(plan.id, 'name', e.target.value)}
                                  placeholder="Floor plan title"
                                  className="text-sm"
                                />
                                
                                <div className="flex space-x-2">
                                  <Input
                                    value={plan.floor}
                                    onChange={(e) => updatePlanValue(plan.id, 'floor', e.target.value)}
                                    placeholder="Floor (e.g., 1st Floor, Basement)"
                                    className="text-sm"
                                  />
                                  <Input
                                    value={plan.propertySection}
                                    onChange={(e) => updatePlanValue(plan.id, 'propertySection', e.target.value)}
                                    placeholder="Section (e.g., Main House, Garage)"
                                    className="text-sm"
                                  />
                                </div>
                                
                                <Textarea
                                  value={plan.description}
                                  onChange={(e) => updatePlanValue(plan.id, 'description', e.target.value)}
                                  placeholder="Description and notes"
                                  rows={2}
                                  className="text-sm"
                                />
                                
                                <div className="flex justify-end">
                                  <Button
                                    onClick={() => removePlan(plan.id)}
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
                    
                    {uploadedPlans.length > 0 && (
                      <Button 
                        onClick={savePlans}
                        className="w-full mt-4 bg-brand-blue hover:bg-brand-lightBlue"
                      >
                        Save All Floor Plans
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="scan" className="space-y-6">
              <FloorPlanScanner />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default FloorPlanUpload;
