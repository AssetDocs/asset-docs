import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardGridCard } from './DashboardGridCard';
import {
  DollarSign,
  Package,
  Hammer,
  Globe,
  Palette,
} from 'lucide-react';

interface InsightsToolsGridProps {
  onTabChange: (tab: string) => void;
}

const InsightsToolsGrid: React.FC<InsightsToolsGridProps> = ({ onTabChange }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Insights & Tools</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Track values, manage repairs, and organize property details.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Asset Values */}
        <DashboardGridCard
          icon={<DollarSign className="h-5 w-5" />}
          title="Asset Values"
          description="Track the estimated value of your documented assets."
          actionLabel="View Values"
          onClick={() => onTabChange('asset-values')}
          color="teal"
          variant="compact"
        />

        {/* Manual Entry Items */}
        <DashboardGridCard
          icon={<Package className="h-5 w-5" />}
          title="Manual Entry Items"
          description="Add items manually with descriptions and values."
          actionLabel="Manage Items"
          onClick={() => navigate('/inventory')}
          color="teal"
          variant="compact"
        />

        {/* Upgrades & Repairs */}
        <DashboardGridCard
          icon={<Hammer className="h-5 w-5" />}
          title="Upgrades & Repairs"
          description="Document property improvements and repair history."
          actionLabel="View Projects"
          onClick={() => onTabChange('upgrades-repairs')}
          color="teal"
          variant="compact"
        />

        {/* Source Websites */}
        <DashboardGridCard
          icon={<Globe className="h-5 w-5" />}
          title="Source Websites"
          description="Save product sources and reference links."
          actionLabel="View Sources"
          onClick={() => onTabChange('source-websites')}
          color="teal"
          variant="compact"
        />

        {/* Paint Codes */}
        <DashboardGridCard
          icon={<Palette className="h-5 w-5" />}
          title="Paint Codes"
          description="Store paint colors, brands, and finish details."
          actionLabel="View Paint Codes"
          onClick={() => onTabChange('paint-codes')}
          color="teal"
          variant="compact"
        />
      </div>
    </div>
  );
};

export default InsightsToolsGrid;
