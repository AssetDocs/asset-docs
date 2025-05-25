
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PropertyUpgradeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const PropertyUpgradeSelector: React.FC<PropertyUpgradeSelectorProps> = ({ value, onChange, placeholder = "Select upgrade type" }) => {
  const upgradeTypes = [
    'Kitchen Remodel',
    'Bathroom Remodel',
    'Flooring (Tile)',
    'Flooring (Hardwood)',
    'Flooring (Carpet)',
    'Interior Painting',
    'Exterior Painting',
    'Wood Trim & Molding',
    'Solar Panels',
    'HVAC System',
    'Roofing',
    'Windows & Doors',
    'Landscaping',
    'Pool Installation',
    'Deck/Patio',
    'Electrical Upgrades',
    'Plumbing Upgrades',
    'Insulation',
    'Siding',
    'Other Upgrade'
  ];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {upgradeTypes.map((type) => (
          <SelectItem key={type} value={type}>
            {type}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default PropertyUpgradeSelector;
