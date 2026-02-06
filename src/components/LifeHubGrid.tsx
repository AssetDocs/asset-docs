import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardGridCard } from './DashboardGridCard';
import { Card, CardContent } from '@/components/ui/card';
import {
  Contact,
  Mic,
  Briefcase,
  BookOpen,
  ChefHat,
  Construction,
} from 'lucide-react';

interface LifeHubGridProps {
  onTabChange: (tab: string) => void;
}

const LifeHubGrid: React.FC<LifeHubGridProps> = ({ onTabChange }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Life Hub</h2>
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
        <Card className="border-l-4 border-l-rose-500 bg-white hover:shadow-lg transition-all cursor-pointer opacity-90">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-5 w-5 text-rose-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-foreground">Notes & Traditions</h3>
                  <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-medium">Coming Soon</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Capture family traditions, stories, and important notes.
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Construction className="h-3.5 w-3.5" />
              <span>This feature is being built</span>
            </div>
          </CardContent>
        </Card>

        {/* Family Recipes */}
        <Card className="border-l-4 border-l-rose-500 bg-white hover:shadow-lg transition-all cursor-pointer opacity-90">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <ChefHat className="h-5 w-5 text-rose-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-foreground">Family Recipes</h3>
                  <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-medium">Coming Soon</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Preserve cherished family recipes for generations.
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Construction className="h-3.5 w-3.5" />
              <span>This feature is being built</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LifeHubGrid;
