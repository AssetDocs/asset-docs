import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Images,
  Filter
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
import EditFolderModal from '@/components/EditFolderModal';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import MovePhotoModal from '@/components/MovePhotoModal';
import PhotoGalleryFolders from '@/components/PhotoGalleryFolders';
import MediaGalleryGrid from '@/components/MediaGalleryGrid';
import { PropertyService, PropertyFile } from '@/services/PropertyService';
import { useToast } from '@/hooks/use-toast';
import { useProperties } from '@/hooks/useProperties';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc';
type ViewMode = 'grid' | 'list';
type MediaFilter = 'all' | 'photo' | 'video';

interface PhotoFolder {
  id: string;
  folder_name: string;
  description: string | null;
  gradient_color: string;
  created_at: string;
  display_order?: number;
}

const CombinedMedia: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { properties } = useProperties();
  
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all');
  const [photos, setPhotos] = useState<PropertyFile[]>([]);
  const [videos, setVideos] = useState<PropertyFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Folder state (unified for photos and videos)
  const [folders, setFolders] = useState<PhotoFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showMoveModal, setShowMoveModal] = useState(false);
  
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
  const [showEditFolder, setShowEditFolder] = useState(false);
  const [folderToEdit, setFolderToEdit] = useState<PhotoFolder | null>(null);

  useEffect(() => {
    fetchPhotos();
    fetchVideos();
    fetchFolders();
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

  const fetchFolders = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('photo_folders')
        .select('*')
        .eq('user_id', user.id)

        // NOTE: photo_folders currently does not have a display_order column.
        // Ordering by a non-existent column causes the request to fail and results
        // in rooms never displaying in the UI.
        .order('created_at', { ascending: false });
      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
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

  // Combine photos and videos based on filter
  const allFiles = [...photos, ...videos];
  
  const transformedFiles = allFiles
    .filter(file => {
      if (mediaFilter === 'photo') return file.file_type === 'photo';
      if (mediaFilter === 'video') return file.file_type === 'video';
      return true;
    })
    .map(file => ({
      id: file.id,
      name: file.file_name,
      url: file.file_url,
      filePath: file.file_path,
      bucket: file.bucket_name,
      uploadDate: file.created_at,
      size: formatFileSize(file.file_size),
      propertyName: getPropertyName(file.property_id),
      fileType: file.file_type
    }));

  const getFilteredItems = () => {
    let filtered = transformedFiles.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const fileData = allFiles.find(f => f.id === item.id);
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

  const filteredFiles = getFilteredItems();

  const handleCreateFolder = async (name: string, description: string, gradientColor: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('photo_folders')
        .insert({
          user_id: user.id,
          folder_name: name,
          description: description || null,
          gradient_color: gradientColor
        });

      if (error) throw error;
      
      await fetchFolders();
      setShowCreateFolder(false);
      toast({ title: "Success", description: "Room created successfully" });
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({ title: "Error", description: "Failed to create room", variant: "destructive" });
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

      const { error: deleteError } = await supabase
        .from('photo_folders')
        .delete()
        .eq('id', folderToDelete);

      if (deleteError) throw deleteError;
      
      setFolders(folders.filter(f => f.id !== folderToDelete));
      if (selectedFolder === folderToDelete) setSelectedFolder(null);
      await fetchPhotos();
      await fetchVideos();
      
      setShowDeleteFolderDialog(false);
      setFolderToDelete(null);
      toast({ title: "Success", description: "Room deleted successfully." });
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast({ title: "Error", description: "Failed to delete room", variant: "destructive" });
    }
  };

  const handleReorderFolders = (reorderedFolders: PhotoFolder[]) => {
    // Update local state for visual reordering
    setFolders(reorderedFolders);
  };

  const handleEditFolder = (folder: PhotoFolder) => {
    setFolderToEdit(folder);
    setShowEditFolder(true);
  };

  const handleSaveFolder = async (id: string, name: string, description: string, color: string) => {
    try {
      const { error } = await supabase
        .from('photo_folders')
        .update({
          folder_name: name,
          description: description || null,
          gradient_color: color
        })
        .eq('id', id);

      if (error) throw error;
      
      await fetchFolders();
      setShowEditFolder(false);
      setFolderToEdit(null);
      toast({ title: "Success", description: "Room updated successfully" });
    } catch (error) {
      console.error('Error updating folder:', error);
      toast({ title: "Error", description: "Failed to update room", variant: "destructive" });
    }
  };

  const handleMoveFiles = async (propertyId: string | null, folderId: string | null) => {
    if (selectedFiles.length === 0) return;
    
    try {
      const updates = selectedFiles.map(fileId => {
        const file = allFiles.find(f => f.id === fileId);
        if (!file) return Promise.resolve();
        return supabase
          .from('property_files')
          .update({ folder_id: folderId, property_id: propertyId || file.property_id })
          .eq('id', fileId);
      });

      await Promise.all(updates);
      toast({ title: "Success", description: `${selectedFiles.length} file(s) moved successfully` });
      await fetchPhotos();
      await fetchVideos();
      setSelectedFiles([]);
      setShowMoveModal(false);
    } catch (error) {
      console.error('Error moving files:', error);
      toast({ title: "Error", description: "Failed to move files", variant: "destructive" });
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedFiles(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAll = () => {
    setSelectedFiles(filteredFiles.map(f => f.id));
  };

  const unselectAll = () => {
    setSelectedFiles([]);
  };

  const handleDeleteItem = (id: string) => {
    setItemToDelete(id);
    setBulkDeleteMode(false);
    setShowDeleteDialog(true);
  };

  const handleEditFile = (id: string) => {
    const file = allFiles.find(f => f.id === id);
    const mediaType = file?.file_type === 'video' ? 'video' : 'photo';
    navigate(`/account/media/${id}/edit?type=${mediaType}`);
  };

  const handleBulkDelete = () => {
    if (selectedFiles.length > 0) {
      setBulkDeleteMode(true);
      setShowDeleteDialog(true);
    }
  };

  const confirmDelete = async () => {
    try {
      if (bulkDeleteMode) {
        const deletePromises = selectedFiles.map(id => {
          const file = allFiles.find(f => f.id === id);
          if (file) return PropertyService.deletePropertyFile(file.id, file.file_path, file.bucket_name);
          return Promise.resolve(false);
        });
        await Promise.all(deletePromises);
        toast({ title: "Success", description: `${selectedFiles.length} file(s) deleted successfully` });
      } else if (itemToDelete) {
        const file = allFiles.find(f => f.id === itemToDelete);
        if (file) {
          await PropertyService.deletePropertyFile(file.id, file.file_path, file.bucket_name);
          toast({ title: "Success", description: "File deleted successfully" });
        }
      }
      
      await fetchPhotos();
      await fetchVideos();
      setSelectedFiles([]);
    } catch (error) {
      console.error('Error deleting file(s):', error);
      toast({ title: "Error", description: "Failed to delete file(s)", variant: "destructive" });
    } finally {
      setShowDeleteDialog(false);
      setItemToDelete(null);
      setBulkDeleteMode(false);
    }
  };

  const getFilterLabel = () => {
    switch (mediaFilter) {
      case 'photo': return 'Photos Only';
      case 'video': return 'Videos Only';
      default: return 'All Files';
    }
  };

  const currentFolderName = selectedFolder 
    ? folders.find(f => f.id === selectedFolder)?.folder_name 
    : 'All Photos and Videos';

  const totalCount = mediaFilter === 'photo' 
    ? photos.length 
    : mediaFilter === 'video' 
      ? videos.length 
      : photos.length + videos.length;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <DashboardBreadcrumb />
          
          {/* Header */}
          <div className="mb-6">
            <div className="mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Photos & Videos</h1>
              <p className="text-gray-600 mt-1">
                Capture and organize photos and videos of your property and belongings.
              </p>
            </div>

            {/* Search and Upload */}
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
              
              <Button onClick={() => navigate('/account/media/upload')} className="w-full sm:w-auto bg-brand-blue hover:bg-brand-lightBlue">
                <Plus className="h-4 w-4 mr-2" />
                Upload Photo/Video
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar with Folders */}
            <div className="lg:col-span-1">
              <PhotoGalleryFolders 
                folders={folders}
                selectedFolder={selectedFolder}
                onFolderSelect={setSelectedFolder}
                photoCount={totalCount}
                onDeleteFolder={handleDeleteFolder}
                onCreateFolder={() => setShowCreateFolder(true)}
                onReorderFolders={handleReorderFolders}
                onEditFolder={handleEditFolder}
                isRoomBased={true}
              />
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <CardTitle className="flex items-center gap-2">
                      <Images className="h-5 w-5" />
                      {currentFolderName}
                      <Badge variant="secondary" className="ml-2">{filteredFiles.length}</Badge>
                    </CardTitle>
                    
                    {/* Controls moved inside the card */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Media Type Filter */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Filter className="h-4 w-4 mr-1" />
                            {getFilterLabel()}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background">
                          <DropdownMenuItem onClick={() => setMediaFilter('all')}>
                            <Images className="h-4 w-4 mr-2" />
                            All Files
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setMediaFilter('photo')}>
                            <Camera className="h-4 w-4 mr-2" />
                            Photos Only
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setMediaFilter('video')}>
                            <Video className="h-4 w-4 mr-2" />
                            Videos Only
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      
                      {/* Sort */}
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

                      {/* View Mode */}
                      <div className="flex border rounded-lg">
                        <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className="rounded-r-none">
                          <Grid3X3 className="h-4 w-4" />
                        </Button>
                        <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="rounded-l-none">
                          <List className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Selection controls */}
                      {selectedFiles.length > 0 ? (
                        <>
                          <Button variant="outline" size="sm" onClick={unselectAll}>
                            Deselect ({selectedFiles.length})
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setShowMoveModal(true)}>
                            Move
                          </Button>
                          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                            Delete
                          </Button>
                        </>
                      ) : (
                        <Button variant="outline" size="sm" onClick={selectAll}>
                          Select All
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="p-12 text-center">
                      <p className="text-muted-foreground">Loading...</p>
                    </div>
                  ) : (
                    <MediaGalleryGrid 
                      files={filteredFiles}
                      viewMode={viewMode}
                      selectedFiles={selectedFiles}
                      onFileSelect={toggleSelection}
                      onDeleteFile={handleDeleteItem}
                      onEditFile={handleEditFile}
                      mediaType="photo"
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <CreateFolderModal 
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onCreateFolder={handleCreateFolder}
        titleOverride="Add Room"
        descriptionOverride="Create a room to organize your photos and videos by location"
      />

      <MovePhotoModal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        onMove={handleMoveFiles}
        folders={folders}
        photoCount={selectedFiles.length}
      />

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => { setShowDeleteDialog(false); setItemToDelete(null); setBulkDeleteMode(false); }}
        onConfirm={confirmDelete}
        title={bulkDeleteMode ? "Delete Files" : "Delete File"}
        itemCount={bulkDeleteMode ? selectedFiles.length : 1}
      />

      <DeleteConfirmationDialog
        isOpen={showDeleteFolderDialog}
        onClose={() => { setShowDeleteFolderDialog(false); setFolderToDelete(null); }}
        onConfirm={confirmDeleteFolder}
        title="Delete Room"
        description="Are you sure you want to delete this room? Files will remain in general storage."
      />

      <EditFolderModal
        isOpen={showEditFolder}
        onClose={() => { setShowEditFolder(false); setFolderToEdit(null); }}
        onSave={handleSaveFolder}
        folder={folderToEdit}
        isRoomBased={true}
      />
      
      <Footer />
    </div>
  );
};

export default CombinedMedia;
