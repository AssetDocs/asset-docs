
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PropertySelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const PropertySelector: React.FC<PropertySelectorProps> = ({ value, onChange, placeholder = "Select property" }) => {
  // Mock properties - in production, these would come from the user's actual properties
  const properties = [
    { id: '1', name: 'Main Residence - 123 Oak Street' },
    { id: '2', name: 'Vacation Home - 456 Pine Avenue' },
    { id: '3', name: 'Rental Property - 789 Maple Drive' },
  ];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {properties.map((property) => (
          <SelectItem key={property.id} value={property.id}>
            {property.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default PropertySelector;
