
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Eye, Download, Images } from 'lucide-react';

interface Photo {
  id: number;
  name: string;
  url: string;
  uploadDate: string;
}

interface PropertyPhotosProps {
  photos: Photo[];
  onViewPhotoGallery: () => void;
}

const PropertyPhotos: React.FC<PropertyPhotosProps> = ({ photos, onViewPhotoGallery }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="mt-6">
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">Preview of recent photos for this property</p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onViewPhotoGallery}
        >
          <Images className="h-4 w-4 mr-2" />
          View All Photos
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <Card key={photo.id} className="overflow-hidden">
            <div className="aspect-video bg-gray-200 flex items-center justify-center">
              <Camera className="h-8 w-8 text-gray-400" />
            </div>
            <CardContent className="p-3">
              <h4 className="font-medium text-sm">{photo.name}</h4>
              <p className="text-xs text-gray-500 mt-1">
                Uploaded {formatDate(photo.uploadDate)}
              </p>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PropertyPhotos;
