
import React from 'react';
import { Button } from '@/components/ui/button';
import ShareButton from '@/components/ShareButton';
import { Link } from 'react-router-dom';
import introVideo from '@/assets/asset-safe-intro.mp4.asset.json';
import introPoster from '@/assets/asset-safe-intro-poster.jpg.asset.json';


const HeroSection: React.FC = () => {
  return (
    <section className="hero-gradient text-white py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="lg:w-2/3 mb-10 lg:mb-0">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 animate-fade-in text-white">
              Everything you own.<br />Protected in one place.
            </h1>
            <p className="text-lg md:text-xl mb-4 animate-fade-in text-white/75 font-medium">
              Your family's assets — secured today, ready when it matters most.
            </p>
            <p className="text-xl mb-4 animate-slide-up text-white/85">
              Capture, organize, and protect — all in one system, so you're ready when it counts.
            </p>
            
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 animate-slide-up">
              <Button asChild size="lg" className="bg-white text-orange-500 hover:bg-gray-100">
                <Link to="/pricing">Get started</Link>
              </Button>
              <Button asChild size="lg" className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold border-2 border-white/30">
                <Link to="/sample-dashboard">Explore the Sample Dashboard</Link>
              </Button>
            </div>
            <p className="text-sm text-white/60 mt-2">Private • Secure • Cancel anytime</p>
            
          </div>
          
          {/* Self-hosted intro video */}
          <div className="lg:w-1/3 lg:self-start lg:mt-4">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 animate-fade-in">
              <div className="aspect-video">
                <video
                  src={introVideo.url}
                  poster={introPoster.url}
                  controls
                  playsInline
                  preload="metadata"
                  controlsList="nodownload noremoteplayback"
                  disablePictureInPicture
                  title="Asset Safe Introduction"
                  className="w-full h-full rounded-lg bg-black object-cover"
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
