
import React from 'react';
import { Button } from '@/components/ui/button';
import ShareButton from '@/components/ShareButton';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <section className="hero-gradient text-white py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="lg:w-2/3 mb-10 lg:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 animate-fade-in">
              Your Digital Safety Net for Asset Protection & Unexpected Events
            </h1>
            <p className="text-xl mb-4 animate-slide-up opacity-90">
              Secure, third-party documentation that helps you prepare for insurance claims, legal events, life transitions, and more.
            </p>
            <p className="text-lg mb-8 animate-slide-up opacity-80 font-bold">
              Trusted by thousands of homeowners, landlords, and businesses - providing control, protection, and peace of mind.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-slide-up">
              <Button asChild size="lg" className="bg-white text-orange-500 hover:bg-gray-100">
                <Link to="/pricing">Start Your Free 30-Day Trial</Link>
              </Button>
              <Button asChild size="lg" className="bg-white text-brand-blue hover:bg-gray-100">
                <Link to="/sample-dashboard">View Sample Dashboard</Link>
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
          
          {/* Gift Invitation Box */}
          <div className="lg:w-1/3">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 text-center animate-fade-in">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-3">
                  <span className="text-2xl">🎁</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">
                Give the Gift of Protection and Peace of Mind
              </h3>
              <p className="text-white/80 mb-4 text-sm">
                Share the security of comprehensive asset documentation with someone you care about.
              </p>
              <Button asChild className="bg-white text-brand-blue hover:bg-gray-100 w-full">
                <Link to="/gift">Give a Gift Subscription</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
