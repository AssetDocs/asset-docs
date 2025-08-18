
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Move,
  Clock,
  Trash2,
  CheckSquare,
  Square
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

interface Folder {
  id: number;
  name: string;
  description: string;
  photoCount: number;
  createdDate: string;
  color: string;
}

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'size-desc' | 'size-asc' | 'duration-desc' | 'duration-asc';
type ViewMode = 'grid' | 'list';

interface VideoGalleryHeaderProps {
  onBack: () => void;
  currentFolderName: string;
  videoCount: number;
  selectedCount: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onCreateFolder: () => void;
  onMoveVideos: (folderId: number | null) => void;
  onBulkDelete: () => void;
  onSelectAll: () => void;
  onUnselectAll: () => void;
  folders: Folder[];
}

const VideoGalleryHeader: React.FC<VideoGalleryHeaderProps> = ({
  onBack,
  currentFolderName,
  videoCount,
  selectedCount,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onCreateFolder,
  onMoveVideos,
  onBulkDelete,
  onSelectAll,
  onUnselectAll,
  folders
}) => {
  const navigate = useNavigate();

  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case 'date-desc': return 'Newest First';
      case 'date-asc': return 'Oldest First';
      case 'name-asc': return 'Name A-Z';
      case 'name-desc': return 'Name Z-A';
      case 'size-desc': return 'Largest First';
      case 'size-asc': return 'Smallest First';
      case 'duration-desc': return 'Longest First';
      case 'duration-asc': return 'Shortest First';
      default: return 'Sort';
    }
  };

  const getSortIcon = (sort: SortOption) => {
    if (sort.includes('desc')) return <SortDesc className="h-4 w-4" />;
    if (sort.includes('asc')) return <SortAsc className="h-4 w-4" />;
    return <Calendar className="h-4 w-4" />;
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Properties
        </Button>
        
        <div className="flex items-center gap-2">
          <Video className="h-6 w-6 text-brand-blue" />
          <h1 className="text-2xl font-bold text-brand-blue">Video Gallery</h1>
          <Badge variant="secondary">{currentFolderName}</Badge>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <div className="text-sm text-gray-600">
            {videoCount} video{videoCount !== 1 ? 's' : ''} 
            {selectedCount > 0 && (
              <span className="ml-2">
                • <Badge variant="outline">{selectedCount} selected</Badge>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={selectedCount === videoCount ? onUnselectAll : onSelectAll} 
            variant="outline" 
            size="sm"
          >
            {selectedCount === videoCount ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Unselect All
              </>
            ) : (
              <>
                <CheckSquare className="h-4 w-4 mr-2" />
                Select All
              </>
            )}
          </Button>

          {selectedCount > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Move className="h-4 w-4 mr-2" />
                  Move Selected
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onMoveVideos(null)}>
                  Move to Unorganized
                </DropdownMenuItem>
                {folders.map((folder) => (
                  <DropdownMenuItem key={folder.id} onClick={() => onMoveVideos(folder.id)}>
                    Move to {folder.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {selectedCount > 0 && (
            <Button onClick={onBulkDelete} variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete ({selectedCount})
            </Button>
          )}

          <Button 
            onClick={onCreateFolder}
            variant="outline" 
            size="sm"
            className="border-brand-blue text-brand-blue"
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            New Folder
          </Button>

          <Button 
            onClick={() => navigate('/account/videos/upload')}
            className="bg-brand-orange hover:bg-brand-orange/90"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Upload Videos
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {getSortIcon(sortBy)}
                <span className="ml-2">{getSortLabel(sortBy)}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onSortChange('date-desc')}>
                <Calendar className="h-4 w-4 mr-2" />
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('date-asc')}>
                <Calendar className="h-4 w-4 mr-2" />
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('name-asc')}>
                <Type className="h-4 w-4 mr-2" />
                Name A-Z
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('name-desc')}>
                <Type className="h-4 w-4 mr-2" />
                Name Z-A
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('size-desc')}>
                <SortDesc className="h-4 w-4 mr-2" />
                Largest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('size-asc')}>
                <SortAsc className="h-4 w-4 mr-2" />
                Smallest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('duration-desc')}>
                <Clock className="h-4 w-4 mr-2" />
                Longest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('duration-asc')}>
                <Clock className="h-4 w-4 mr-2" />
                Shortest First
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoGalleryHeader;
