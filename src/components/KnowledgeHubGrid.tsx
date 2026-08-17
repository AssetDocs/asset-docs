import React from 'react';
import { DashboardGridCard } from './DashboardGridCard';
import { useCalendarNotifications } from '@/hooks/useCalendarNotifications';
import {
  Contact,
  Pill,
  BookOpen,
  Sparkles,
  Archive,
  MapPin,
  Palette,
  Hammer,
  Globe,
  CalendarDays,
} from 'lucide-react';

interface KnowledgeHubGridProps {
  onTabChange: (tab: string) => void;
}

const KnowledgeHubGrid: React.FC<KnowledgeHubGridProps> = ({ onTabChange }) => {
  const { todayCount } = useCalendarNotifications();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Knowledge Hub</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Contacts · Notes · Property Details · Records · Memories
        </p>
      </div>

      {/* People & Care */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">People &amp; Care</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashboardGridCard
            icon={<Contact className="h-5 w-5" />}
            title="Contacts"
            description="VIP contacts and trusted professionals."
            actionLabel="Open Contacts"
            onClick={() => onTabChange('contacts')}
            color="rose"
            variant="compact"
          />
          <DashboardGridCard
            icon={<Pill className="h-5 w-5" />}
            title="Medication List"
            description="Keep a simple family-reference list of medications and pharmacies."
            actionLabel="View List"
            onClick={() => onTabChange('medication-list')}
            color="rose"
            variant="compact"
          />
        </div>
      </section>

      {/* Notes & Family */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes &amp; Family</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashboardGridCard
            icon={<BookOpen className="h-5 w-5" />}
            title="Notes"
            description="Written notes and voice notes, kept together."
            actionLabel="Open Notes"
            onClick={() => onTabChange('notes-hub')}
            color="rose"
            variant="compact"
          />
          <DashboardGridCard
            icon={<Sparkles className="h-5 w-5" />}
            title="Family Traditions & Recipes"
            description="Preserve traditions, stories, and cherished recipes."
            actionLabel="Open Traditions & Recipes"
            onClick={() => onTabChange('traditions-recipes')}
            color="rose"
            variant="compact"
          />
          <DashboardGridCard
            icon={<Archive className="h-5 w-5" />}
            title="Memory Safe"
            description="A protected place for the memories you want to keep — and pass on."
            actionLabel="Open Memory Safe"
            onClick={() => onTabChange('memory-safe')}
            color="rose"
            variant="compact"
          />
        </div>
      </section>

      {/* Property & Household */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Property &amp; Household</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashboardGridCard
            icon={<MapPin className="h-5 w-5" />}
            title="Important Locations"
            description="Record where important documents, keys, keepsakes, and physical items are stored."
            actionLabel="View Locations"
            onClick={() => onTabChange('important-locations')}
            color="teal"
            variant="compact"
          />
          <DashboardGridCard
            icon={<Palette className="h-5 w-5" />}
            title="Paint Codes"
            description="Store paint colors, brands, and finish details."
            actionLabel="View Paint Codes"
            onClick={() => onTabChange('paint-codes')}
            color="teal"
            variant="compact"
          />
          <DashboardGridCard
            icon={<Hammer className="h-5 w-5" />}
            title="Upgrades & Repairs"
            description="Document property improvements and repair history."
            actionLabel="View Projects"
            onClick={() => onTabChange('upgrades-repairs')}
            color="teal"
            variant="compact"
          />
          <DashboardGridCard
            icon={<Globe className="h-5 w-5" />}
            title="Source Websites"
            description="Save product sources and reference links."
            actionLabel="View Sources"
            onClick={() => onTabChange('source-websites')}
            color="teal"
            variant="compact"
          />
        </div>
      </section>

      {/* Planning */}
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Planning</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </div>
      </section>
    </div>
  );
};

export default KnowledgeHubGrid;
