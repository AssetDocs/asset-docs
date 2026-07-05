import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Loader2, Images } from 'lucide-react';
import { usePropertyFiles } from '@/hooks/usePropertyFiles';
import { useNavigate } from 'react-router-dom';

interface PropertyPhotosProps {
  propertyId: string | null;
  onViewPhotoGallery: () => void;
}

const PropertyPhotos: React.FC<PropertyPhotosProps> = ({ propertyId, onViewPhotoGallery }) => {
  const navigate = useNavigate();
  const {
    files: photos,
    isLoading,
  } = usePropertyFiles(propertyId, 'photo');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const openAssetDocumentationUpload = () => {
    navigate('/account?tab=asset-documentation');
  };

  if (!propertyId) {
    return (
      <div className="mt-6 text-center text-gray-500 p-8 border border-dashed rounded-lg">
        <Camera className="h-12 w-12 mx-auto text-gray-300 mb-2" />
        <p>Select a property to view linked photos</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-gray-700">Linked from Asset Documentation</p>
          <p className="text-xs text-gray-500">
            Property Profiles organize what belongs to this property. Uploads are managed in Asset Documentation.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={openAssetDocumentationUpload}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Asset Documentation
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onViewPhotoGallery}
          >
            <Images className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center text-gray-500 p-8 border border-dashed rounded-lg">
          <Camera className="h-12 w-12 mx-auto text-gray-300 mb-2" />
          <p className="mb-4">No photos linked to this property yet.</p>
          <Button onClick={openAssetDocumentationUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Add in Asset Documentation
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.slice(0, 6).map((photo) => (
            <Card key={photo.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-200 flex items-center justify-center relative">
                {photo.file_url ? (
                  <img src={photo.file_url} alt={photo.file_name} className="w-full h-full object-cover" />
                ) : (
                  <Camera className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <CardContent className="p-3">
                <h4 className="font-medium text-sm truncate">{photo.file_name}</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Uploaded {formatDate(photo.created_at)}
                </p>
                <div className="flex gap-2 mt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => window.open(photo.file_url, '_blank')}
                  >
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyPhotos;
