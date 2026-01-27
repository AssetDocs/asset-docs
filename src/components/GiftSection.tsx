import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const GiftSection: React.FC = () => {
  return (
<section className="py-10 bg-gradient-to-r from-brand-blue to-brand-lightBlue">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-white">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎁</span>
            </div>
            <div className="text-left">
              <h2 className="text-xl md:text-2xl font-bold">
                Give the Gift of Protection and Peace of Mind
              </h2>
              <p className="text-sm text-white/90">
                A thoughtful way to help someone stay prepared.
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="bg-white text-brand-blue hover:bg-gray-100 flex-shrink-0">
            <Link to="/gift">Give a Gift Subscription</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default GiftSection;