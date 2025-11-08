import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { Property } from '@/services/PropertyService';

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
      </div>
    </CardHeader>
  );
};

export default PropertyHeader;
