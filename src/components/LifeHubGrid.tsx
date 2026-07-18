import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardGridCard } from './DashboardGridCard';
import {
  Contact,
  Mic,
  Briefcase,
  BookOpen,
  ChefHat,
  Archive,
  Pill,
  MapPin,
} from 'lucide-react';

interface LifeHubGridProps {
  onTabChange: (tab: string) => void;
}

const LifeHubGrid: React.FC<LifeHubGridProps> = ({ onTabChange }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Family Archive</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Contacts · Notes · Records · Memories
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* VIP Contacts */}
        <DashboardGridCard
          icon={<Contact className="h-5 w-5" />}
          title="VIP Contacts"
          description="Your most important contacts with priority levels."
          actionLabel="View Contacts"
          onClick={() => navigate('/account/contacts')}
          color="rose"
          variant="compact"
        />

        {/* Voice Notes */}
        <DashboardGridCard
          icon={<Mic className="h-5 w-5" />}
          title="Voice Notes"
          description="Record and store voice memos for your records."
          actionLabel="Voice Notes"
          onClick={() => onTabChange('voice-notes')}
          color="rose"
          variant="compact"
        />

        {/* Trusted Professionals */}
        <DashboardGridCard
          icon={<Briefcase className="h-5 w-5" />}
          title="Trusted Professionals"
          description="Track your trusted service providers and contractors."
          actionLabel="View Pros"
          onClick={() => onTabChange('service-pros')}
          color="rose"
          variant="compact"
        />

        {/* Notes & Traditions */}
        <DashboardGridCard
          icon={<BookOpen className="h-5 w-5" />}
          title="Notes & Traditions"
          description="Capture family traditions, stories, and important notes."
          actionLabel="View Notes"
          onClick={() => onTabChange('notes-traditions')}
          color="rose"
          variant="compact"
        />

        {/* Family Recipes */}
        <DashboardGridCard
          icon={<ChefHat className="h-5 w-5" />}
          title="Family Recipes"
          description="Preserve cherished family recipes for generations."
          actionLabel="View Recipes"
          onClick={() => onTabChange('family-recipes')}
          color="rose"
          variant="compact"
        />

        {/* Medication List */}
        <DashboardGridCard
          icon={<Pill className="h-5 w-5" />}
          title="Medication List"
          description="Keep a simple family-reference list of medications and pharmacies."
          actionLabel="View List"
          onClick={() => onTabChange('medication-list')}
          color="rose"
          variant="compact"
        />

        {/* Important Locations */}
        <DashboardGridCard
          icon={<MapPin className="h-5 w-5" />}
          title="Important Locations"
          description="Record where important documents, keys, keepsakes, and physical items are stored."
          actionLabel="View Locations"
          onClick={() => onTabChange('important-locations')}
          color="rose"
          variant="compact"
        />

        {/* Memory Safe */}
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
    </div>
  );
};

export default LifeHubGrid;
