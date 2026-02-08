import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, Camera, Video, Plus, X, Paperclip, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';
import PropertySelector from '@/components/PropertySelector';

interface MediaFolder {
  id: string;
  folder_name: string;
}

interface ItemEntry {
  id: string;
  name: string;
  value: string;
}

interface AttachmentEntry {
  id: string;
  file?: File;
  label: string;
  existingUrl?: string;
  existingName?: string;
}

const NO_FOLDER_VALUE = '__no_folder__';

const MediaEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const mediaType = searchParams.get('type') as 'photo' | 'video' || 'photo';
  const { user } = useAuth();
  const { toast } = useToast();
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  
  const [formData, setFormData] = useState({
    fileName: '',
    description: '',
    tags: '',
    propertyId: '',
    folderId: ''
  });

  // Item values state
  const [items, setItems] = useState<ItemEntry[]>([{ id: crypto.randomUUID(), name: '', value: '' }]);
  
  // Attachments state
  const [attachments, setAttachments] = useState<AttachmentEntry[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id || !id) return;
      
      try {
        // Load media file
        const { data: file, error: fileError } = await supabase
          .from('property_files')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (fileError || !file) {
          toast({
            title: 'File not found',
            description: 'The requested file could not be found.',
            variant: 'destructive',
          });
          navigate('/account/media');
          return;
        }

        setFormData({
          fileName: file.file_name || '',
          description: '',
          tags: '',
          propertyId: file.property_id || '',
          folderId: file.folder_id || ''
        });

        // Load folders from unified photo_folders table (used for all media)
        const { data: foldersData } = await supabase
          .from('photo_folders')
          .select('id, folder_name')
          .eq('user_id', user.id)
          .order('folder_name');

        setFolders(foldersData || []);
      } catch (error) {
        console.error('Error loading file:', error);
        toast({
          title: 'Error',
          description: 'Failed to load file details.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, id, mediaType, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !id) return;

    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('property_files')
        .update({
          file_name: formData.fileName,
          property_id: formData.propertyId || null,
          folder_id: formData.folderId || null
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'File updated!',
        description: 'Your file has been updated successfully.',
      });

      navigate('/account/media');
    } catch (error) {
      console.error('Error updating file:', error);
      toast({
        title: 'Failed to update file',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Item entries handlers
  const handleAddItem = () => {
    setItems(prev => [...prev, { id: crypto.randomUUID(), name: '', value: '' }]);
  };

  const handleRemoveItem = (itemId: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const handleItemChange = (itemId: string, field: 'name' | 'value', value: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
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
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (attId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attId));
  };

  const handleAttachmentLabelChange = (attId: string, label: string) => {
    setAttachments(prev => prev.map(att => 
      att.id === attId ? { ...att, label } : att
    ));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const Icon = mediaType === 'video' ? Video : Camera;
  const typeLabel = mediaType === 'video' ? 'Video' : 'Photo';

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <DashboardBreadcrumb />
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate('/account/media')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Icon className="h-6 w-6 mr-2 text-brand-blue" />
                Edit {typeLabel}
              </h1>
              <p className="text-sm text-gray-500">Update {typeLabel.toLowerCase()} details</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>{typeLabel} Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fileName">File Name</Label>
                  <Input
                    id="fileName"
                    value={formData.fileName}
                    onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
                    placeholder="Enter file name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Property</Label>
                  <PropertySelector
                    value={formData.propertyId}
                    onChange={(propId) => setFormData({ ...formData, propertyId: propId || '' })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="folder">Folder (Optional)</Label>
                  <Select
                    value={formData.folderId || NO_FOLDER_VALUE}
                    onValueChange={(value) => setFormData({ 
                      ...formData, 
                      folderId: value === NO_FOLDER_VALUE ? '' : value 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select folder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_FOLDER_VALUE}>No Folder</SelectItem>
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.folder_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    {items.map((item) => (
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
                            <p className="text-sm font-medium truncate">{att.file?.name || att.existingName}</p>
                            {att.file && (
                              <p className="text-xs text-muted-foreground">{formatFileSize(att.file.size)}</p>
                            )}
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
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add a description..."
                    rows={3}
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Add tags (comma separated)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate multiple tags with commas
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4 mt-6">
              <Button type="button" variant="outline" onClick={() => navigate('/account/media')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MediaEdit;
