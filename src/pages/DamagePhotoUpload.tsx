import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import PropertySelector from '@/components/PropertySelector';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';
import { ArrowLeft, Upload, Camera, Image as ImageIcon, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { StorageService } from '@/services/StorageService';
import { PropertyService } from '@/services/PropertyService';

const DamagePhotoUpload: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadData, setUploadData] = useState({
    propertyId: '',
    damageType: '',
    severity: 'moderate' as 'minor' | 'moderate' | 'severe',
    location: '',
    description: '',
    dateOccurred: new Date().toISOString().split('T')[0]
  });

  const damageTypes = [
    'Water Damage',
    'Fire Damage', 
    'Storm Damage',
    'Structural Damage',
    'Vandalism',
    'Break-in',
    'Appliance Failure',
    'Plumbing Issues',
    'Electrical Issues',
    'HVAC Issues',
    'Roof Damage',
    'Foundation Issues',
    'Other'
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setSelectedFiles(files);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !uploadData.propertyId || !uploadData.damageType) {
      toast({
        title: "Missing Information",
        description: "Please select files, property, and damage type before uploading.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to upload files.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        // Upload to photos bucket (damage photos stored there)
        const uploadResult = await StorageService.uploadFile(file, 'photos', user.id);
        const filePath = typeof uploadResult === 'string' ? uploadResult : uploadResult.path;
        const fileUrl = uploadResult.url; // Use the signed URL from upload result

        // Add to property_files table
        await PropertyService.addPropertyFile({
          property_id: uploadData.propertyId,
          file_name: file.name,
          file_path: filePath,
          file_url: fileUrl,
          file_type: 'photo',
          file_size: file.size,
          bucket_name: 'photos'
        });
      });

      await Promise.all(uploadPromises);

      toast({
        title: "Photos Uploaded",
        description: `Successfully uploaded ${selectedFiles.length} damage photos.`,
      });

      navigate('/account#post-damage');
    } catch (error) {
      console.error('Error uploading damage photos:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your photos. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleBack = () => {
    navigate('/account#post-damage');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <DashboardBreadcrumb />
          
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={handleBack} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Post Damage
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="h-6 w-6 mr-2 text-red-600" />
                Upload Damage Photos
              </CardTitle>
              <CardDescription>
                Upload photos documenting property damage for insurance and repair purposes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Selection */}
              <div className="space-y-2">
                <Label>Select Photos</Label>
                
                {/* Hidden file inputs */}
                <Input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {/* Upload Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-red-300 hover:border-red-500 hover:bg-red-50"
                  >
                    <Camera className="h-6 w-6 text-red-600" />
                    <div className="text-center">
                      <div className="font-medium text-sm">Take Photo</div>
                      <div className="text-xs text-gray-500">Use camera</div>
                    </div>
                  </Button>

                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-red-300 hover:border-red-500 hover:bg-red-50"
                  >
                    <ImageIcon className="h-6 w-6 text-red-600" />
                    <div className="text-center">
                      <div className="font-medium text-sm">Choose Photos</div>
                      <div className="text-xs text-gray-500">From gallery</div>
                    </div>
                  </Button>
                </div>
                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Selected Photos ({selectedFiles.length}):</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => {
                              setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                            }}
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <p className="text-xs truncate mt-1">{file.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Damage Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Property</Label>
                  <PropertySelector
                    value={uploadData.propertyId}
                    onChange={(value) => setUploadData({...uploadData, propertyId: value})}
                    placeholder="Select property"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Damage Type</Label>
                  <Select 
                    value={uploadData.damageType} 
                    onValueChange={(value) => setUploadData({...uploadData, damageType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select damage type" />
                    </SelectTrigger>
                    <SelectContent>
                      {damageTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select 
                    value={uploadData.severity} 
                    onValueChange={(value) => setUploadData({...uploadData, severity: value as 'minor' | 'moderate' | 'severe'})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minor">Minor</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={uploadData.location}
                    onChange={(e) => setUploadData({...uploadData, location: e.target.value})}
                    placeholder="Room/area where damage occurred"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date Occurred</Label>
                  <Input
                    type="date"
                    value={uploadData.dateOccurred}
                    onChange={(e) => setUploadData({...uploadData, dateOccurred: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                  placeholder="Describe the damage shown in these photos..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleUpload} className="bg-red-600 hover:bg-red-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photos
                </Button>
                <Button onClick={handleBack} variant="outline">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default DamagePhotoUpload;