import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Upload, Loader2 } from 'lucide-react';
import { usePropertyFiles } from '@/hooks/usePropertyFiles';
import { useNavigate } from 'react-router-dom';

interface PropertyVideosProps {
  propertyId: string | null;
}

const PropertyVideos: React.FC<PropertyVideosProps> = ({ propertyId }) => {
  const navigate = useNavigate();
  const {
    files: videos,
    isLoading,
  } = usePropertyFiles(propertyId, 'video');

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
        <Video className="h-12 w-12 mx-auto text-gray-300 mb-2" />
        <p>Select a property to view linked videos</p>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <p className="text-sm font-medium text-gray-700">Linked from Asset Documentation</p>
          <p className="text-xs text-gray-500">
            Property Profiles organize what belongs to this property. Uploads are managed in Asset Documentation.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={openAssetDocumentationUpload}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Asset Documentation
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center text-gray-500 p-8 border border-dashed rounded-lg">
          <Video className="h-12 w-12 mx-auto text-gray-300 mb-2" />
          <p className="mb-4">No videos linked to this property yet.</p>
          <Button onClick={openAssetDocumentationUpload}>
            <Upload className="h-4 w-4 mr-2" />
            Add in Asset Documentation
          </Button>
        </div>
      ) : null}
      
      {videos.map((video) => (
        <Card key={video.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                  <Video className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <h4 className="font-medium truncate">{video.file_name}</h4>
                  <p className="text-sm text-gray-500">
                    Uploaded {formatDate(video.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(video.file_url, '_blank')}
                >
                  Watch
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PropertyVideos;
