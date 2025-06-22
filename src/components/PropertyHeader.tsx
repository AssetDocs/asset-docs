
import React from 'react';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, MapPin } from 'lucide-react';

interface Property {
  id: number;
  name: string;
  address: string;
}

interface PropertyHeaderProps {
  property: Property;
}

const PropertyHeader: React.FC<PropertyHeaderProps> = ({ property }) => {
  return (
    <CardHeader>
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-2xl text-brand-blue">{property.name}</CardTitle>
          <CardDescription className="flex items-center mt-2">
            <MapPin className="h-4 w-4 mr-1" />
            {property.address}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit Property
        </Button>
      </div>
    </CardHeader>
  );
};

export default PropertyHeader;
