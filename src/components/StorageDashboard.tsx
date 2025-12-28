import React, { useState } from 'react';
import StorageQuotaCard from './StorageQuotaCard';
import StorageBreakdownCard from './StorageBreakdownCard';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, HardDrive } from 'lucide-react';

interface StorageDashboardProps {
  className?: string;
}

const StorageDashboard: React.FC<StorageDashboardProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
      <div className="flex items-center justify-between p-4 bg-card border rounded-lg">
        <div className="flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-brand-blue" />
          <h3 className="font-semibold text-lg">Storage Usage</h3>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            {isOpen ? (
              <>
                <span className="mr-2 text-sm">Hide Details</span>
                <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                <span className="mr-2 text-sm">Show Details</span>
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mt-4">
        <div className="grid gap-6 md:grid-cols-2">
          <StorageQuotaCard />
          <StorageBreakdownCard />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default StorageDashboard;
