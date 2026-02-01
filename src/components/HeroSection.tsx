
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
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-fade-in text-white">
              Everything you own.<br />Protected in one place.
            </h1>
            <p className="text-xl mb-4 animate-slide-up text-white/85">
              Document your home, belongings, and important records—so you're prepared for the unexpected.
            </p>
            <p className="text-lg mb-4 animate-slide-up text-white/70">
              Secure inventory, insurance-ready documentation, and legacy planning tools.
            </p>
            
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 animate-slide-up">
              <Button asChild size="lg" className="bg-white text-orange-500 hover:bg-gray-100">
                <Link to="/signup">Start Documenting</Link>
              </Button>
              <Button asChild size="lg" className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold border-2 border-white/30">
                <Link to="/sample-dashboard">View Sample Dashboard</Link>
              </Button>
            </div>
            
          </div>
          
          {/* YouTube Video */}
          <div className="lg:w-1/3 lg:self-start lg:mt-4">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 animate-fade-in">
              <div className="aspect-video">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src="https://www.youtube.com/embed/-ok43t_aGgs?controls=0"
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
