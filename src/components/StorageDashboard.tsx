import React from 'react';
import StorageQuotaCard from './StorageQuotaCard';
import StorageBreakdownCard from './StorageBreakdownCard';

interface StorageDashboardProps {
  className?: string;
}

const StorageDashboard: React.FC<StorageDashboardProps> = ({ className }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid gap-6 md:grid-cols-2">
        <StorageQuotaCard />
        <StorageBreakdownCard />
      </div>
    </div>
  );
};

export default StorageDashboard;