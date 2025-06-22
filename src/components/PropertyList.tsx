
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, MapPin } from 'lucide-react';

interface Property {
  id: number;
  name: string;
  address: string;
  type: string;
  estimatedValue: number;
}

interface PropertyListProps {
  properties: Property[];
  selectedProperty: Property;
  onPropertySelect: (property: Property) => void;
}

const PropertyList: React.FC<PropertyListProps> = ({
  properties,
  selectedProperty,
  onPropertySelect
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Properties ({properties.length})</h2>
      {properties.map((property) => (
        <Card 
          key={property.id}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedProperty.id === property.id ? 'ring-2 ring-brand-blue' : ''
          }`}
          onClick={() => onPropertySelect(property)}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Home className="h-5 w-5 mr-2 text-brand-blue" />
              {property.name}
            </CardTitle>
            <CardDescription className="flex items-start">
              <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
              {property.address}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>{property.type}</span>
              <Badge variant="secondary">{formatCurrency(property.estimatedValue)}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PropertyList;
