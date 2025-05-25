
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ItemTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const ItemTypeSelector: React.FC<ItemTypeSelectorProps> = ({ value, onChange, placeholder = "Select item type" }) => {
  const itemTypes = [
    'Vehicles',
    'Sporting Equipment',
    'Cookware',
    'Clothing & Accessories',
    'Housewares',
    'Furniture',
    'Appliances',
    'Electronics',
    'Jewelry & Watches',
    'Art & Collectibles',
    'Tools & Equipment',
    'Books & Media',
    'Property Upgrades',
    'Other'
  ];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {itemTypes.map((type) => (
          <SelectItem key={type} value={type}>
            {type}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ItemTypeSelector;
