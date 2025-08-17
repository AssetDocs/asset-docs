
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Video,
  Play,
  Eye,
  Download,
  Clock,
  HardDrive
} from 'lucide-react';

interface VideoData {
  id: number;
  name: string;
  filename: string;
  url: string;
  duration: string;
  uploadDate: string;
  size: string;
  propertyId: number;
  propertyName: string;
  folderId: number | null;
  tags: string[];
}

type ViewMode = 'grid' | 'list';

interface VideoGalleryGridProps {
  videos: VideoData[];
  viewMode: ViewMode;
  selectedVideos: number[];
  onVideoSelect: (videoId: number) => void;
}

const VideoGalleryGrid: React.FC<VideoGalleryGridProps> = ({
  videos,
  viewMode,
  selectedVideos,
  onVideoSelect
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (videos.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center text-gray-500">
          <Video className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">No videos found</h3>
          <p className="text-sm">Upload some videos to get started</p>
        </div>
      </Card>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-2">
        {videos.map((video) => (
          <Card key={video.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={selectedVideos.includes(video.id)}
                  onCheckedChange={() => onVideoSelect(video.id)}
                />
                
                <div className="w-16 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Play className="h-6 w-6 text-gray-400" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{video.name}</h4>
                  <p className="text-xs text-gray-500 truncate">{video.filename}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {video.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3" />
                      {video.size}
                    </span>
                    <span>Uploaded {formatDate(video.uploadDate)}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="outline" className="text-xs">
                    {video.propertyName}
                  </Badge>
                   <div className="flex gap-1">
                     <Button 
                       size="sm" 
                       variant="outline" 
                       className="h-7 px-2"
                       onClick={() => window.open(video.url, '_blank')}
                     >
                       <Eye className="h-3 w-3" />
                     </Button>
                     <Button 
                       size="sm" 
                       variant="outline" 
                       className="h-7 px-2"
                       onClick={() => {
                         const link = document.createElement('a');
                         link.href = video.url;
                         link.download = video.filename;
                         document.body.appendChild(link);
                         link.click();
                         document.body.removeChild(link);
                       }}
                     >
                       <Download className="h-3 w-3" />
                     </Button>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((video) => (
        <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative aspect-video bg-gray-200 flex items-center justify-center">
            <Play className="h-12 w-12 text-gray-400" />
            <div className="absolute top-2 left-2">
              <Checkbox
                checked={selectedVideos.includes(video.id)}
                onCheckedChange={() => onVideoSelect(video.id)}
                className="bg-white"
              />
            </div>
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
              {video.duration}
            </div>
          </div>
          
          <CardContent className="p-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm line-clamp-2">{video.name}</h4>
              <p className="text-xs text-gray-500 truncate">{video.filename}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{video.size}</span>
                <span>{formatDate(video.uploadDate)}</span>
              </div>
              
              <Badge variant="outline" className="text-xs">
                {video.propertyName}
              </Badge>
              
              <div className="flex gap-2 mt-3">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => window.open(video.url, '_blank')}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Watch
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = video.url;
                              link.download = video.filename;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                          >
                            <Download className="h-3 w-3 mr-1" />
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

export default VideoGalleryGrid;
