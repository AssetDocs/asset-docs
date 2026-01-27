import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertySelector from '@/components/PropertySelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Video, Upload, Loader2, Camera } from 'lucide-react';
import { usePropertyFiles } from '@/hooks/usePropertyFiles';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Folder {
  id: string;
  folder_name: string;
  gradient_color: string;
}

const VideoUpload: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [defaultPropertyId, setDefaultPropertyId] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [folders, setFolders] = useState<Folder[]>([]);
  
  const { uploadFiles, isUploading } = usePropertyFiles(defaultPropertyId, 'video');

  useEffect(() => {
    console.log('VideoUpload mounted, user:', user?.id);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchFolders();
    }
  }, [user]);

  const fetchFolders = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        // Photo folders are shared for both photo + video organization
        .from('photo_folders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };


  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && fileInputRef.current) {
      handleUpload(Array.from(e.target.files));
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async (files: File[]) => {
    if (!defaultPropertyId) {
      toast({
        title: 'Property Required',
        description: 'Please select a property before uploading videos.',
        variant: 'destructive',
      });
      return;
    }

    const uploadedFiles = await uploadFiles(files, selectedFolderId || undefined);

    if (uploadedFiles.length > 0) {
      toast({
        title: 'Success',
        description: `${uploadedFiles.length} video(s) uploaded successfully`,
      });
      navigate('/account/videos');
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
                    placeholder="Select property for videos"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Select Folder (Optional)</Label>
                  <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                    <SelectTrigger>
                      <SelectValue placeholder="No folder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No folder</SelectItem>
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2 ${folder.gradient_color}`} />
                            {folder.folder_name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Video className="h-6 w-6 mr-2 text-brand-blue" />
                Upload Videos
              </CardTitle>
              <CardDescription>
                Select video files to upload to your property
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Hidden file inputs */}
              <Input
                ref={fileInputRef}
                type="file"
                multiple
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <Input
                ref={cameraInputRef}
                type="file"
                accept="video/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Upload Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={() => cameraInputRef.current?.click()}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-brand-blue/30 hover:border-brand-blue/50 hover:bg-brand-blue/5"
                  disabled={!defaultPropertyId || isUploading}
                >
                  <Camera className="h-6 w-6 text-brand-blue" />
                  <div className="text-center">
                    <div className="font-medium text-sm">Record Video</div>
                    <div className="text-xs text-gray-500">Use camera</div>
                  </div>
                </Button>

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-brand-blue/30 hover:border-brand-blue/50 hover:bg-brand-blue/5"
                  disabled={!defaultPropertyId || isUploading}
                >
                  <Video className="h-6 w-6 text-brand-blue" />
                  <div className="text-center">
                    <div className="font-medium text-sm">Choose Videos</div>
                    <div className="text-xs text-gray-500">From gallery</div>
                  </div>
                </Button>
              </div>

              {!defaultPropertyId && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Please select a property first
                </p>
              )}

              {isUploading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Uploading videos...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default VideoUpload;
