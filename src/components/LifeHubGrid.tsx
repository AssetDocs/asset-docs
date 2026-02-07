import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardGridCard } from './DashboardGridCard';
import {
  Contact,
  Mic,
  Briefcase,
  BookOpen,
  ChefHat,
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
          Everyday life, organized and protected.
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
      </div>
    </div>
  );
};

export default LifeHubGrid;
