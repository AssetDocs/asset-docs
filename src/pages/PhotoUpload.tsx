
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Camera, Upload, Loader2, X, Image as ImageIcon, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useProperties } from '@/hooks/useProperties';
import { usePropertyFiles } from '@/hooks/usePropertyFiles';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';

interface Folder {
  id: string;
  folder_name: string;
  gradient_color: string;
}

const PhotoUpload: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { properties, isLoading: propertiesLoading } = useProperties();
  const { subscriptionTier } = useSubscription();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const { uploadFiles, isUploading } = usePropertyFiles(selectedPropertyId || null, 'photo');

  React.useEffect(() => {
    console.log('PhotoUpload mounted, user:', user?.id, 'properties:', properties.length, 'propertiesLoading:', propertiesLoading);
  }, [user, properties, propertiesLoading]);

  React.useEffect(() => {
    if (user) {
      fetchFolders();
    }
  }, [user]);

  const fetchFolders = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
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

  // Show loading state only while properties are initially loading
  if (propertiesLoading) {
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
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles([...selectedFiles, ...files]);
      
      // Create previews
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews([...previews, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedPropertyId) {
      toast({
        title: "Select a property",
        description: "Please select a property before uploading photos.",
        variant: "destructive",
      });
      return;
    }

    if (selectedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one photo to upload.",
        variant: "destructive",
      });
      return;
    }

    const uploadedFiles = await uploadFiles(selectedFiles);
    
    // Update folder_id for uploaded files if folder is selected
    if (selectedFolderId && uploadedFiles.length > 0) {
      try {
        const updates = uploadedFiles.map(file => 
          supabase
            .from('property_files')
            .update({ folder_id: selectedFolderId })
            .eq('id', file.id)
        );
        await Promise.all(updates);
      } catch (error) {
        console.error('Error assigning folder:', error);
      }
    }
    
    // Clear selections
    setSelectedFiles([]);
    previews.forEach(preview => URL.revokeObjectURL(preview));
    setPreviews([]);
    
    // Navigate to photo gallery
    navigate('/account/photos');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
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
            <p className="text-gray-600">Upload photos to your property gallery</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="h-6 w-6 mr-2 text-brand-blue" />
                Property Photo Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* No Properties Message */}
              {properties.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-yellow-800">No Properties Found</h3>
                      <p className="mt-1 text-sm text-yellow-700">
                        You need to create a property before uploading photos. Photos are organized by property to keep your documentation organized.
                      </p>
                      <div className="mt-3">
                        <Button
                          onClick={() => navigate('/account/properties/new')}
                          size="sm"
                          className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                          <Home className="h-4 w-4 mr-2" />
                          Create Your First Property
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Property Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Property *</label>
                <Select 
                  value={selectedPropertyId} 
                  onValueChange={setSelectedPropertyId}
                  disabled={properties.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={properties.length === 0 ? "Create a property first..." : "Choose a property..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name} - {property.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {properties.length > 0 && !selectedPropertyId && (
                  <p className="text-xs text-gray-500">Please select a property to enable photo upload</p>
                )}
              </div>

              {/* Folder Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Folder (Optional)</label>
                <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                  <SelectTrigger>
                    <SelectValue placeholder="No folder - keep in main gallery" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No folder</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded bg-gradient-to-r ${folder.gradient_color}`} />
                          {folder.folder_name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                  onClick={() => cameraInputRef.current?.click()}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-brand-blue/30 hover:border-brand-blue/50 hover:bg-brand-blue/5"
                  disabled={!selectedPropertyId}
                >
                  <Camera className="h-6 w-6 text-brand-blue" />
                  <div className="text-center">
                    <div className="font-medium text-sm">Take Photo</div>
                    <div className="text-xs text-gray-500">Use camera</div>
                  </div>
                </Button>

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-brand-blue/30 hover:border-brand-blue/50 hover:bg-brand-blue/5"
                  disabled={!selectedPropertyId}
                >
                  <ImageIcon className="h-6 w-6 text-brand-blue" />
                  <div className="text-center">
                    <div className="font-medium text-sm">Choose Photos</div>
                    <div className="text-xs text-gray-500">From gallery</div>
                  </div>
                </Button>
              </div>

              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="space-y-4">
                  <p className="text-sm font-medium">
                    {selectedFiles.length} photo{selectedFiles.length !== 1 ? 's' : ''} selected
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={previews[index]}
                          alt={file.name}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <p className="text-xs truncate mt-1">{file.name}</p>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={handleUpload}
                    disabled={isUploading || !selectedPropertyId}
                    className="w-full bg-brand-orange hover:bg-brand-orange/90"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photos to Gallery
                      </>
                    )}
                  </Button>
                </div>
              )}

              {!selectedPropertyId && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Please select a property to start uploading photos
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PhotoUpload;
