
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Video, FileText, FileImage } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PropertyPhotos from './PropertyPhotos';
import PropertyVideos from './PropertyVideos';
import PropertyDocuments from './PropertyDocuments';
import PropertyFloorPlans from './PropertyFloorPlans';

interface PropertyTabsProps {
  propertyId: string;
}

const PropertyTabs: React.FC<PropertyTabsProps> = ({ propertyId }) => {
  const navigate = useNavigate();

  const handleViewPhotoGallery = () => {
    navigate('/account/photos');
  };

  return (
    <Tabs defaultValue="photos" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="photos" className="flex items-center">
          <Camera className="h-4 w-4 mr-1" />
          Photos
        </TabsTrigger>
        <TabsTrigger value="videos" className="flex items-center">
          <Video className="h-4 w-4 mr-1" />
          Videos
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex items-center">
          <FileText className="h-4 w-4 mr-1" />
          Documents
        </TabsTrigger>
        <TabsTrigger value="floorplans" className="flex items-center">
          <FileImage className="h-4 w-4 mr-1" />
          Floor Plans
        </TabsTrigger>
      </TabsList>

      <TabsContent value="photos">
        <PropertyPhotos propertyId={propertyId} onViewPhotoGallery={handleViewPhotoGallery} />
      </TabsContent>

      <TabsContent value="videos">
        <PropertyVideos propertyId={propertyId} />
      </TabsContent>

      <TabsContent value="documents">
        <PropertyDocuments propertyId={propertyId} />
      </TabsContent>

      <TabsContent value="floorplans">
        <PropertyFloorPlans propertyId={propertyId} />
      </TabsContent>
    </Tabs>
  );
};

export default PropertyTabs;
