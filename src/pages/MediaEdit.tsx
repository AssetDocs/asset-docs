import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, Camera, Video } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';
import PropertySelector from '@/components/PropertySelector';

interface MediaFolder {
  id: string;
  folder_name: string;
}

const NO_FOLDER_VALUE = '__no_folder__';

const MediaEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const mediaType = searchParams.get('type') as 'photo' | 'video' || 'photo';
  const { user } = useAuth();
  const { toast } = useToast();
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

        // Load folders based on media type
        const folderTable = mediaType === 'video' ? 'video_folders' : 'photo_folders';
        const { data: foldersData } = await supabase
          .from(folderTable)
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
              <CardContent className="space-y-4">
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
                    onChange={(id) => setFormData({ ...formData, propertyId: id || '' })}
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
