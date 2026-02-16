import React, { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Camera, Video, Upload, Image, Film, Trash2, Loader2, Plus, Paperclip, X, Star } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useNavigate } from 'react-router-dom';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';
import PropertySelector from '@/components/PropertySelector';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePropertyFiles } from '@/hooks/usePropertyFiles';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useVerification } from '@/hooks/useVerification';

interface MediaFolder {
  id: string;
  folder_name: string;
  gradient_color: string;
}

interface ItemEntry {
  id: string;
  name: string;
  value: string;
}

interface AttachmentEntry {
  id: string;
  file: File;
  label: string;
}

const NO_FOLDER_VALUE = '__none__';

const CombinedMediaUpload: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { refreshVerification } = useVerification();
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [mediaName, setMediaName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isHighValue, setIsHighValue] = useState(false);
  
  // Item values state
  const [items, setItems] = useState<ItemEntry[]>([{ id: crypto.randomUUID(), name: '', value: '' }]);
  
  // Attachments state
  const [attachments, setAttachments] = useState<AttachmentEntry[]>([]);
  
  const { uploadFiles, isUploading } = usePropertyFiles(selectedPropertyId || null, activeTab === 'photos' ? 'photo' : 'video');

  // Fetch folders based on active tab
  useEffect(() => {
    if (user) {
      fetchFolders();
    }
  }, [user, activeTab]);

  const fetchFolders = async () => {
    if (!user) return;
    
    try {
      const tableName = activeTab === 'photos' ? 'photo_folders' : 'video_folders';
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

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
      
      // Set default name from first file if not already set
      if (!mediaName && validFiles.length > 0) {
        setMediaName(validFiles[0].name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      // Build metadata from form fields
      const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
      const filteredItems = items
        .filter(item => item.name.trim() !== '')
        .map(item => ({ name: item.name, value: item.value ? Number(item.value) : 0 }));

      // Upload files with folder_id and metadata
      const uploadedFiles = await uploadFiles(selectedFiles, selectedFolderId || undefined, {
        description: description || undefined,
        tags: parsedTags.length > 0 ? parsedTags : undefined,
        item_values: filteredItems.length > 0 ? filteredItems : undefined,
      });

      // If marked as high-value, update the uploaded files
      if (isHighValue && uploadedFiles && uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          await supabase
            .from('property_files')
            .update({ is_high_value: true })
            .eq('id', file.id);
        }
      }
      toast({
        title: "Success",
        description: `${selectedFiles.length} file(s) uploaded successfully`
      });
      refreshVerification();
      setMediaName('');
      setDescription('');
      setTags('');
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

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'photos' | 'videos');
    setSelectedFiles([]);
    setSelectedFolderId('');
    setMediaName('');
    setIsHighValue(false);
    setItems([{ id: crypto.randomUUID(), name: '', value: '' }]);
    setAttachments([]);
  };

  // Item entries handlers
  const handleAddItem = () => {
    setItems(prev => [...prev, { id: crypto.randomUUID(), name: '', value: '' }]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleItemChange = (id: string, field: 'name' | 'value', value: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Attachment handlers
  const handleAttachmentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newAttachments: AttachmentEntry[] = Array.from(files).map(file => ({
        id: crypto.randomUUID(),
        file,
        label: file.name.replace(/\.[^/.]+$/, '')
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
    }
    // Reset input
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleAttachmentLabelChange = (id: string, label: string) => {
    setAttachments(prev => prev.map(att => 
      att.id === id ? { ...att, label } : att
    ));
  };

  const getAcceptedTypes = () => {
    return activeTab === 'photos' 
      ? "image/jpeg,image/png,image/gif,image/webp,image/heic"
      : "video/mp4,video/quicktime,video/x-msvideo,video/webm";
  };

  const getSupportedFormats = () => {
    return activeTab === 'photos'
      ? "JPG, PNG, GIF, WEBP, HEIC"
      : "MP4, MOV, AVI, WEBM";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <DashboardBreadcrumb />
          
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Media
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold text-brand-orange mb-2">
              Upload Photos/Videos
            </h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Media Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Property Selection */}
              <div>
                <Label className="text-sm font-medium">Property</Label>
                <div className="mt-1">
                  <PropertySelector
                    value={selectedPropertyId}
                    onChange={setSelectedPropertyId}
                    placeholder="Select a property"
                  />
                </div>
              </div>

              {/* Tab Selection */}
              <Tabs value={activeTab} onValueChange={handleTabChange}>
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
              </Tabs>

              {/* Folder Selection */}
              <div>
                <Label className="text-sm font-medium">Folder</Label>
                <Select
                  value={selectedFolderId || NO_FOLDER_VALUE}
                  onValueChange={(v) => setSelectedFolderId(v === NO_FOLDER_VALUE ? '' : v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a folder" />
                  </SelectTrigger>
                  <SelectContent className="bg-background z-50">
                    <SelectItem value={NO_FOLDER_VALUE}>None</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded bg-gradient-to-r ${folder.gradient_color}`}></div>
                          {folder.folder_name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Media Name */}
              <div>
                <Label htmlFor="media-name" className="text-sm font-medium">
                  {activeTab === 'photos' ? 'Photo Name' : 'Video Name'}
                </Label>
                <Input
                  id="media-name"
                  value={mediaName}
                  onChange={(e) => setMediaName(e.target.value)}
                  placeholder={`Enter ${activeTab === 'photos' ? 'photo' : 'video'} name`}
                  className="mt-1"
                />
              </div>

              {/* File Upload */}
              <div>
                <Label className="text-sm font-medium">Upload File</Label>
                
                {/* Hidden file inputs */}
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept={getAcceptedTypes()}
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Input
                  ref={cameraInputRef}
                  type="file"
                  accept={activeTab === 'photos' ? 'image/*' : 'video/*'}
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {/* Upload Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <Button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-brand-blue/30 hover:border-brand-blue/50 hover:bg-brand-blue/5"
                  >
                    <Camera className="h-6 w-6 text-brand-blue" />
                    <div className="text-center">
                      <div className="font-medium text-sm">{activeTab === 'photos' ? 'Take Photo' : 'Record Video'}</div>
                      <div className="text-xs text-gray-500">Use camera</div>
                    </div>
                  </Button>

                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-brand-blue/30 hover:border-brand-blue/50 hover:bg-brand-blue/5"
                  >
                    {activeTab === 'photos' ? <Image className="h-6 w-6 text-brand-blue" /> : <Film className="h-6 w-6 text-brand-blue" />}
                    <div className="text-center">
                      <div className="font-medium text-sm">{activeTab === 'photos' ? 'Choose Photos' : 'Choose Videos'}</div>
                      <div className="text-xs text-gray-500">From gallery</div>
                    </div>
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground mt-2">
                  Supported formats: {getSupportedFormats()}
                </p>

                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {activeTab === 'photos' ? (
                      // Grid layout with thumbnails for photos
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-32 object-cover rounded-lg border"
                              onLoad={(e) => {
                                // Revoke URL after image loads to free memory
                                // We'll recreate it on each render, which is acceptable for a small number of files
                              }}
                            />
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => handleRemoveFile(index)}
                              disabled={isUploading}
                              className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <div className="mt-1">
                              <p className="text-xs font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      // List layout for videos
                      <div className="space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="border rounded-lg p-3 bg-muted/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Film className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium truncate max-w-[250px]">{file.name}</p>
                                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                              </div>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveFile(index)}
                              disabled={isUploading}
                              className="h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* High-Value Item Checkbox */}
              <div className="flex items-center space-x-3 p-3 border rounded-lg bg-amber-50/50 border-amber-200">
                <Checkbox
                  id="high-value"
                  checked={isHighValue}
                  onCheckedChange={(checked) => setIsHighValue(checked === true)}
                />
                <div className="flex-1">
                  <Label htmlFor="high-value" className="text-sm font-medium flex items-center gap-1.5 cursor-pointer">
                    <Star className="h-4 w-4 text-amber-500" />
                    Mark as high-value item
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Flag this upload for your High-Value Items collection
                  </p>
                </div>
              </div>

              {/* Item Values Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Item Values</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddItem}
                    className="h-8"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Add items pictured and their estimated values
                </p>
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={item.id} className="flex items-start gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Item name/type"
                          value={item.name}
                          onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                        />
                      </div>
                      <div className="w-32">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            type="number"
                            placeholder="Value"
                            value={item.value}
                            onChange={(e) => handleItemChange(item.id, 'value', e.target.value)}
                            className="pl-7"
                          />
                        </div>
                      </div>
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.id)}
                          className="h-10 w-10 shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Attachments Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Attachments</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => attachmentInputRef.current?.click()}
                    className="h-8"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Attachment
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Attach receipts, warranties, or other related documents
                </p>
                <input
                  ref={attachmentInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                  multiple
                  onChange={handleAttachmentSelect}
                  className="hidden"
                />
                {attachments.length > 0 ? (
                  <div className="space-y-2">
                    {attachments.map((att) => (
                      <div key={att.id} className="border rounded-lg p-3 bg-muted/50 flex items-center gap-3">
                        <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{att.file.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(att.file.size)}</p>
                        </div>
                        <Input
                          placeholder="Label (e.g., Receipt)"
                          value={att.label}
                          onChange={(e) => handleAttachmentLabelChange(att.id, e.target.value)}
                          className="w-40"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="h-8 w-8 shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div 
                    onClick={() => attachmentInputRef.current?.click()}
                    className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <Paperclip className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to attach receipts, warranties, etc.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supported: PDF, JPG, PNG, WEBP, DOC, DOCX
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                  rows={3}
                  className="mt-1"
                />
              </div>

              {/* Tags */}
              <div>
                <Label htmlFor="tags" className="text-sm font-medium">
                  Tags (comma separated)
                </Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. living room, furniture, 2024"
                  className="mt-1"
                />
              </div>

              {/* Save Button */}
              <Button 
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full bg-brand-blue hover:bg-brand-lightBlue"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
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
