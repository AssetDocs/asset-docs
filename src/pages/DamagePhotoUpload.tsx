
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertySelector from '@/components/PropertySelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, AlertTriangle, Camera, Upload, MapPin, Calendar } from 'lucide-react';

interface DamagePhoto {
  id: string;
  file: File;
  name: string;
  description: string;
  location: string;
  damageType: string;
  severity: 'minor' | 'moderate' | 'severe';
  propertyId: string;
  dateOccurred: string;
}

const DamagePhotoUpload: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [damagePhotos, setDamagePhotos] = useState<DamagePhoto[]>([]);
  const [defaultPropertyId, setDefaultPropertyId] = useState('');

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
    'Other'
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles([...selectedFiles, ...files]);
    }
  };

  const processPhotos = () => {
    const newPhotos: DamagePhoto[] = selectedFiles.map(file => ({
      id: Date.now().toString() + Math.random().toString(),
      file,
      name: file.name.replace(/\.[^/.]+$/, ""),
      description: '',
      location: '',
      damageType: '',
      severity: 'moderate' as const,
      propertyId: defaultPropertyId,
      dateOccurred: new Date().toISOString().split('T')[0]
    }));

    setDamagePhotos([...damagePhotos, ...newPhotos]);
    setSelectedFiles([]);
  };

  const updatePhotoValue = (id: string, field: string, value: string) => {
    setDamagePhotos(photos =>
      photos.map(photo =>
        photo.id === id 
          ? { ...photo, [field]: value }
          : photo
      )
    );
  };

  const removePhoto = (id: string) => {
    setDamagePhotos(photos => photos.filter(photo => photo.id !== id));
  };

  const savePhotos = () => {
    console.log('Saving damage photos:', damagePhotos);
    // Here you would save to your backend/database
    navigate('/account?tab=damage');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/account?tab=damage')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Post Damage Documentation
            </Button>
            <h1 className="text-3xl font-bold text-red-600 mb-2 flex items-center">
              <AlertTriangle className="h-8 w-8 mr-3" />
              Upload Damage Photos
            </h1>
            <p className="text-gray-600">Document property damage with photos for insurance claims and repairs</p>
          </div>

          {/* Default Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Default Settings</CardTitle>
              <CardDescription>
                Set default property for all damage photos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Default Property</Label>
                <PropertySelector
                  value={defaultPropertyId}
                  onChange={setDefaultPropertyId}
                  placeholder="Select property where damage occurred"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-6 w-6 mr-2 text-red-600" />
                  Photo Upload
                </CardTitle>
                <CardDescription>
                  Upload photos showing property damage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="damage-photos">Select Damage Photos</Label>
                  <Input
                    id="damage-photos"
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
                      {selectedFiles.length} photo(s) selected
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
                      onClick={processPhotos}
                      className="w-full mt-4 bg-red-600 hover:bg-red-700"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Process Damage Photos
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Photo Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-6 w-6 mr-2 text-red-600" />
                  Damage Details
                </CardTitle>
                <CardDescription>
                  Add damage information to your photos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {damagePhotos.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Upload photos to add damage details here
                  </p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {damagePhotos.map((photo) => (
                      <div key={photo.id} className="border rounded-lg p-4 bg-white">
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <img
                              src={URL.createObjectURL(photo.file)}
                              alt={photo.name}
                              className="w-16 h-16 object-cover rounded mr-3"
                            />
                            <div className="flex-1">
                              <Input
                                value={photo.name}
                                onChange={(e) => updatePhotoValue(photo.id, 'name', e.target.value)}
                                placeholder="Damage photo title"
                                className="text-sm"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                              <Label className="text-xs">Damage Type</Label>
                              <Select 
                                value={photo.damageType} 
                                onValueChange={(value) => updatePhotoValue(photo.id, 'damageType', value)}
                              >
                                <SelectTrigger className="text-sm">
                                  <SelectValue placeholder="Select damage type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {damageTypes.map((type) => (
                                    <SelectItem key={type} value={type}>{type}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-xs">Severity</Label>
                              <Select 
                                value={photo.severity} 
                                onValueChange={(value) => updatePhotoValue(photo.id, 'severity', value)}
                              >
                                <SelectTrigger className="text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="minor">Minor</SelectItem>
                                  <SelectItem value="moderate">Moderate</SelectItem>
                                  <SelectItem value="severe">Severe</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                              <Label className="text-xs">Location</Label>
                              <Input
                                value={photo.location}
                                onChange={(e) => updatePhotoValue(photo.id, 'location', e.target.value)}
                                placeholder="Room/area"
                                className="text-sm"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-xs">Date Occurred</Label>
                              <Input
                                type="date"
                                value={photo.dateOccurred}
                                onChange={(e) => updatePhotoValue(photo.id, 'dateOccurred', e.target.value)}
                                className="text-sm"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-xs">Description</Label>
                            <Textarea
                              value={photo.description}
                              onChange={(e) => updatePhotoValue(photo.id, 'description', e.target.value)}
                              placeholder="Describe the damage, cause, and any relevant details"
                              rows={2}
                              className="text-sm"
                            />
                          </div>
                          
                          <div className="flex justify-end">
                            <Button
                              onClick={() => removePhoto(photo.id)}
                              variant="destructive"
                              size="sm"
                              className="text-xs"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {damagePhotos.length > 0 && (
                  <Button 
                    onClick={savePhotos}
                    className="w-full mt-4 bg-red-600 hover:bg-red-700"
                  >
                    Save All Damage Photos
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

export default DamagePhotoUpload;
