import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Camera, Video, Upload, Image, Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';
import PropertySelector from '@/components/PropertySelector';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePropertyFiles } from '@/hooks/usePropertyFiles';
import { useToast } from '@/hooks/use-toast';

const CombinedMediaUpload: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const { uploadFiles, isUploading } = usePropertyFiles(selectedPropertyId || null, activeTab === 'photos' ? 'photo' : 'video');

  const handleBack = () => {
    navigate('/account/media');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const validTypes = activeTab === 'photos' 
        ? ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic']
        : ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/mov'];
      
      const validFiles = fileArray.filter(file => {
        const isValidType = validTypes.some(type => file.type.startsWith(type.split('/')[0]));
        if (!isValidType) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not a valid ${activeTab === 'photos' ? 'image' : 'video'} file`,
            variant: "destructive"
          });
        }
        return isValidType;
      });
      
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedPropertyId) {
      toast({
        title: "Select a property",
        description: "Please select a property before uploading",
        variant: "destructive"
      });
      return;
    }

    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select files to upload",
        variant: "destructive"
      });
      return;
    }

    try {
      await uploadFiles(selectedFiles);
      toast({
        title: "Success",
        description: `${selectedFiles.length} file(s) uploaded successfully`
      });
      setSelectedFiles([]);
      navigate('/account/media');
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive"
      });
    }
  };

  const getAcceptedTypes = () => {
    return activeTab === 'photos' 
      ? "image/jpeg,image/png,image/gif,image/webp,image/heic"
      : "video/mp4,video/quicktime,video/x-msvideo,video/webm";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <DashboardBreadcrumb />
          
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <Button variant="ghost" size="sm" onClick={handleBack} className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Upload Photos/Videos</h1>
                <p className="text-gray-600 mt-1">
                  Add photos or videos to document your property and belongings
                </p>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Media
              </CardTitle>
              <CardDescription>
                Select the type of media you want to upload
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Property Selector */}
              <div>
                <Label>Select Property</Label>
                <PropertySelector
                  value={selectedPropertyId}
                  onChange={setSelectedPropertyId}
                />
              </div>

              {/* Tab Selection */}
              <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'photos' | 'videos'); setSelectedFiles([]); }}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="photos" className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Photos
                  </TabsTrigger>
                  <TabsTrigger value="videos" className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Videos
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="photos" className="mt-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-brand-blue transition-colors">
                    <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">Drag and drop photos here, or click to browse</p>
                    <Input
                      type="file"
                      accept={getAcceptedTypes()}
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="photo-upload"
                    />
                    <Label htmlFor="photo-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" asChild>
                        <span>Browse Photos</span>
                      </Button>
                    </Label>
                  </div>
                </TabsContent>

                <TabsContent value="videos" className="mt-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-brand-blue transition-colors">
                    <Film className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">Drag and drop videos here, or click to browse</p>
                    <Input
                      type="file"
                      accept={getAcceptedTypes()}
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="video-upload"
                    />
                    <Label htmlFor="video-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" asChild>
                        <span>Browse Videos</span>
                      </Button>
                    </Label>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="space-y-3">
                  <Label>Selected Files ({selectedFiles.length})</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
                          {activeTab === 'photos' ? (
                            <Image className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          ) : (
                            <Film className="h-5 w-5 text-gray-500 flex-shrink-0" />
                          )}
                          <span className="text-sm truncate">{file.name}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Button */}
              <Button 
                onClick={handleUpload}
                disabled={isUploading || selectedFiles.length === 0 || !selectedPropertyId}
                className="w-full bg-brand-blue hover:bg-brand-lightBlue"
              >
                {isUploading ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Save {selectedFiles.length > 0 ? `${selectedFiles.length} File(s)` : ''}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CombinedMediaUpload;
