
import React, { useState } from 'react';
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
import PhotoGalleryGrid from '@/components/PhotoGalleryGrid';
import PhotoGalleryFolders from '@/components/PhotoGalleryFolders';
import CreateFolderModal from '@/components/CreateFolderModal';

// Mock data for demonstration
const mockPhotos = [
  {
    id: 1,
    name: "Living Room",
    filename: "living-room-001.jpg",
    url: "/placeholder.svg",
    uploadDate: "2024-06-15",
    size: "2.4 MB",
    propertyId: 1,
    propertyName: "Main Residence",
    folderId: null,
    tags: ["interior", "living room"]
  },
  {
    id: 2,
    name: "Kitchen",
    filename: "kitchen-modern.jpg",
    url: "/placeholder.svg",
    uploadDate: "2024-06-12",
    size: "1.8 MB",
    propertyId: 1,
    propertyName: "Main Residence",
    folderId: 1,
    tags: ["interior", "kitchen"]
  },
  {
    id: 3,
    name: "Master Bedroom",
    filename: "bedroom-master.jpg",
    url: "/placeholder.svg",
    uploadDate: "2024-06-10",
    size: "3.1 MB",
    propertyId: 1,
    propertyName: "Main Residence",
    folderId: 1,
    tags: ["interior", "bedroom"]
  },
  {
    id: 4,
    name: "Exterior View",
    filename: "exterior-front.jpg",
    url: "/placeholder.svg",
    uploadDate: "2024-06-08",
    size: "4.2 MB",
    propertyId: 2,
    propertyName: "Vacation Cabin",
    folderId: 2,
    tags: ["exterior", "front view"]
  },
  {
    id: 5,
    name: "Lake View",
    filename: "lake-view-sunset.jpg",
    url: "/placeholder.svg",
    uploadDate: "2024-06-05",
    size: "3.8 MB",
    propertyId: 2,
    propertyName: "Vacation Cabin",
    folderId: null,
    tags: ["exterior", "lake", "view"]
  }
];

const mockFolders = [
  {
    id: 1,
    name: "Interior Photos",
    description: "All interior shots of the main residence",
    photoCount: 2,
    createdDate: "2024-06-01",
    color: "blue"
  },
  {
    id: 2,
    name: "Cabin Exteriors",
    description: "External views of the vacation cabin",
    photoCount: 1,
    createdDate: "2024-06-02",
    color: "green"
  }
];

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'size-desc' | 'size-asc';
type ViewMode = 'grid' | 'list';

const PhotoGallery: React.FC = () => {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState(mockPhotos);
  const [folders, setFolders] = useState(mockFolders);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  const handleBack = () => {
    navigate('/account/properties');
  };

  const filteredAndSortedPhotos = React.useMemo(() => {
    let filtered = photos.filter(photo => {
      const matchesSearch = photo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           photo.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           photo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFolder = selectedFolder === null || photo.folderId === selectedFolder;
      
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
        default:
          return 0;
      }
    });

    return filtered;
  }, [photos, searchTerm, selectedFolder, sortBy]);

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

  const handleMovePhotos = (folderId: number | null) => {
    setPhotos(photos.map(photo => 
      selectedPhotos.includes(photo.id) 
        ? { ...photo, folderId }
        : photo
    ));
    
    // Update folder photo counts
    setFolders(folders.map(folder => ({
      ...folder,
      photoCount: photos.filter(p => p.folderId === folder.id).length
    })));
    
    setSelectedPhotos([]);
  };

  const togglePhotoSelection = (photoId: number) => {
    setSelectedPhotos(prev => 
      prev.includes(photoId) 
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const currentFolderName = selectedFolder 
    ? folders.find(f => f.id === selectedFolder)?.name 
    : 'All Photos';

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="flex-grow py-8 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
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
            folders={folders}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <PhotoGalleryFolders 
              folders={folders}
              selectedFolder={selectedFolder}
              onFolderSelect={setSelectedFolder}
              photos={photos}
            />

            <div className="lg:col-span-3">
              <PhotoGalleryGrid 
                photos={filteredAndSortedPhotos}
                viewMode={viewMode}
                selectedPhotos={selectedPhotos}
                onPhotoSelect={togglePhotoSelection}
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

export default PhotoGallery;
