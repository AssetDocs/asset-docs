import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Video,
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
  Trash2,
  Clock
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';
import CreateFolderModal from '@/components/CreateFolderModal';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';

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
    videoCount: 15,
    color: "blue"
  },
  {
    id: 2,
    name: "Exterior Videos", 
    videoCount: 8,
    color: "green"
  },
  {
    id: 3,
    name: "Property Tours",
    videoCount: 12,
    color: "purple"
  }
];

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'size-desc' | 'size-asc';
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
      videoCount: 0,
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <DashboardBreadcrumb />
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="flex items-center mb-4 sm:mb-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Video className="h-6 w-6 mr-2 text-brand-blue" />
                  {currentFolderName}
                </h1>
                <p className="text-sm text-gray-500">
                  {sortedVideos.length} video{sortedVideos.length !== 1 ? 's' : ''} 
                  {selectedVideos.length > 0 && ` • ${selectedVideos.length} selected`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setShowCreateFolder(true)}
                variant="outline"
                size="sm"
              >
                <FolderPlus className="h-4 w-4 mr-1" />
                New Folder
              </Button>
              <Button asChild size="sm">
                <a href="/account/videos/upload">
                  <Plus className="h-4 w-4 mr-1" />
                  Upload Videos
                </a>
              </Button>
              {selectedVideos.length > 0 && (
                <Button onClick={handleBulkDelete} variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete ({selectedVideos.length})
                </Button>
              )}
            </div>
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <SortAsc className="h-4 w-4 mr-1" />
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSortBy('date-desc')}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('date-asc')}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Oldest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('name-asc')}>
                    <Type className="h-4 w-4 mr-2" />
                    Name A-Z
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('name-desc')}>
                    <Type className="h-4 w-4 mr-2" />
                    Name Z-A
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

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
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedVideos.map((video) => (
                    <Card key={video.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="aspect-video bg-gray-200 flex items-center justify-center relative">
                        <Video className="h-8 w-8 text-gray-400" />
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                          {video.duration}
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-sm line-clamp-2">{video.name}</h3>
                          <input
                            type="checkbox"
                            checked={selectedVideos.includes(video.id)}
                            onChange={() => toggleVideoSelection(video.id)}
                            className="h-4 w-4"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mb-2">
                          {video.size} • {video.duration}
                        </p>
                        <p className="text-xs text-gray-400 mb-3">
                          {formatDate(video.uploadDate)}
                        </p>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="h-3 w-3 mr-1" />
                            Watch
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDeleteVideo(video.id)}
                            className="px-2"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedVideos.map((video) => (
                    <Card key={video.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedVideos.includes(video.id)}
                              onChange={() => toggleVideoSelection(video.id)}
                              className="h-4 w-4 mr-3"
                            />
                            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                              <Video className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">{video.name}</h3>
                              <p className="text-sm text-gray-500">
                                {video.duration} • {video.size} • {formatDate(video.uploadDate)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              Watch
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDeleteVideo(video.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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