
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileImage, Eye, Download } from 'lucide-react';

interface FloorPlan {
  id: number;
  name: string;
  uploadDate: string;
}

interface PropertyFloorPlansProps {
  floorPlans: FloorPlan[];
}

const PropertyFloorPlans: React.FC<PropertyFloorPlansProps> = ({ floorPlans }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {floorPlans.map((floorPlan) => (
        <Card key={floorPlan.id} className="overflow-hidden">
          <div className="aspect-video bg-gray-200 flex items-center justify-center">
            <FileImage className="h-8 w-8 text-gray-400" />
          </div>
          <CardContent className="p-3">
            <h4 className="font-medium text-sm">{floorPlan.name}</h4>
            <p className="text-xs text-gray-500 mt-1">
              Uploaded {formatDate(floorPlan.uploadDate)}
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
  );
};

export default PropertyFloorPlans;
