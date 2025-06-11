
import React from 'react';
import { Button } from '@/components/ui/button';
import ShareButton from '@/components/ShareButton';
import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <section className="hero-gradient text-white py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-full mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
              Your Digital Safety Net for Asset Protection
            </h1>
            <p className="text-xl mb-8 animate-slide-up opacity-90">
              Secure documentation of your property and possessions with professional-grade tools and third-party verification.
            </p>
            
            {/* Platform Clarification */}
            <div className="mb-8 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 animate-slide-up">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white mb-1">Asset Documentation Platform</p>
                  <p className="text-xs text-white/80">
                    AssetDocs is designed for property documentation and insurance protection, not inventory management or business operations.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-slide-up">
              <Button asChild size="lg" className="bg-white text-brand-blue hover:bg-gray-100">
                <Link to="/signup">Start Your Free Trial</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                <Link to="/features">Learn More</Link>
              </Button>
              <ShareButton 
                variant="outline" 
                size="lg" 
                className="bg-transparent border-white text-white hover:bg-white/10"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
