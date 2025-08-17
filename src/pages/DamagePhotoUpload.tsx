import React, { useState } from 'react';
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
import { ArrowLeft, Upload, Camera, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DamagePhotoUpload: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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

  const handleUpload = () => {
    if (selectedFiles.length === 0 || !uploadData.propertyId || !uploadData.damageType) {
      toast({
        title: "Missing Information",
        description: "Please select files, property, and damage type before uploading.",
        variant: "destructive"
      });
      return;
    }

    // Simulate upload process
    toast({
      title: "Photos Uploaded",
      description: `Successfully uploaded ${selectedFiles.length} damage photos.`,
    });

    // Navigate back to post damage section
    navigate('/account#post-damage');
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
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium">Select damage photos to upload</p>
                    <p className="text-sm text-gray-500">Choose multiple photos (JPG, PNG)</p>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="max-w-xs mx-auto"
                    />
                  </div>
                </div>
                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Selected Photos ({selectedFiles.length}):</p>
                    <div className="space-y-1">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded">
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
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