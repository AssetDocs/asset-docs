import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const TrialCTASection: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-primary/10 to-accent/10">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Protect Your Assets?
          </h2>
          <p className="text-xl mb-8 text-muted-foreground max-w-2xl mx-auto">
            Start documenting and securing your valuable possessions today with our comprehensive platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="px-12 py-6 text-lg w-full sm:w-auto">
              <Link to="/signup">Get Started with Asset Safe</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Secure signup • Cancel anytime • No long-term commitment</p>
        </div>
      </div>
    </section>
  );
};

export default TrialCTASection;
