
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertySelector from '@/components/PropertySelector';
import ItemTypeSelector from '@/components/ItemTypeSelector';
import PropertyUpgradeSelector from '@/components/PropertyUpgradeSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Video, Upload, MapPin } from 'lucide-react';

interface UploadedVideo {
  id: string;
  file: File;
  name: string;
  description: string;
  location: string;
  category: string;
  itemType: string;
  propertyUpgrade?: string;
  propertyId: string;
}

const VideoUpload: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>([]);
  const [defaultPropertyId, setDefaultPropertyId] = useState('');
  const [defaultItemType, setDefaultItemType] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles([...selectedFiles, ...files]);
    }
  };

  const processVideos = () => {
    const newVideos: UploadedVideo[] = selectedFiles.map(file => ({
      id: Date.now().toString() + Math.random().toString(),
      file,
      name: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
      description: '',
      location: '',
      category: 'General',
      itemType: defaultItemType || 'Other',
      propertyId: defaultPropertyId
    }));

    setUploadedVideos([...uploadedVideos, ...newVideos]);
    setSelectedFiles([]);
  };

  const updateVideoValue = (id: string, field: string, value: string) => {
    setUploadedVideos(videos =>
      videos.map(video =>
        video.id === id 
          ? { ...video, [field]: value }
          : video
      )
    );
  };

  const removeVideo = (id: string) => {
    setUploadedVideos(videos => videos.filter(video => video.id !== id));
  };

  const saveVideos = () => {
    console.log('Saving videos:', uploadedVideos);
    // Here you would save to your backend/database
    navigate('/account/videos');
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
            <h1 className="text-3xl font-bold text-brand-blue mb-2">Upload Videos</h1>
            <p className="text-gray-600">Upload videos of your property and belongings for documentation</p>
          </div>

          {/* Default Settings */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Default Settings</CardTitle>
              <CardDescription>
                Set default values for all video uploads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Video className="h-6 w-6 mr-2 text-brand-blue" />
                  Video Upload
                </CardTitle>
                <CardDescription>
                  Select video files to document your property
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="videos">Select Videos</Label>
                  <Input
                    id="videos"
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
                          <Video className="h-4 w-4 mr-2 text-brand-blue" />
                          <span className="text-sm truncate">{file.name}</span>
                          <span className="text-xs text-gray-500 ml-auto">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      onClick={processVideos}
                      className="w-full mt-4 bg-brand-orange hover:bg-brand-orange/90"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Process Videos
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Video Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Video className="h-6 w-6 mr-2 text-brand-blue" />
                  Video Details
                </CardTitle>
                <CardDescription>
                  Add details and organize your videos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {uploadedVideos.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Upload videos to add details here
                  </p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {uploadedVideos.map((video) => (
                      <div key={video.id} className="border rounded-lg p-4 bg-white">
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <Video className="h-5 w-5 mr-2 text-brand-blue" />
                            <span className="font-medium text-sm">{video.file.name}</span>
                          </div>
                          
                          <Input
                            value={video.name}
                            onChange={(e) => updateVideoValue(video.id, 'name', e.target.value)}
                            placeholder="Video title"
                            className="text-sm"
                          />
                          
                          <div className="space-y-2">
                            <PropertySelector
                              value={video.propertyId}
                              onChange={(value) => updateVideoValue(video.id, 'propertyId', value)}
                              placeholder="Select property"
                            />
                            
                            <ItemTypeSelector
                              value={video.itemType}
                              onChange={(value) => updateVideoValue(video.id, 'itemType', value)}
                              placeholder="Select item type"
                            />
                            
                            {video.itemType === 'Property Upgrades' && (
                              <PropertyUpgradeSelector
                                value={video.propertyUpgrade || ''}
                                onChange={(value) => updateVideoValue(video.id, 'propertyUpgrade', value)}
                                placeholder="Select upgrade type"
                              />
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <Input
                              value={video.location}
                              onChange={(e) => updateVideoValue(video.id, 'location', e.target.value)}
                              placeholder="Location (e.g., Living Room, Kitchen)"
                              className="text-sm flex-1"
                            />
                          </div>
                          
                          <Textarea
                            value={video.description}
                            onChange={(e) => updateVideoValue(video.id, 'description', e.target.value)}
                            placeholder="Detailed video description"
                            rows={3}
                            className="text-sm"
                          />
                          
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
                
                {uploadedVideos.length > 0 && (
                  <Button 
                    onClick={saveVideos}
                    className="w-full mt-4 bg-brand-blue hover:bg-brand-lightBlue"
                  >
                    Save All Videos
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

export default VideoUpload;
