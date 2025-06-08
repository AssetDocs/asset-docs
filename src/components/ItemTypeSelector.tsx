
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ItemTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onCategoryChange?: (category: string) => void;
}

const ItemTypeSelector: React.FC<ItemTypeSelectorProps> = ({ 
  value, 
  onChange, 
  placeholder = "Select item type",
  onCategoryChange 
}) => {
  const itemTypes = [
    { type: 'Motorized Vehicles', category: 'Collectables' },
    { type: 'Watercraft', category: 'Collectables' },
    { type: 'Sporting Equipment', category: 'Collectables' },
    { type: 'Cookware', category: 'Collectables' },
    { type: 'Clothing & Accessories', category: 'Collectables' },
    { type: 'Housewares', category: 'Collectables' },
    { type: 'Furniture', category: 'Collectables' },
    { type: 'Appliances', category: 'Collectables' },
    { type: 'Electronics', category: 'Computer Software' },
    { type: 'Jewelry & Watches', category: 'Collectables' },
    { type: 'Art & Collectibles', category: 'Collectables' },
    { type: 'Tools & Equipment', category: 'Collectables' },
    { type: 'Books & Media', category: 'Books' },
    { type: 'Property Upgrades', category: 'Files' },
    { type: 'Other', category: 'Collectables' }
  ];

  const handleChange = (selectedType: string) => {
    onChange(selectedType);
    
    // Find the corresponding category and update it
    const selectedItem = itemTypes.find(item => item.type === selectedType);
    if (selectedItem && onCategoryChange) {
      onCategoryChange(selectedItem.category);
    }
  };

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {itemTypes.map(({ type }) => (
          <SelectItem key={type} value={type}>
            {type}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ItemTypeSelector;
