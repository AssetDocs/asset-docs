import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProperties } from '@/hooks/useProperties';

interface PropertySelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const PropertySelector: React.FC<PropertySelectorProps> = ({ value, onChange, placeholder = "Select property" }) => {
  const { properties, isLoading } = useProperties();

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading properties..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="No properties available" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {properties.map((property) => (
          <SelectItem key={property.id} value={property.id}>
            {property.name} - {property.address}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default PropertySelector;
