
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft,
  Search,
  SortAsc,
  SortDesc,
  Calendar,
  Type,
  Grid3X3,
  List,
  FolderPlus,
  Move,
  Trash2,
  Upload,
  CheckSquare,
  Square
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc' | 'size-desc' | 'size-asc';
type ViewMode = 'grid' | 'list';

interface PhotoGalleryHeaderProps {
  onBack: () => void;
  currentFolderName: string;
  photoCount: number;
  selectedCount: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onCreateFolder: () => void;
  onMovePhotos: () => void;
  onBulkDelete: () => void;
  onSelectAll: () => void;
  onUnselectAll: () => void;
  folders: Array<{
    id: string;
    folder_name: string;
    description: string | null;
    gradient_color: string;
    created_at: string;
  }>;
}

const PhotoGalleryHeader: React.FC<PhotoGalleryHeaderProps> = ({
  onBack,
  currentFolderName,
  photoCount,
  selectedCount,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  onCreateFolder,
  onMovePhotos,
  onBulkDelete,
  onSelectAll,
  onUnselectAll,
  folders
}) => {
  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case 'date-desc': return 'Date (Newest)';
      case 'date-asc': return 'Date (Oldest)';
      case 'name-asc': return 'Name (A-Z)';
      case 'name-desc': return 'Name (Z-A)';
      case 'size-desc': return 'Size (Largest)';
      case 'size-asc': return 'Size (Smallest)';
      default: return 'Date (Newest)';
    }
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Properties
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-brand-blue">{currentFolderName}</h1>
            <p className="text-gray-600">
              {photoCount} photo{photoCount !== 1 ? 's' : ''}
              {selectedCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedCount} selected
                </Badge>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild className="bg-brand-blue hover:bg-brand-lightBlue">
            <Link to="/photo-upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload Photos
            </Link>
          </Button>
          
          {selectedCount > 0 && (
            <Button onClick={onMovePhotos} variant="outline">
              <Move className="h-4 w-4 mr-2" />
              Move to Folder
            </Button>
          )}

          <div className="flex items-center gap-2">
            <Button 
              onClick={selectedCount === photoCount ? onUnselectAll : onSelectAll} 
              variant="outline" 
              size="sm"
            >
              {selectedCount === photoCount ? (
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
              <Button onClick={onBulkDelete} variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({selectedCount})
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search photos..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                {sortBy.includes('date') && <Calendar className="h-4 w-4" />}
                {sortBy.includes('name') && <Type className="h-4 w-4" />}
                {sortBy.includes('size') && <SortAsc className="h-4 w-4" />}
                Sort: {getSortLabel(sortBy)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onSortChange('date-desc')}>
                <Calendar className="h-4 w-4 mr-2" />
                Date (Newest First)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('date-asc')}>
                <Calendar className="h-4 w-4 mr-2" />
                Date (Oldest First)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onSortChange('name-asc')}>
                <Type className="h-4 w-4 mr-2" />
                Name (A to Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('name-desc')}>
                <Type className="h-4 w-4 mr-2" />
                Name (Z to A)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onSortChange('size-desc')}>
                <SortDesc className="h-4 w-4 mr-2" />
                Size (Largest First)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortChange('size-asc')}>
                <SortAsc className="h-4 w-4 mr-2" />
                Size (Smallest First)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex border rounded-md">
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

export default PhotoGalleryHeader;
