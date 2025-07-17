
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
  Play
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import VideoGalleryHeader from '@/components/VideoGalleryHeader';
import VideoGalleryGrid from '@/components/VideoGalleryGrid';
import VideoGalleryFolders from '@/components/VideoGalleryFolders';
import CreateFolderModal from '@/components/CreateFolderModal';
import DashboardBreadcrumb from '@/components/DashboardBreadcrumb';

// Mock data for demonstration
const mockVideos = [
  {
    id: 1,
    name: "Property Walkthrough",
    filename: "walkthrough-main.mp4",
    url: "/placeholder.svg",
    duration: "5:30",
    uploadDate: "2024-06-15",
    size: "24.5 MB",
    propertyId: 1,
    propertyName: "Main Residence",
    folderId: null,
    tags: ["walkthrough", "interior"]
  },
  {
    id: 2,
    name: "Kitchen Tour",
    filename: "kitchen-tour.mp4",
    url: "/placeholder.svg",
    duration: "2:15",
    uploadDate: "2024-06-12",
    size: "12.8 MB",
    propertyId: 1,
    propertyName: "Main Residence",
    folderId: 1,
    tags: ["interior", "kitchen", "tour"]
  },
  {
    id: 3,
    name: "Bedroom Overview",
    filename: "bedroom-overview.mp4",
    url: "/placeholder.svg",
    duration: "3:45",
    uploadDate: "2024-06-10",
    size: "18.2 MB",
    propertyId: 1,
    propertyName: "Main Residence",
    folderId: 1,
    tags: ["interior", "bedroom"]
  },
  {
    id: 4,
    name: "Cabin Exterior",
    filename: "cabin-exterior.mp4",
    url: "/placeholder.svg",
    duration: "4:20",
    uploadDate: "2024-06-08",
    size: "32.1 MB",
    propertyId: 2,
    propertyName: "Vacation Cabin",
    folderId: 2,
    tags: ["exterior", "cabin"]
  },
  {
    id: 5,
    name: "Lake View Sunset",
    filename: "lake-sunset.mp4",
    url: "/placeholder.svg",
    duration: "1:50",
    uploadDate: "2024-06-05",
    size: "15.7 MB",
    propertyId: 2,
    propertyName: "Vacation Cabin",
    folderId: null,
    tags: ["exterior", "lake", "sunset"]
  }
];

const mockFolders = [
  {
    id: 1,
    name: "Interior Videos",
    description: "All interior video tours of the main residence",
    photoCount: 2,
    createdDate: "2024-06-01",
    color: "blue"
  },
  {
    id: 2,
    name: "Cabin Videos",
    description: "External and interior videos of the vacation cabin",
    photoCount: 1,
    createdDate: "2024-06-02",
    color: "green"
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

  const handleBack = () => {
    navigate('/account');
  };

  const filteredAndSortedVideos = React.useMemo(() => {
    let filtered = videos.filter(video => {
      const matchesSearch = video.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           video.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFolder = selectedFolder === null || video.folderId === selectedFolder;
      
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
        case 'size-desc':
          return parseFloat(b.size) - parseFloat(a.size);
        case 'size-asc':
          return parseFloat(a.size) - parseFloat(b.size);
        case 'duration-desc':
          return b.duration.localeCompare(a.duration);
        case 'duration-asc':
          return a.duration.localeCompare(b.duration);
        default:
          return 0;
      }
    });

    return filtered;
  }, [videos, searchTerm, selectedFolder, sortBy]);

  const handleCreateFolder = (name: string, description: string, color: string) => {
    const newFolder = {
      id: Math.max(...folders.map(f => f.id)) + 1,
      name,
      description,
      photoCount: 0,
      createdDate: new Date().toISOString().split('T')[0],
      color
    };
    setFolders([...folders, newFolder]);
    setShowCreateFolder(false);
  };

  const handleMoveVideos = (folderId: number | null) => {
    setVideos(videos.map(video => 
      selectedVideos.includes(video.id) 
        ? { ...video, folderId }
        : video
    ));
    
    // Update folder video counts
    setFolders(folders.map(folder => ({
      ...folder,
      photoCount: videos.filter(v => v.folderId === folder.id).length
    })));
    
    setSelectedVideos([]);
  };

  const toggleVideoSelection = (videoId: number) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const currentFolderName = selectedFolder 
    ? folders.find(f => f.id === selectedFolder)?.name 
    : 'All Videos';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <DashboardBreadcrumb />
          
          <VideoGalleryHeader
            onBack={handleBack}
            currentFolderName={currentFolderName}
            videoCount={filteredAndSortedVideos.length}
            selectedCount={selectedVideos.length}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onCreateFolder={() => setShowCreateFolder(true)}
            onMoveVideos={handleMoveVideos}
            folders={folders}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <VideoGalleryFolders 
              folders={folders}
              selectedFolder={selectedFolder}
              onFolderSelect={setSelectedFolder}
              videos={videos}
            />

            <div className="lg:col-span-3">
              <VideoGalleryGrid 
                videos={filteredAndSortedVideos}
                viewMode={viewMode}
                selectedVideos={selectedVideos}
                onVideoSelect={toggleVideoSelection}
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
      
      <Footer />
    </div>
  );
};

export default Videos;
