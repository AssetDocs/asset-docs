import React from 'react';
import { DashboardGridCard } from '@/components/DashboardGridCard';
import { Sparkles, ChefHat } from 'lucide-react';

interface TraditionsRecipesHubProps {
  onTabChange: (tab: string) => void;
}

/** Navigation-only wrapper: renders choices, fetches and mutates nothing. */
const TraditionsRecipesHub: React.FC<TraditionsRecipesHubProps> = ({ onTabChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Family Traditions &amp; Recipes</h2>
        <p className="text-muted-foreground text-sm mt-1">
          The customs and cooking you want remembered.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardGridCard
          icon={<Sparkles className="h-5 w-5" />}
          title="Family Traditions"
          description="Preserve family traditions, stories, and customs."
          actionLabel="View Traditions"
          onClick={() => onTabChange('family-traditions')}
          color="rose"
          variant="compact"
        />
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

export default TraditionsRecipesHub;
