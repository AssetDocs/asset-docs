import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Camera,
  Plus,
  FolderPlus,
  Search,
  SortAsc,
  SortDesc,
  Calendar,
  Type,
  Grid3X3,
  List,
  Eye,
  Download,
  Move,
  Trash2
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import PhotoGalleryHeader from '@/components/PhotoGalleryHeader';
import MediaGalleryGrid from '@/components/MediaGalleryGrid';
import PhotoGalleryFolders from '@/components/PhotoGalleryFolders';
import CreateFolderModal from '@/components/CreateFolderModal';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import MovePhotoModal from '@/components/MovePhotoModal';
import { PropertyService, PropertyFile } from '@/services/PropertyService';
import { useToast } from '@/hooks/use-toast';
import { useProperties } from '@/hooks/useProperties';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'size-desc' | 'size-asc';
type ViewMode = 'grid' | 'list';

interface Folder {
  id: string;
  folder_name: string;
  description: string | null;
  gradient_color: string;
  created_at: string;
}

const PhotoGallery: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { properties } = useProperties();
  const [photos, setPhotos] = useState<PropertyFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
  const [showDeleteFolderDialog, setShowDeleteFolderDialog] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchPhotos();
    fetchFolders();
  }, []);

  const fetchPhotos = async () => {
    setIsLoading(true);
    try {
      const files = await PropertyService.getAllUserFiles('photo');
      setPhotos(files);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast({
        title: "Error",
        description: "Failed to load photos",
        variant: "destructive"
      });
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFolders(data || []);
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast({
        title: "Error",
        description: "Failed to load folders",
        variant: "destructive"
      });
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
    filePath: photo.file_path,
    bucket: photo.bucket_name,
    uploadDate: photo.created_at,
    size: formatFileSize(photo.file_size),
    propertyName: getPropertyName(photo.property_id)
  }));

  const filteredAndSortedPhotos = React.useMemo(() => {
    let filtered = transformedPhotos.filter(photo => {
      const matchesSearch = photo.name.toLowerCase().includes(searchTerm.toLowerCase());
      const photoData = photos.find(p => p.id === photo.id);
      const matchesFolder = selectedFolder ? photoData?.folder_id === selectedFolder : true;
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
  }, [transformedPhotos, searchTerm, sortBy, selectedFolder, photos]);

  const handleCreateFolder = async (name: string, description: string, gradientColor: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('photo_folders')
        .insert({
          user_id: user.id,
          folder_name: name,
          description: description || null,
          gradient_color: gradientColor
        })
        .select()
        .single();

      if (error) throw error;
      
      setFolders([data, ...folders]);
      setShowCreateFolder(false);
      toast({
        title: "Success",
        description: "Folder created successfully"
      });
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive"
      });
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    setFolderToDelete(folderId);
    setShowDeleteFolderDialog(true);
  };

  const confirmDeleteFolder = async () => {
    if (!folderToDelete) return;
    
    try {
      // First, update all photos in this folder to remove folder_id
      const { error: updateError } = await supabase
        .from('property_files')
        .update({ folder_id: null })
        .eq('folder_id', folderToDelete);

      if (updateError) throw updateError;

      // Then delete the folder
      const { error: deleteError } = await supabase
        .from('photo_folders')
        .delete()
        .eq('id', folderToDelete);

      if (deleteError) throw deleteError;
      
      setFolders(folders.filter(f => f.id !== folderToDelete));
      if (selectedFolder === folderToDelete) {
        setSelectedFolder(null);
      }
      
      await fetchPhotos();
      setShowDeleteFolderDialog(false);
      setFolderToDelete(null);
      
      toast({
        title: "Success",
        description: "Folder deleted successfully. Files remain in general storage."
      });
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive"
      });
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
          .update({ 
            folder_id: folderId,
            property_id: propertyId || photo.property_id
          })
          .eq('id', photoId);
      });

      await Promise.all(updates);
      
      toast({
        title: "Success",
        description: `${selectedPhotos.length} photo(s) moved successfully`
      });
      
      await fetchPhotos();
      setSelectedPhotos([]);
      setShowMoveModal(false);
    } catch (error) {
      console.error('Error moving photos:', error);
      toast({
        title: "Error",
        description: "Failed to move photos",
        variant: "destructive"
      });
    }
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos(prev => 
      prev.includes(photoId) 
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const selectAllPhotos = () => {
    setSelectedPhotos(filteredAndSortedPhotos.map(photo => photo.id));
  };

  const unselectAllPhotos = () => {
    setSelectedPhotos([]);
  };

  const handleDeletePhoto = (photoId: string) => {
    setPhotoToDelete(photoId);
    setBulkDeleteMode(false);
    setShowDeleteDialog(true);
  };

  const handleBulkDelete = React.useCallback(() => {
    if (selectedPhotos.length > 0) {
      setBulkDeleteMode(true);
      setShowDeleteDialog(true);
    }
  }, [selectedPhotos.length]);

  const confirmDelete = async () => {
    try {
      if (bulkDeleteMode) {
        // Delete multiple photos
        const deletePromises = selectedPhotos.map(photoId => {
          const photo = photos.find(p => p.id === photoId);
          if (photo) {
            return PropertyService.deletePropertyFile(photo.id, photo.file_path, photo.bucket_name);
          }
          return Promise.resolve(false);
        });
        
        await Promise.all(deletePromises);
        toast({
          title: "Success",
          description: `${selectedPhotos.length} photo(s) deleted successfully`
        });
      } else if (photoToDelete) {
        // Delete single photo
        const photo = photos.find(p => p.id === photoToDelete);
        if (photo) {
          const success = await PropertyService.deletePropertyFile(photo.id, photo.file_path, photo.bucket_name);
          if (success) {
            toast({
              title: "Success",
              description: "Photo deleted successfully"
            });
          }
        }
      }
      
      await fetchPhotos(); // Refresh the list
      setSelectedPhotos([]);
    } catch (error) {
      console.error('Error deleting photo(s):', error);
      toast({
        title: "Error",
        description: "Failed to delete photo(s)",
        variant: "destructive"
      });
    } finally {
      setShowDeleteDialog(false);
      setPhotoToDelete(null);
      setBulkDeleteMode(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setPhotoToDelete(null);
    setBulkDeleteMode(false);
  };

  const currentFolderName = selectedFolder 
    ? folders.find(f => f.id === selectedFolder)?.folder_name 
    : 'All Photos';

  const currentFolderPhotoCount = selectedFolder
    ? photos.filter(p => p.folder_id === selectedFolder).length
    : photos.length;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <DashboardBreadcrumb />
          
          <PhotoGalleryHeader
            onBack={handleBack}
            currentFolderName={currentFolderName}
            photoCount={filteredAndSortedPhotos.length}
            selectedCount={selectedPhotos.length}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onCreateFolder={() => setShowCreateFolder(true)}
            onMovePhotos={() => setShowMoveModal(true)}
            onBulkDelete={handleBulkDelete}
            onSelectAll={selectAllPhotos}
            onUnselectAll={unselectAllPhotos}
            folders={folders}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar with Folders */}
            <div className="lg:col-span-1">
              <PhotoGalleryFolders 
                folders={folders}
                selectedFolder={selectedFolder}
                onFolderSelect={setSelectedFolder}
                photoCount={currentFolderPhotoCount}
                onDeleteFolder={handleDeleteFolder}
                onCreateFolder={() => setShowCreateFolder(true)}
              />
            </div>

            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    {selectedFolder 
                      ? folders.find(f => f.id === selectedFolder)?.folder_name || 'Photos'
                      : 'All Photos'
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="p-12 text-center">
                      <p className="text-muted-foreground">Loading photos...</p>
                    </div>
                  ) : (
                    <MediaGalleryGrid 
                      files={filteredAndSortedPhotos}
                      viewMode={viewMode}
                      selectedFiles={selectedPhotos}
                      onFileSelect={togglePhotoSelection}
                      onDeleteFile={handleDeletePhoto}
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
      />

      <MovePhotoModal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        onMove={handleMovePhotos}
        folders={folders}
        photoCount={selectedPhotos.length}
      />

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title={bulkDeleteMode ? "Delete Photos" : "Delete Photo"}
        itemCount={bulkDeleteMode ? selectedPhotos.length : 1}
      />

      <DeleteConfirmationDialog
        isOpen={showDeleteFolderDialog}
        onClose={() => {
          setShowDeleteFolderDialog(false);
          setFolderToDelete(null);
        }}
        onConfirm={confirmDeleteFolder}
        title="Delete Folder"
        description="Are you sure you want to delete this folder? This folder and all of its contents will be removed from the folder, but the uploaded files can still be found in general storage."
      />
      
      <Footer />
    </div>
  );
};

export default PhotoGallery;
