
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
            <h1 className="text-2xl md:text-3xl font-bold mb-4 animate-fade-in">
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
          
          {/* Video Section */}
          <div className="lg:w-1/3">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 animate-fade-in">
              <div className="aspect-video">
                {/* Try multiple video sources */}
                <video 
                  controls
                  preload="metadata"
                  className="w-full h-full rounded-lg object-cover"
                  onError={(e) => {
                    console.error('Video load error:', e);
                    // Try to show a fallback message
                  }}
                  onLoadStart={() => console.log('Video loading started')}
                  poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQwIiBoZWlnaHQ9IjM2MCIgdmlld0JveD0iMCAwIDY0MCAzNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2NDAiIGhlaWdodD0iMzYwIiBmaWxsPSIjMzMzIi8+CjxwYXRoIGQ9Ik0zMjAgMTgwTDM3MCAyMTBMMzIwIDI0MFYxODBaIiBmaWxsPSJ3aGl0ZSIvPgo8dGV4dCB4PSIzMjAiIHk9IjI3MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiI+QXNzZXQgRG9jcyBJbnRybzwvdGV4dD4KPHN2Zz4K"
                >
                  {/* Try the current path first */}
                  <source src="/AssetDocsIntro2.mp4" type="video/mp4" />
                  {/* Try the original path as fallback */}
                  <source src="/Asset%20Docs%20Intro%202.mp4" type="video/mp4" />
                  
                  {/* Fallback content */}
                  <div className="flex items-center justify-center h-full bg-gray-800 rounded-lg">
                    <div className="text-center text-white/80">
                      <div className="text-4xl mb-2">▶</div>
                      <p className="text-sm">Asset Docs Intro Video</p>
                      <p className="text-xs mt-2">
                        <a 
                          href="https://maaemedia.pixieset.com/assetdocsintro/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="underline hover:text-white"
                        >
                          View on Pixieset
                        </a>
                      </p>
                    </div>
                  </div>
                </video>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
