
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Eye, Download } from 'lucide-react';

interface VideoItem {
  id: number;
  name: string;
  duration: string;
  uploadDate: string;
}

interface PropertyVideosProps {
  videos: VideoItem[];
}

const PropertyVideos: React.FC<PropertyVideosProps> = ({ videos }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="mt-6 space-y-4">
      {videos.map((video) => (
        <Card key={video.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                  <Video className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <h4 className="font-medium">{video.name}</h4>
                  <p className="text-sm text-gray-500">
                    Duration: {video.duration} • Uploaded {formatDate(video.uploadDate)}
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
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PropertyVideos;
