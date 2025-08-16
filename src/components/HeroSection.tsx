
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
            <h1 className="text-xl md:text-2xl font-bold mb-4 animate-fade-in">
              Your Digital Safety Net for Asset Protection & Unexpected Events
            </h1>
            <p className="text-lg font-semibold mb-6 animate-fade-in text-white/90 italic">
              The Trusted Standard in Property Protection
            </p>
            <p className="text-xl mb-4 animate-slide-up opacity-90">
              Secure, third-party documentation that helps you prepare for insurance claims, legal events, life transitions, and more.
            </p>
            <p className="text-lg mb-8 animate-slide-up opacity-80 font-bold">
              Trusted by thousands of homeowners, landlords, and businesses - providing control, protection, and peace of mind.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-slide-up">
              <Button asChild size="lg" className="bg-white text-orange-500 hover:bg-gray-100">
                <a href="https://asset-docs.outseta.com/auth?widgetMode=register#o-anonymous">Start Your Free 30-Day Trial</a>
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
          
          {/* YouTube Video */}
          <div className="lg:w-1/3">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 animate-fade-in">
              <div className="aspect-video">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src="https://www.youtube.com/embed/8aXCzo6Tetw?si=BCmMQldHv20Tucz1&controls=0" 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin" 
                  allowFullScreen
                  className="w-full h-full rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
