import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Camera,
  Video,
  Plus,
  Search,
  SortAsc,
  SortDesc,
  Calendar,
  Type,
  Grid3X3,
  List,
  FolderOpen
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';
import CreateFolderModal from '@/components/CreateFolderModal';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import MovePhotoModal from '@/components/MovePhotoModal';
import PhotoGalleryFolders from '@/components/PhotoGalleryFolders';
import VideoGalleryFolders from '@/components/VideoGalleryFolders';
import MediaGalleryGrid from '@/components/MediaGalleryGrid';
import { PropertyService, PropertyFile } from '@/services/PropertyService';
import { useToast } from '@/hooks/use-toast';
import { useProperties } from '@/hooks/useProperties';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc';
type ViewMode = 'grid' | 'list';

interface PhotoFolder {
  id: string;
  folder_name: string;
  description: string | null;
  gradient_color: string;
  created_at: string;
}

interface VideoFolder {
  id: string;
  name: string;
  description: string;
  photoCount: number;
  createdDate: string;
  color: string;
}

const CombinedMedia: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { properties } = useProperties();
  
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [photos, setPhotos] = useState<PropertyFile[]>([]);
  const [videos, setVideos] = useState<PropertyFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Photo state
  const [photoFolders, setPhotoFolders] = useState<PhotoFolder[]>([]);
  const [selectedPhotoFolder, setSelectedPhotoFolder] = useState<string | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [showPhotoMoveModal, setShowPhotoMoveModal] = useState(false);
  
  // Video state
  const [videoFolders, setVideoFolders] = useState<VideoFolder[]>([]);
  const [selectedVideoFolder, setSelectedVideoFolder] = useState<string | null>(null);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  
  // Shared state
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
  const [showDeleteFolderDialog, setShowDeleteFolderDialog] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchPhotos();
    fetchVideos();
    fetchPhotoFolders();
    fetchVideoFolders();
  }, []);

  const fetchPhotos = async () => {
    try {
      const files = await PropertyService.getAllUserFiles('photo');
      setPhotos(files);
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };

  const fetchVideos = async () => {
    try {
      const files = await PropertyService.getAllUserFiles('video');
      setVideos(files);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPhotoFolders = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('photo_folders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPhotoFolders(data || []);
    } catch (error) {
      console.error('Error fetching photo folders:', error);
    }
  };

  const fetchVideoFolders = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('video_folders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const mappedFolders: VideoFolder[] = data?.map(folder => ({
        id: folder.id,
        name: folder.folder_name,
        description: folder.description || '',
        photoCount: 0,
        createdDate: folder.created_at,
        color: folder.gradient_color.includes('blue') ? 'blue' : 
               folder.gradient_color.includes('green') ? 'green' : 
               folder.gradient_color.includes('purple') ? 'purple' : 
               folder.gradient_color.includes('orange') ? 'orange' : 'blue'
      })) || [];
      setVideoFolders(mappedFolders);
    } catch (error) {
      console.error('Error fetching video folders:', error);
    }
  };

  const handleBack = () => {
    navigate('/account');
  };

  const getPropertyName = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    return property?.name || 'Unknown Property';
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '0 B';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
  };

  const transformedPhotos = photos.map(photo => ({
    id: photo.id,
    name: photo.file_name,
    url: photo.file_url,
    uploadDate: photo.created_at,
    size: formatFileSize(photo.file_size),
    propertyName: getPropertyName(photo.property_id)
  }));

  const transformedVideos = videos.map(video => ({
    id: video.id,
    name: video.file_name,
    url: video.file_url,
    uploadDate: video.created_at,
    size: formatFileSize(video.file_size),
    propertyName: getPropertyName(video.property_id)
  }));

  const getFilteredItems = (items: typeof transformedPhotos, selectedFolder: string | null, originalFiles: PropertyFile[]) => {
    let filtered = items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const fileData = originalFiles.find(f => f.id === item.id);
      const matchesFolder = selectedFolder ? fileData?.folder_id === selectedFolder : true;
      return matchesSearch && matchesFolder;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        case 'date-asc':
          return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredPhotos = getFilteredItems(transformedPhotos, selectedPhotoFolder, photos);
  const filteredVideos = getFilteredItems(transformedVideos, selectedVideoFolder, videos);

  const handleCreateFolder = async (name: string, description: string, gradientColor: string) => {
    if (!user) return;
    
    try {
      const tableName = activeTab === 'photos' ? 'photo_folders' : 'video_folders';
      const { error } = await supabase
        .from(tableName)
        .insert({
          user_id: user.id,
          folder_name: name,
          description: description || null,
          gradient_color: gradientColor
        });

      if (error) throw error;
      
      if (activeTab === 'photos') {
        await fetchPhotoFolders();
      } else {
        await fetchVideoFolders();
      }
      setShowCreateFolder(false);
      toast({ title: "Success", description: "Folder created successfully" });
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({ title: "Error", description: "Failed to create folder", variant: "destructive" });
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolderToDelete(folderId);
    setShowDeleteFolderDialog(true);
  };

  const confirmDeleteFolder = async () => {
    if (!folderToDelete) return;
    
    try {
      const { error: updateError } = await supabase
        .from('property_files')
        .update({ folder_id: null })
        .eq('folder_id', folderToDelete);

      if (updateError) throw updateError;

      const tableName = activeTab === 'photos' ? 'photo_folders' : 'video_folders';
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', folderToDelete);

      if (deleteError) throw deleteError;
      
      if (activeTab === 'photos') {
        setPhotoFolders(photoFolders.filter(f => f.id !== folderToDelete));
        if (selectedPhotoFolder === folderToDelete) setSelectedPhotoFolder(null);
        await fetchPhotos();
      } else {
        setVideoFolders(videoFolders.filter(f => f.id !== folderToDelete));
        if (selectedVideoFolder === folderToDelete) setSelectedVideoFolder(null);
        await fetchVideos();
      }
      
      setShowDeleteFolderDialog(false);
      setFolderToDelete(null);
      toast({ title: "Success", description: "Folder deleted successfully." });
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast({ title: "Error", description: "Failed to delete folder", variant: "destructive" });
    }
  };

  const handleMovePhotos = async (propertyId: string | null, folderId: string | null) => {
    if (selectedPhotos.length === 0) return;
    
    try {
      const updates = selectedPhotos.map(photoId => {
        const photo = photos.find(p => p.id === photoId);
        if (!photo) return Promise.resolve();
        return supabase
          .from('property_files')
          .update({ folder_id: folderId, property_id: propertyId || photo.property_id })
          .eq('id', photoId);
      });

      await Promise.all(updates);
      toast({ title: "Success", description: `${selectedPhotos.length} photo(s) moved successfully` });
      await fetchPhotos();
      setSelectedPhotos([]);
      setShowPhotoMoveModal(false);
    } catch (error) {
      console.error('Error moving photos:', error);
      toast({ title: "Error", description: "Failed to move photos", variant: "destructive" });
    }
  };

  const toggleSelection = (id: string) => {
    if (activeTab === 'photos') {
      setSelectedPhotos(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    } else {
      setSelectedVideos(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    }
  };

  const selectAll = () => {
    if (activeTab === 'photos') {
      setSelectedPhotos(filteredPhotos.map(p => p.id));
    } else {
      setSelectedVideos(filteredVideos.map(v => v.id));
    }
  };

  const unselectAll = () => {
    if (activeTab === 'photos') {
      setSelectedPhotos([]);
    } else {
      setSelectedVideos([]);
    }
  };

  const handleDeleteItem = (id: string) => {
    setItemToDelete(id);
    setBulkDeleteMode(false);
    setShowDeleteDialog(true);
  };

  const handleBulkDelete = () => {
    const selected = activeTab === 'photos' ? selectedPhotos : selectedVideos;
    if (selected.length > 0) {
      setBulkDeleteMode(true);
      setShowDeleteDialog(true);
    }
  };

  const confirmDelete = async () => {
    const files = activeTab === 'photos' ? photos : videos;
    const selected = activeTab === 'photos' ? selectedPhotos : selectedVideos;
    
    try {
      if (bulkDeleteMode) {
        const deletePromises = selected.map(id => {
          const file = files.find(f => f.id === id);
          if (file) return PropertyService.deletePropertyFile(file.id, file.file_path, file.bucket_name);
          return Promise.resolve(false);
        });
        await Promise.all(deletePromises);
        toast({ title: "Success", description: `${selected.length} file(s) deleted successfully` });
      } else if (itemToDelete) {
        const file = files.find(f => f.id === itemToDelete);
        if (file) {
          await PropertyService.deletePropertyFile(file.id, file.file_path, file.bucket_name);
          toast({ title: "Success", description: "File deleted successfully" });
        }
      }
      
      if (activeTab === 'photos') {
        await fetchPhotos();
        setSelectedPhotos([]);
      } else {
        await fetchVideos();
        setSelectedVideos([]);
      }
    } catch (error) {
      console.error('Error deleting file(s):', error);
      toast({ title: "Error", description: "Failed to delete file(s)", variant: "destructive" });
    } finally {
      setShowDeleteDialog(false);
      setItemToDelete(null);
      setBulkDeleteMode(false);
    }
  };

  const currentFiles = activeTab === 'photos' ? filteredPhotos : filteredVideos;
  const currentSelected = activeTab === 'photos' ? selectedPhotos : selectedVideos;
  const currentFolderName = activeTab === 'photos' 
    ? (selectedPhotoFolder ? photoFolders.find(f => f.id === selectedPhotoFolder)?.folder_name : 'All Photos & Videos')
    : (selectedVideoFolder ? videoFolders.find(f => f.id === selectedVideoFolder)?.name : 'All Photos & Videos');

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <DashboardBreadcrumb />
          
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center">
                <Button variant="ghost" size="sm" onClick={handleBack} className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Photo/Video Management</h1>
                  <p className="text-gray-600 mt-1">
                    Capture photos or videos to document your property and belongings
                  </p>
                </div>
              </div>
              
              <Button onClick={() => navigate('/account/media/upload')} className="bg-brand-blue hover:bg-brand-lightBlue">
                <Plus className="h-4 w-4 mr-2" />
                Upload Photos/Videos
              </Button>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {sortBy.includes('date') ? <Calendar className="h-4 w-4 mr-1" /> : <Type className="h-4 w-4 mr-1" />}
                    {sortBy.includes('desc') ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background">
                  <DropdownMenuItem onClick={() => setSortBy('date-desc')}>Date (Newest)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('date-asc')}>Date (Oldest)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('name-asc')}>Name (A-Z)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('name-desc')}>Name (Z-A)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex border rounded-lg">
                <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}>
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')}>
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {currentSelected.length > 0 && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={unselectAll}>
                    Deselect All ({currentSelected.length})
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                    Delete Selected
                  </Button>
                </div>
              )}
              
              {currentSelected.length === 0 && (
                <Button variant="outline" size="sm" onClick={selectAll}>
                  Select All
                </Button>
              )}
            </div>
          </div>

          {/* Tabs for Photo/Video */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'photos' | 'videos')} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="photos" className="flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Photos ({photos.length})
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                Videos ({videos.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="photos">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                  <PhotoGalleryFolders 
                    folders={photoFolders}
                    selectedFolder={selectedPhotoFolder}
                    onFolderSelect={setSelectedPhotoFolder}
                    photoCount={selectedPhotoFolder ? photos.filter(p => p.folder_id === selectedPhotoFolder).length : photos.length}
                    onDeleteFolder={handleDeleteFolder}
                    onCreateFolder={() => setShowCreateFolder(true)}
                  />
                </div>
                <div className="lg:col-span-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Camera className="h-5 w-5" />
                        {selectedPhotoFolder ? photoFolders.find(f => f.id === selectedPhotoFolder)?.folder_name : 'All Photos'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="p-12 text-center">
                          <p className="text-muted-foreground">Loading...</p>
                        </div>
                      ) : (
                        <MediaGalleryGrid 
                          files={filteredPhotos}
                          viewMode={viewMode}
                          selectedFiles={selectedPhotos}
                          onFileSelect={toggleSelection}
                          onDeleteFile={handleDeleteItem}
                          mediaType="photo"
                        />
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="videos">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                  <VideoGalleryFolders
                    folders={videoFolders}
                    selectedFolder={selectedVideoFolder}
                    onFolderSelect={setSelectedVideoFolder}
                    videos={transformedVideos.map(v => ({ ...v, id: parseInt(v.id) || 0, folderId: null, tags: [], propertyId: 0, duration: '--:--', filename: v.name }))}
                    onDeleteFolder={handleDeleteFolder}
                    onCreateFolder={() => setShowCreateFolder(true)}
                  />
                </div>
                <div className="lg:col-span-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Video className="h-5 w-5" />
                        {selectedVideoFolder ? videoFolders.find(f => f.id === selectedVideoFolder)?.name : 'All Videos'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="p-12 text-center">
                          <p className="text-muted-foreground">Loading...</p>
                        </div>
                      ) : (
                        <MediaGalleryGrid
                          files={filteredVideos}
                          viewMode={viewMode}
                          selectedFiles={selectedVideos}
                          onFileSelect={toggleSelection}
                          onDeleteFile={handleDeleteItem}
                          mediaType="video"
                        />
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CreateFolderModal 
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onCreateFolder={handleCreateFolder}
      />

      <MovePhotoModal
        isOpen={showPhotoMoveModal}
        onClose={() => setShowPhotoMoveModal(false)}
        onMove={handleMovePhotos}
        folders={photoFolders}
        photoCount={selectedPhotos.length}
      />

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => { setShowDeleteDialog(false); setItemToDelete(null); setBulkDeleteMode(false); }}
        onConfirm={confirmDelete}
        title={bulkDeleteMode ? `Delete ${activeTab === 'photos' ? 'Photos' : 'Videos'}` : `Delete ${activeTab === 'photos' ? 'Photo' : 'Video'}`}
        itemCount={bulkDeleteMode ? currentSelected.length : 1}
      />

      <DeleteConfirmationDialog
        isOpen={showDeleteFolderDialog}
        onClose={() => { setShowDeleteFolderDialog(false); setFolderToDelete(null); }}
        onConfirm={confirmDeleteFolder}
        title="Delete Folder"
        description="Are you sure you want to delete this folder? Files will remain in general storage."
      />
      
      <Footer />
    </div>
  );
};

export default CombinedMedia;
