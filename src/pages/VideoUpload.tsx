import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertySelector from '@/components/PropertySelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Video, Upload, Loader2 } from 'lucide-react';
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
  const [defaultPropertyId, setDefaultPropertyId] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { uploadFiles, isUploading } = usePropertyFiles(defaultPropertyId, 'video');

  useEffect(() => {
    console.log('VideoUpload mounted, user:', user?.id);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (user) {
      fetchFolders();
    }
  }, [user]);

  const fetchFolders = async () => {
    try {
      const { data, error } = await supabase
        .from('video_folders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
        </div>
        <Footer />
      </div>
    );
  }

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

    const uploadedFiles = await uploadFiles(files);

    // If a folder is selected, update the folder_id for uploaded files
    if (selectedFolderId && uploadedFiles.length > 0) {
      try {
        const { error } = await supabase
          .from('property_files')
          .update({ folder_id: selectedFolderId })
          .in('id', uploadedFiles.map(f => f.id));

        if (error) throw error;
      } catch (error) {
        console.error('Error updating folder:', error);
      }
    }

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
                      <SelectValue placeholder="Select a folder" />
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
              <div>
                <Label htmlFor="videos">Select Videos</Label>
                <Input
                  ref={fileInputRef}
                  id="videos"
                  type="file"
                  multiple
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="mt-2"
                  disabled={!defaultPropertyId || isUploading}
                />
                {!defaultPropertyId && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Please select a property first
                  </p>
                )}
              </div>

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
