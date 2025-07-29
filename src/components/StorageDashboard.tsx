import React from 'react';
import StorageQuotaCard from './StorageQuotaCard';
import StorageBreakdownCard from './StorageBreakdownCard';

interface StorageDashboardProps {
  className?: string;
}

const StorageDashboard: React.FC<StorageDashboardProps> = ({ className }) => {
  return (
    <div className={`grid gap-6 md:grid-cols-2 ${className}`}>
      <StorageQuotaCard />
      <StorageBreakdownCard />
    </div>
  );
};

export default StorageDashboard;