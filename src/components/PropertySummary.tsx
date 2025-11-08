import React from 'react';
import PropertyTabs from './PropertyTabs';

interface PropertySummaryProps {
  propertyId: string;
}

const PropertySummary: React.FC<PropertySummaryProps> = ({ propertyId }) => {
  return (
    <div>
      <PropertyTabs propertyId={propertyId} />
    </div>
  );
};

export default PropertySummary;
