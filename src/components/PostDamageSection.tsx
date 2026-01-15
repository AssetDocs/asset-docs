import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PropertySelector from '@/components/PropertySelector';
import ManualDamageEntry from '@/components/ManualDamageEntry';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { PropertyService, PropertyFile } from '@/services/PropertyService';
import { StorageService } from '@/services/StorageService';
import { 
  AlertTriangle, 
  Camera, 
  Video, 
  Upload, 
  Eye, 
  Plus,
  Calendar,
  MapPin,
  FileText,
  Edit,
  Trash2,
  Loader2,
  X
} from 'lucide-react';

const DAMAGE_TYPES = [
  'Water Damage',
  'Fire Damage',
  'Storm Damage',
  'Theft/Vandalism',
  'Structural Damage',
  'Mold/Mildew',
  'Electrical Damage',
  'Plumbing Issues',
  'Other'
];

const PostDamageSection: React.FC = () => {
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<PropertyFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // File upload states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadPropertyId, setUploadPropertyId] = useState('');
  const [damageType, setDamageType] = useState('');
  const [uploadMode, setUploadMode] = useState<'photo' | 'video'>('photo');
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  // Real data from database
  const [damagePhotos, setDamagePhotos] = useState<PropertyFile[]>([]);
  const [damageVideos, setDamageVideos] = useState<PropertyFile[]>([]);

  // Fetch files when property is selected
  useEffect(() => {
    if (selectedPropertyId && user) {
      fetchPropertyFiles();
    } else {
      setDamagePhotos([]);
      setDamageVideos([]);
    }
  }, [selectedPropertyId, user]);

  const fetchPropertyFiles = async () => {
    if (!selectedPropertyId) return;
    
    setLoading(true);
    try {
      const photos = await PropertyService.getPropertyFiles(selectedPropertyId, 'photo');
      const videos = await PropertyService.getPropertyFiles(selectedPropertyId, 'video');
      setDamagePhotos(photos);
      setDamageVideos(videos);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast({
        title: "Error",
        description: "Failed to load damage documentation.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeleteFile = (file: PropertyFile) => {
    setFileToDelete(file);
    setShowDeleteDialog(true);
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    
    try {
      const success = await PropertyService.deletePropertyFile(
        fileToDelete.id, 
        fileToDelete.file_path, 
        fileToDelete.bucket_name
      );
      
      if (success) {
        if (fileToDelete.file_type === 'photo') {
          setDamagePhotos(photos => photos.filter(p => p.id !== fileToDelete.id));
        } else {
          setDamageVideos(videos => videos.filter(v => v.id !== fileToDelete.id));
        }
        toast({
          title: "File Deleted",
          description: "Damage documentation has been permanently removed.",
        });
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file. Please try again.",
        variant: "destructive",
      });
    }
    
    setShowDeleteDialog(false);
    setFileToDelete(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, mode: 'photo' | 'video') => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
      setUploadMode(mode);
    }
    // Reset input
    if (e.target) {
      e.target.value = '';
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload files.",
        variant: "destructive",
      });
      return;
    }

    if (!uploadPropertyId) {
      toast({
        title: "Property Required",
        description: "Please select a property for this damage documentation.",
        variant: "destructive",
      });
      return;
    }

    if (selectedFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      const bucketName = uploadMode === 'photo' ? 'photos' : 'videos';
      
      for (const file of selectedFiles) {
        // Upload to storage
        const uploadResult = await StorageService.uploadFile(file, bucketName, user.id);
        const filePath = typeof uploadResult === 'string' ? uploadResult : uploadResult.path;
        const fileUrl = uploadResult.url;

        // Save to database
        await PropertyService.addPropertyFile({
          property_id: uploadPropertyId,
          file_name: damageType ? `${damageType} - ${file.name}` : file.name,
          file_path: filePath,
          file_url: fileUrl,
          file_type: uploadMode,
          file_size: file.size,
          bucket_name: bucketName,
        });
      }

      toast({
        title: "Upload Complete",
        description: `${selectedFiles.length} file(s) uploaded successfully.`,
      });

      // Reset form
      setSelectedFiles([]);
      setDamageType('');
      
      // Refresh files if viewing the same property
      if (uploadPropertyId === selectedPropertyId) {
        fetchPropertyFiles();
      }
      
      // Update the main property selector to show the uploaded property
      if (!selectedPropertyId) {
        setSelectedPropertyId(uploadPropertyId);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const generateDamageReport = () => {
    if (!selectedPropertyId) {
      toast({
        title: "Property Required",
        description: "Please select a property before generating a damage report.",
        variant: "destructive",
      });
      return;
    }

    try {
      const pdf = new jsPDF();
      
      // Header
      pdf.setFontSize(20);
      pdf.text('Property Damage Report', 20, 20);
      
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
      pdf.text(`Property ID: ${selectedPropertyId}`, 20, 40);
      
      let yPosition = 60;
      
      // Damage Photos Section
      if (damagePhotos.length > 0) {
        pdf.setFontSize(16);
        pdf.text('Damage Photos', 20, yPosition);
        yPosition += 10;
        
        damagePhotos.forEach((photo, index) => {
          pdf.setFontSize(10);
          pdf.text(`${index + 1}. ${photo.file_name}`, 30, yPosition);
          yPosition += 5;
          pdf.text(`   Date: ${formatDate(photo.created_at)}`, 30, yPosition);
          yPosition += 10;
          
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }
        });
      }
      
      // Damage Videos Section
      if (damageVideos.length > 0) {
        pdf.setFontSize(16);
        pdf.text('Damage Videos', 20, yPosition);
        yPosition += 10;
        
        damageVideos.forEach((video, index) => {
          pdf.setFontSize(10);
          pdf.text(`${index + 1}. ${video.file_name}`, 30, yPosition);
          yPosition += 5;
          pdf.text(`   Date: ${formatDate(video.created_at)}`, 30, yPosition);
          yPosition += 10;
          
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = 20;
          }
        });
      }
      
      // Summary
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text('Summary', 20, 20);
      pdf.setFontSize(10);
      pdf.text(`Total Damage Photos: ${damagePhotos.length}`, 30, 35);
      pdf.text(`Total Damage Videos: ${damageVideos.length}`, 30, 45);
      pdf.text(`Report Generated: ${new Date().toLocaleString()}`, 30, 55);
      
      pdf.save(`Damage_Report_${selectedPropertyId}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Report Generated",
        description: "Damage report has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate damage report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <AlertTriangle className="h-6 w-6 mr-2 text-red-600" />
          Post Damage Documentation
        </CardTitle>
        <CardDescription>
          Document property damage with photos, videos, and manual entries for insurance claims and repairs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Upload Section */}
          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Upload className="h-5 w-5 mr-2 text-red-600" />
                Upload Damage Documentation
              </CardTitle>
              <CardDescription>
                Upload photos or videos documenting property damage. You can select multiple files at once.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Property Selection for Upload */}
              <div className="space-y-2">
                <Label>Select Property *</Label>
                <PropertySelector
                  value={uploadPropertyId}
                  onChange={setUploadPropertyId}
                  placeholder="Select property for damage documentation"
                />
              </div>

              {/* Damage Type */}
              <div className="space-y-2">
                <Label>Damage Type</Label>
                <Select value={damageType} onValueChange={setDamageType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select damage type (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAMAGE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileSelect(e, 'photo')}
                    className="hidden"
                  />
                  <Button 
                    onClick={() => photoInputRef.current?.click()}
                    className="w-full h-16 bg-red-600 hover:bg-red-700"
                    disabled={uploading}
                  >
                    <div className="flex flex-col items-center">
                      <Camera className="h-6 w-6 mb-1" />
                      <span>Select Photos</span>
                    </div>
                  </Button>
                </div>
                <div>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={(e) => handleFileSelect(e, 'video')}
                    className="hidden"
                  />
                  <Button 
                    onClick={() => videoInputRef.current?.click()}
                    className="w-full h-16 bg-red-600 hover:bg-red-700"
                    disabled={uploading}
                  >
                    <div className="flex flex-col items-center">
                      <Video className="h-6 w-6 mb-1" />
                      <span>Select Videos</span>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Files ({selectedFiles.length})</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative bg-gray-100 rounded-lg p-2 text-xs">
                        <button
                          onClick={() => removeSelectedFile(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <p className="truncate">{file.name}</p>
                        <p className="text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ))}
                  </div>
                  <Button 
                    onClick={handleUpload}
                    className="w-full bg-brand-green hover:bg-brand-green/90"
                    disabled={uploading || !uploadPropertyId}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload {selectedFiles.length} File(s)
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* View Existing Documentation */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Eye className="h-5 w-5 mr-2 text-blue-600" />
                View Existing Documentation
              </CardTitle>
              <CardDescription>
                Select a property to view and manage existing damage documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PropertySelector
                value={selectedPropertyId}
                onChange={setSelectedPropertyId}
                placeholder="Select property to view damage documentation"
              />
              {selectedPropertyId && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Property selected - viewing damage documentation
                </p>
              )}
            </CardContent>
          </Card>

          {/* Damage Documentation Tabs */}
          {selectedPropertyId && (
            <Tabs defaultValue="photos" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto gap-1">
                <TabsTrigger value="photos" className="flex items-center text-xs md:text-sm px-2 py-2">
                  <Camera className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">Photos ({damagePhotos.length})</span>
                </TabsTrigger>
                <TabsTrigger value="videos" className="flex items-center text-xs md:text-sm px-2 py-2">
                  <Video className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">Videos ({damageVideos.length})</span>
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center text-xs md:text-sm px-2 py-2">
                  <Edit className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">Manual</span>
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex items-center text-xs md:text-sm px-2 py-2">
                  <FileText className="h-3 w-3 md:h-4 md:w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">Reports</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="photos" className="mt-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : damagePhotos.length === 0 ? (
                  <div className="text-center py-8">
                    <Camera className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No damage photos yet</h3>
                    <p className="text-gray-500 mb-4">Start documenting property damage by uploading photos above</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">Damage photos for this property</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {damagePhotos.map((photo) => (
                        <Card key={photo.id} className="overflow-hidden relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleDeleteFile(photo)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="aspect-video bg-gray-200 flex items-center justify-center overflow-hidden">
                            {photo.file_url ? (
                              <img 
                                src={photo.file_url} 
                                alt={photo.file_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Camera className="h-8 w-8 text-gray-400" />
                            )}
                          </div>
                          <CardContent className="p-3">
                            <h4 className="font-medium text-sm mb-2 truncate">{photo.file_name}</h4>
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(photo.created_at)}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="videos" className="mt-4">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : damageVideos.length === 0 ? (
                  <div className="text-center py-8">
                    <Video className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No damage videos yet</h3>
                    <p className="text-gray-500 mb-4">Create video walkthroughs of property damage using the upload section above</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">Damage videos for this property</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {damageVideos.map((video) => (
                        <Card key={video.id} className="overflow-hidden relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleDeleteFile(video)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="aspect-video bg-gray-200 flex items-center justify-center">
                            <Video className="h-8 w-8 text-gray-400" />
                          </div>
                          <CardContent className="p-3">
                            <h4 className="font-medium text-sm mb-2 truncate">{video.file_name}</h4>
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(video.created_at)}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="manual" className="mt-4">
                <ManualDamageEntry />
              </TabsContent>

              <TabsContent value="reports" className="mt-4">
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Damage Reports</h3>
                  <p className="text-gray-500 mb-4">Generate comprehensive damage reports for insurance claims</p>
                  <Button 
                    onClick={() => {
                      const isOnSampleDashboard = window.location.pathname === '/sample-dashboard';
                      if (isOnSampleDashboard) {
                        alert('AssetSafe.net says\n\nDemo: This would generate comprehensive damage reports for insurance claims with photos, videos, and details.');
                        return;
                      }
                      generateDamageReport();
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Damage Report
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {!selectedPropertyId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                Select a property above to view existing damage documentation.
              </p>
            </div>
          )}
        </div>
      </CardContent>
      
      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setFileToDelete(null);
        }}
        onConfirm={confirmDeleteFile}
        title="Delete Damage Documentation"
        description="Are you sure you want to permanently delete this file? This cannot be undone."
      />
    </Card>
  );
};

export default PostDamageSection;
