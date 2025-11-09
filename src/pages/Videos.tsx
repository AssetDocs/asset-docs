import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, ArrowLeft, Plus, FolderPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';
import CreateFolderModal from '@/components/CreateFolderModal';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import VideoGalleryHeader from '@/components/VideoGalleryHeader';
import MediaGalleryGrid from '@/components/MediaGalleryGrid';
import { PropertyService, PropertyFile } from '@/services/PropertyService';
import { useToast } from '@/hooks/use-toast';
import { useProperties } from '@/hooks/useProperties';

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'size-desc' | 'size-asc' | 'duration-desc' | 'duration-asc';
type ViewMode = 'grid' | 'list';

const mockFolders = [
  {
    id: 1,
    name: "Interior Videos",
    description: "Videos of interior spaces",
    photoCount: 0,
    createdDate: "2024-06-01",
    color: "blue"
  }
];

const Videos: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { properties } = useProperties();
  const [videos, setVideos] = useState<PropertyFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [folders, setFolders] = useState(mockFolders);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const files = await PropertyService.getAllUserFiles('video');
      setVideos(files);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast({
        title: "Error",
        description: "Failed to load videos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (selectedFolder) {
      setSelectedFolder(null);
    } else {
      navigate('/account');
    }
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

  const transformedVideos = videos.map(video => ({
    id: video.id,
    name: video.file_name,
    url: video.file_url,
    uploadDate: video.created_at,
    size: formatFileSize(video.file_size),
    propertyName: getPropertyName(video.property_id),
    duration: '--:--' // TODO: Store duration in database
  }));

  const currentFolderName = selectedFolder 
    ? folders.find(f => f.id === selectedFolder)?.name || 'Videos'
    : 'All Videos';

  const filteredVideos = transformedVideos.filter(video => {
    const matchesSearch = video.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const sortedVideos = [...filteredVideos].sort((a, b) => {
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

  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const selectAllVideos = () => {
    setSelectedVideos(sortedVideos.map(video => video.id));
  };

  const unselectAllVideos = () => {
    setSelectedVideos([]);
  };

  const handleMoveVideos = (targetFolderId: number | null) => {
    // TODO: Implement folder functionality
    setSelectedVideos([]);
  };

  const handleCreateFolder = (name: string, color: string) => {
    const newFolder = {
      id: folders.length + 1,
      name,
      description: `Created on ${new Date().toLocaleDateString()}`,
      photoCount: 0,
      createdDate: new Date().toISOString().split('T')[0],
      color
    };
    setFolders(prev => [...prev, newFolder]);
    setShowCreateFolder(false);
  };

  const handleDeleteVideo = (videoId: string) => {
    setVideoToDelete(videoId);
    setBulkDeleteMode(false);
    setShowDeleteDialog(true);
  };

  const handleBulkDelete = () => {
    if (selectedVideos.length > 0) {
      setBulkDeleteMode(true);
      setShowDeleteDialog(true);
    }
  };

  const confirmDelete = async () => {
    try {
      if (bulkDeleteMode) {
        // Delete multiple videos
        const deletePromises = selectedVideos.map(videoId => {
          const video = videos.find(v => v.id === videoId);
          if (video) {
            return PropertyService.deletePropertyFile(video.id, video.file_path, video.bucket_name);
          }
          return Promise.resolve(false);
        });
        
        await Promise.all(deletePromises);
        toast({
          title: "Success",
          description: `${selectedVideos.length} video(s) deleted successfully`
        });
      } else if (videoToDelete) {
        // Delete single video
        const video = videos.find(v => v.id === videoToDelete);
        if (video) {
          const success = await PropertyService.deletePropertyFile(video.id, video.file_path, video.bucket_name);
          if (success) {
            toast({
              title: "Success",
              description: "Video deleted successfully"
            });
          }
        }
      }
      
      await fetchVideos(); // Refresh the list
      setSelectedVideos([]);
    } catch (error) {
      console.error('Error deleting video(s):', error);
      toast({
        title: "Error",
        description: "Failed to delete video(s)",
        variant: "destructive"
      });
    } finally {
      setShowDeleteDialog(false);
      setVideoToDelete(null);
      setBulkDeleteMode(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setVideoToDelete(null);
    setBulkDeleteMode(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <DashboardBreadcrumb />
          
          <VideoGalleryHeader
            onBack={handleBack}
            currentFolderName={currentFolderName}
            videoCount={sortedVideos.length}
            selectedCount={selectedVideos.length}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onMoveVideos={handleMoveVideos}
            onBulkDelete={handleBulkDelete}
            onSelectAll={selectAllVideos}
            onUnselectAll={unselectAllVideos}
            folders={folders}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Folders Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Folders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => setShowCreateFolder(true)}
                      variant="outline"
                      className="w-full justify-start border-2 border-dashed"
                    >
                      <FolderPlus className="h-4 w-4 mr-2" />
                      New Folder
                    </Button>
                    <Button
                      variant={selectedFolder === null ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedFolder(null)}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      All Videos
                      <Badge variant="secondary" className="ml-auto">
                        {videos.length}
                      </Badge>
                    </Button>
                    
                    {folders.map((folder) => (
                      <Button
                        key={folder.id}
                        variant={selectedFolder === folder.id ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setSelectedFolder(folder.id)}
                      >
                        <div className={`w-3 h-3 rounded-full mr-2 bg-${folder.color}-500`} />
                        {folder.name}
                        <Badge variant="secondary" className="ml-auto">
                          0
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Videos Grid */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <Card className="p-12 text-center">
                  <p className="text-gray-500">Loading videos...</p>
                </Card>
              ) : (
                <MediaGalleryGrid
                  files={sortedVideos}
                  viewMode={viewMode}
                  selectedFiles={selectedVideos}
                  onFileSelect={toggleVideoSelection}
                  onDeleteFile={handleDeleteVideo}
                  mediaType="video"
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
        title={bulkDeleteMode ? "Delete Videos" : "Delete Video"}
        itemCount={bulkDeleteMode ? selectedVideos.length : 1}
      />
      
      <Footer />
    </div>
  );
};

export default Videos;