
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Video, FileText, FileImage } from 'lucide-react';
import PropertyPhotos from './PropertyPhotos';
import PropertyVideos from './PropertyVideos';
import PropertyDocuments from './PropertyDocuments';
import PropertyFloorPlans from './PropertyFloorPlans';

interface Photo {
  id: number;
  name: string;
  url: string;
  uploadDate: string;
}

interface VideoItem {
  id: number;
  name: string;
  duration: string;
  uploadDate: string;
}

interface Document {
  id: number;
  name: string;
  type: string;
  uploadDate: string;
}

interface FloorPlan {
  id: number;
  name: string;
  uploadDate: string;
}

interface PropertyTabsProps {
  photos: Photo[];
  videos: VideoItem[];
  documents: Document[];
  floorPlans: FloorPlan[];
  onViewPhotoGallery: () => void;
}

const PropertyTabs: React.FC<PropertyTabsProps> = ({
  photos,
  videos,
  documents,
  floorPlans,
  onViewPhotoGallery
}) => {
  return (
    <Tabs defaultValue="photos" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="photos" className="flex items-center">
          <Camera className="h-4 w-4 mr-1" />
          Photos ({photos.length})
        </TabsTrigger>
        <TabsTrigger value="videos" className="flex items-center">
          <Video className="h-4 w-4 mr-1" />
          Videos ({videos.length})
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex items-center">
          <FileText className="h-4 w-4 mr-1" />
          Documents ({documents.length})
        </TabsTrigger>
        <TabsTrigger value="floorplans" className="flex items-center">
          <FileImage className="h-4 w-4 mr-1" />
          Floor Plans ({floorPlans.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="photos">
        <PropertyPhotos photos={photos} onViewPhotoGallery={onViewPhotoGallery} />
      </TabsContent>

      <TabsContent value="videos">
        <PropertyVideos videos={videos} />
      </TabsContent>

      <TabsContent value="documents">
        <PropertyDocuments documents={documents} />
      </TabsContent>

      <TabsContent value="floorplans">
        <PropertyFloorPlans floorPlans={floorPlans} />
      </TabsContent>
    </Tabs>
  );
};

export default PropertyTabs;
