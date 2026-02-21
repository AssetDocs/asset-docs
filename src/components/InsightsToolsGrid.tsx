import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardGridCard } from './DashboardGridCard';
import { useCalendarNotifications } from '@/hooks/useCalendarNotifications';
import {
  Package,
  Hammer,
  Globe,
  Palette,
  CalendarDays,
  StickyNote,
} from 'lucide-react';

interface InsightsToolsGridProps {
  onTabChange: (tab: string) => void;
}

const InsightsToolsGrid: React.FC<InsightsToolsGridProps> = ({ onTabChange }) => {
  const navigate = useNavigate();
  const { todayCount } = useCalendarNotifications();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Insights & Tools</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Manage repairs and organize property details.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Smart Calendar */}
        <DashboardGridCard
          icon={
            <div className="relative">
              <CalendarDays className="h-5 w-5" />
              {todayCount > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold leading-none">
                  {todayCount > 99 ? '99+' : todayCount}
                </span>
              )}
            </div>
          }
          title="Smart Calendar"
          description="Reminders, records, and timelines — all in one place."
          actionLabel="Open Calendar"
          onClick={() => onTabChange('smart-calendar')}
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

        {/* Quick Notes */}
        <DashboardGridCard
          icon={<StickyNote className="h-5 w-5" />}
          title="Quick Notes"
          description="Jot down quick reminders or thoughts."
          actionLabel="View Notes"
          onClick={() => onTabChange('quick-notes')}
          color="teal"
          variant="compact"
        />

      </div>
    </div>
  );
};

export default InsightsToolsGrid;
