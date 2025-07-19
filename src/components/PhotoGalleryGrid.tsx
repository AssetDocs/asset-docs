
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Camera,
  Eye,
  Download,
  Calendar,
  HardDrive,
  Trash2
} from 'lucide-react';

type ViewMode = 'grid' | 'list';

interface Photo {
  id: number;
  name: string;
  filename: string;
  url: string;
  uploadDate: string;
  size: string;
  propertyId: number;
  propertyName: string;
  folderId: number | null;
  tags: string[];
}

interface PhotoGalleryGridProps {
  photos: Photo[];
  viewMode: ViewMode;
  selectedPhotos: number[];
  onPhotoSelect: (photoId: number) => void;
  onDeletePhoto: (photoId: number) => void;
}

const PhotoGalleryGrid: React.FC<PhotoGalleryGridProps> = ({
  photos,
  viewMode,
  selectedPhotos,
  onPhotoSelect,
  onDeletePhoto
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (photos.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-600 mb-2">No photos found</h3>
        <p className="text-gray-500">Try adjusting your search or filter criteria</p>
      </Card>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {photos.map((photo) => (
          <Card key={photo.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={selectedPhotos.includes(photo.id)}
                  onCheckedChange={() => onPhotoSelect(photo.id)}
                />
                
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Camera className="h-6 w-6 text-gray-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-lg truncate">{photo.name}</h4>
                  <p className="text-sm text-gray-500 truncate">{photo.filename}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(photo.uploadDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3" />
                      {photo.size}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {photo.propertyName}
                    </Badge>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {photo.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => onDeletePhoto(photo.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <Card key={photo.id} className="overflow-hidden group">
          <div className="relative">
            <div className="aspect-square bg-gray-200 flex items-center justify-center">
              <Camera className="h-12 w-12 text-gray-400" />
            </div>
            
            <div className="absolute top-2 left-2">
              <Checkbox
                checked={selectedPhotos.includes(photo.id)}
                onCheckedChange={() => onPhotoSelect(photo.id)}
                className="bg-white/80 border-white"
              />
            </div>

            <div className="absolute bottom-2 right-2">
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => onDeletePhoto(photo.id)}
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button size="sm" variant="secondary">
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button size="sm" variant="secondary">
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>
          
          <CardContent className="p-3">
            <h4 className="font-medium text-sm truncate mb-1">{photo.name}</h4>
            <p className="text-xs text-gray-500 truncate mb-2">{photo.filename}</p>
            
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>{formatDate(photo.uploadDate)}</span>
              <span>{photo.size}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs truncate max-w-[120px]">
                {photo.propertyName}
              </Badge>
            </div>
            
            <div className="flex gap-1 mt-2 flex-wrap">
              {photo.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {photo.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{photo.tags.length - 2}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PhotoGalleryGrid;
