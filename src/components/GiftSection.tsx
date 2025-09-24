import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const GiftSection: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-brand-blue to-brand-lightBlue">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
              <span className="text-3xl">🎁</span>
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Give the Gift of Protection and Peace of Mind
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Share the security of comprehensive asset documentation with someone you care about. 
            Perfect for new homeowners, growing families, or anyone who values protection.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-brand-blue hover:bg-gray-100">
              <Link to="/gift">Give a Gift Subscription</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GiftSection;