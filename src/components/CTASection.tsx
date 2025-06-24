
import React from 'react';
import { Button } from '@/components/ui/button';
import ShareButton from '@/components/ShareButton';
import { Link } from 'react-router-dom';

const CTASection: React.FC = () => {
  return (
    <section className="py-20 bg-brand-blue text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Secure Your Property Documentation?</h2>
        <p className="text-xl mb-8 max-w-3xl mx-auto">
          Get started today and experience the peace of mind that comes with comprehensive asset protection.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" className="bg-white text-brand-blue hover:bg-gray-100">
            <Link to="/signup">Start Your Free 30-Day Trial</Link>
          </Button>
          <ShareButton 
            variant="outline" 
            size="lg" 
            className="bg-transparent border-white text-white hover:bg-white/10"
          />
        </div>
        <p className="mt-4 text-sm opacity-90">No credit card required. Cancel anytime.</p>
      </div>
    </section>
  );
};

export default CTASection;
