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
import { PropertyService, PropertyFile } from '@/services/PropertyService';
import { useToast } from '@/hooks/use-toast';
import { useProperties } from '@/hooks/useProperties';

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'size-desc' | 'size-asc';
type ViewMode = 'grid' | 'list';

const mockFolders = [
  {
    id: 1,
    name: "Interior Photos",
    description: "All interior shots",
    photoCount: 0,
    createdDate: "2024-06-01",
    color: "blue"
  }
];

const PhotoGallery: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { properties } = useProperties();
  const [photos, setPhotos] = useState<PropertyFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [folders, setFolders] = useState(mockFolders);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);

  useEffect(() => {
    fetchPhotos();
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

  const filteredAndSortedPhotos = React.useMemo(() => {
    let filtered = transformedPhotos.filter(photo => {
      const matchesSearch = photo.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
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
  }, [transformedPhotos, searchTerm, sortBy]);

  const handleCreateFolder = (name: string, color: string) => {
    const newFolder = {
      id: Math.max(...folders.map(f => f.id)) + 1,
      name,
      description: `Folder for ${name}`,
      photoCount: 0,
      createdDate: new Date().toISOString().split('T')[0],
      color
    };
    setFolders([...folders, newFolder]);
    setShowCreateFolder(false);
  };

  const handleMovePhotos = (folderId: number | null) => {
    // TODO: Implement folder functionality
    setSelectedPhotos([]);
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
    ? folders.find(f => f.id === selectedFolder)?.name 
    : 'All Photos';

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
            onMovePhotos={handleMovePhotos}
            onBulkDelete={handleBulkDelete}
            onSelectAll={selectAllPhotos}
            onUnselectAll={unselectAllPhotos}
            folders={folders}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <PhotoGalleryFolders 
              folders={folders}
              selectedFolder={selectedFolder}
              onFolderSelect={setSelectedFolder}
              photos={[]}
            />

            <div className="lg:col-span-3">
              {isLoading ? (
                <Card className="p-12 text-center">
                  <p className="text-gray-500">Loading photos...</p>
                </Card>
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
            </div>
          </div>
        </div>
      </div>

      <CreateFolderModal 
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onCreateFolder={handleCreateFolder}
      />

      <DeleteConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title={bulkDeleteMode ? "Delete Photos" : "Delete Photo"}
        itemCount={bulkDeleteMode ? selectedPhotos.length : 1}
      />
      
      <Footer />
    </div>
  );
};

export default PhotoGallery;
