
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
import { ArrowLeft, AlertTriangle, Video, Upload } from 'lucide-react';

interface DamageVideo {
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

const DamageVideoUpload: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [damageVideos, setDamageVideos] = useState<DamageVideo[]>([]);
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

  const processVideos = () => {
    const newVideos: DamageVideo[] = selectedFiles.map(file => ({
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

    setDamageVideos([...damageVideos, ...newVideos]);
    setSelectedFiles([]);
  };

  const updateVideoValue = (id: string, field: string, value: string) => {
    setDamageVideos(videos =>
      videos.map(video =>
        video.id === id 
          ? { ...video, [field]: value }
          : video
      )
    );
  };

  const removeVideo = (id: string) => {
    setDamageVideos(videos => videos.filter(video => video.id !== id));
  };

  const saveVideos = () => {
    console.log('Saving damage videos:', damageVideos);
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
              Upload Damage Videos
            </h1>
            <p className="text-gray-600">Document property damage with videos for comprehensive insurance claims</p>
          </div>

          {/* Default Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Default Settings</CardTitle>
              <CardDescription>
                Set default property for all damage videos
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
                  <Video className="h-6 w-6 mr-2 text-red-600" />
                  Video Upload
                </CardTitle>
                <CardDescription>
                  Upload videos showing property damage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="damage-videos">Select Damage Videos</Label>
                  <Input
                    id="damage-videos"
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="mt-2"
                  />
                </div>

                {selectedFiles.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      {selectedFiles.length} video file(s) selected
                    </p>
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center p-2 bg-gray-100 rounded border">
                          <Video className="h-4 w-4 mr-2 text-red-600" />
                          <span className="text-sm truncate">{file.name}</span>
                          <span className="text-xs text-gray-500 ml-auto">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      onClick={processVideos}
                      className="w-full mt-4 bg-red-600 hover:bg-red-700"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Process Damage Videos
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Video Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-6 w-6 mr-2 text-red-600" />
                  Damage Details
                </CardTitle>
                <CardDescription>
                  Add damage information to your videos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {damageVideos.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Upload videos to add damage details here
                  </p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {damageVideos.map((video) => (
                      <div key={video.id} className="border rounded-lg p-4 bg-white">
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <Video className="h-12 w-12 mr-3 text-red-600 bg-red-50 rounded p-2" />
                            <div className="flex-1">
                              <Input
                                value={video.name}
                                onChange={(e) => updateVideoValue(video.id, 'name', e.target.value)}
                                placeholder="Damage video title"
                                className="text-sm"
                              />
                              <p className="text-xs text-gray-500 mt-1">{video.file.name}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                              <Label className="text-xs">Damage Type</Label>
                              <Select 
                                value={video.damageType} 
                                onValueChange={(value) => updateVideoValue(video.id, 'damageType', value)}
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
                                value={video.severity} 
                                onValueChange={(value) => updateVideoValue(video.id, 'severity', value)}
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
                                value={video.location}
                                onChange={(e) => updateVideoValue(video.id, 'location', e.target.value)}
                                placeholder="Room/area"
                                className="text-sm"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-xs">Date Occurred</Label>
                              <Input
                                type="date"
                                value={video.dateOccurred}
                                onChange={(e) => updateVideoValue(video.id, 'dateOccurred', e.target.value)}
                                className="text-sm"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-xs">Description</Label>
                            <Textarea
                              value={video.description}
                              onChange={(e) => updateVideoValue(video.id, 'description', e.target.value)}
                              placeholder="Describe the damage, cause, and any relevant details"
                              rows={2}
                              className="text-sm"
                            />
                          </div>
                          
                          <div className="flex justify-end">
                            <Button
                              onClick={() => removeVideo(video.id)}
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
                
                {damageVideos.length > 0 && (
                  <Button 
                    onClick={saveVideos}
                    className="w-full mt-4 bg-red-600 hover:bg-red-700"
                  >
                    Save All Damage Videos
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

export default DamageVideoUpload;
