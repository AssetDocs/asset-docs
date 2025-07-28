import React from 'react';
import FeaturedGuideShortcut from './FeaturedGuideShortcut';
import SocialImpactShortcut from './SocialImpactShortcut';

const FeaturedSection: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-brand-blue/5 to-brand-orange/5">
      <div className="container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FeaturedGuideShortcut />
            <SocialImpactShortcut />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;