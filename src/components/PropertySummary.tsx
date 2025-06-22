
import React from 'react';

interface Property {
  squareFootage: number;
  yearBuilt: number;
  estimatedValue: number;
  lastUpdated: string;
}

interface PropertySummaryProps {
  property: Property;
}

const PropertySummary: React.FC<PropertySummaryProps> = ({ property }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="text-2xl font-bold text-brand-blue">{property.squareFootage.toLocaleString()}</div>
        <div className="text-sm text-gray-600">Sq Ft</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-brand-blue">{property.yearBuilt}</div>
        <div className="text-sm text-gray-600">Year Built</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-brand-blue">{formatCurrency(property.estimatedValue)}</div>
        <div className="text-sm text-gray-600">Est. Value</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-brand-blue">{formatDate(property.lastUpdated)}</div>
        <div className="text-sm text-gray-600">Last Updated</div>
      </div>
    </div>
  );
};

export default PropertySummary;
