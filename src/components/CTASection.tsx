import React from 'react';
import { Button } from '@/components/ui/button';
import ShareButton from '@/components/ShareButton';
import { Link } from 'react-router-dom';

const CTASection: React.FC = () => {
  return (
    <section className="py-20 bg-brand-blue text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">After damage happens, you won't remember what you owned — but Asset Safe will.</h2>
        <p className="text-lg md:text-xl mb-8">
          Get started today and experience the peace of mind that comes with comprehensive asset protection.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" className="bg-white text-orange-500 hover:bg-gray-100 w-full sm:w-auto">
            <Link to="/signup">Start Documenting</Link>
          </Button>
          <ShareButton 
            variant="outline" 
            size="lg" 
            className="bg-transparent border-white text-white hover:bg-white/10 w-full sm:w-auto"
          />
        </div>
        <p className="mt-4 text-sm opacity-90">Secure signup • Cancel anytime • No long-term commitment</p>
      </div>
    </section>
  );
};

export default CTASection;
