import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';
import CreateFolderModal from '@/components/CreateFolderModal';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import VideoGalleryHeader from '@/components/VideoGalleryHeader';
import VideoGalleryGrid from '@/components/VideoGalleryGrid';

// Mock data for demonstration
const mockVideos = [
  {
    id: 1,
    name: "Living Room Walkthrough",
    filename: "living-room-tour.mp4",
    url: "/placeholder.svg",
    uploadDate: "2024-06-15",
    duration: "3:45",
    size: "45.2 MB",
    propertyId: 1,
    propertyName: "Main Residence",
    folderId: null,
    tags: ["interior", "living room"]
  },
  {
    id: 2,
    name: "Kitchen Details",
    filename: "kitchen-appliances.mp4", 
    url: "/placeholder.svg",
    uploadDate: "2024-06-14",
    duration: "2:15",
    size: "28.7 MB",
    propertyId: 1,
    propertyName: "Main Residence",
    folderId: 1,
    tags: ["interior", "kitchen", "appliances"]
  },
  {
    id: 3,
    name: "Exterior Overview",
    filename: "exterior-walkthrough.mp4",
    url: "/placeholder.svg",
    uploadDate: "2024-06-13",
    duration: "5:30",
    size: "67.8 MB",
    propertyId: 2,
    propertyName: "Vacation Home",
    folderId: null,
    tags: ["exterior", "landscape"]
  }
];

const mockFolders = [
  {
    id: 1,
    name: "Interior Videos",
    description: "Videos of interior spaces",
    photoCount: 15,
    createdDate: "2024-06-01",
    color: "blue"
  },
  {
    id: 2,
    name: "Exterior Videos", 
    description: "Videos of exterior areas",
    photoCount: 8,
    createdDate: "2024-06-02",
    color: "green"
  },
  {
    id: 3,
    name: "Property Tours",
    description: "Complete property walkthroughs",
    photoCount: 12,
    createdDate: "2024-06-03",
    color: "purple"
  }
];

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'size-desc' | 'size-asc' | 'duration-desc' | 'duration-asc';
type ViewMode = 'grid' | 'list';

const Videos: React.FC = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState(mockVideos);
  const [folders, setFolders] = useState(mockFolders);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVideos, setSelectedVideos] = useState<number[]>([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<number | null>(null);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);

  const handleBack = () => {
    if (selectedFolder) {
      setSelectedFolder(null);
    } else {
      navigate('/account');
    }
  };

  const currentFolderName = selectedFolder 
    ? folders.find(f => f.id === selectedFolder)?.name || 'Videos'
    : 'All Videos';

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFolder = selectedFolder ? video.folderId === selectedFolder : true;
    return matchesSearch && matchesFolder;
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
      case 'size-desc':
        return parseFloat(b.size) - parseFloat(a.size);
      case 'size-asc':
        return parseFloat(a.size) - parseFloat(b.size);
      default:
        return 0;
    }
  });

  const toggleVideoSelection = (videoId: number) => {
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
    setVideos(prev => prev.map(video => 
      selectedVideos.includes(video.id) 
        ? { ...video, folderId: targetFolderId }
        : video
    ));
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

  const handleDeleteVideo = (videoId: number) => {
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

  const confirmDelete = () => {
    if (bulkDeleteMode) {
      setVideos(prev => prev.filter(video => !selectedVideos.includes(video.id)));
      setSelectedVideos([]);
    } else if (videoToDelete) {
      setVideos(prev => prev.filter(video => video.id !== videoToDelete));
      setSelectedVideos(prev => prev.filter(id => id !== videoToDelete));
    }
    setShowDeleteDialog(false);
    setVideoToDelete(null);
    setBulkDeleteMode(false);
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
            onCreateFolder={() => setShowCreateFolder(true)}
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
                          {videos.filter(v => v.folderId === folder.id).length}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Videos Grid */}
            <div className="lg:col-span-3">
              <VideoGalleryGrid
                videos={sortedVideos}
                viewMode={viewMode}
                selectedVideos={selectedVideos}
                onVideoSelect={toggleVideoSelection}
                onDeleteVideo={handleDeleteVideo}
              />
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