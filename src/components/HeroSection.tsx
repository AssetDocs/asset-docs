
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
              Your Digital Safety Net for Asset Protection & Unexpected Events
            </h1>
            <p className="text-xl mb-4 animate-slide-up opacity-90">
              Complete property documentation platform for homeowners, renters, and businesses. Secure digital inventory, insurance claims support, legacy planning, and estate management tools—all in one comprehensive solution.
            </p>
            <p className="text-lg mb-8 animate-slide-up opacity-80 font-bold">
              Trusted by thousands across the United States for insurance claims, estate transitions, property management, and peace of mind.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-slide-up">
              <div className="flex flex-col items-center sm:items-start">
                <Button asChild size="lg" className="bg-white text-orange-500 hover:bg-gray-100">
                  <Link to="/signup">Activate Your Account</Link>
                </Button>
                <p className="text-sm mt-2 opacity-80">Cancel anytime • No long-term commitment</p>
              </div>
              <Button asChild size="lg" className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 hover:from-yellow-500 hover:to-yellow-600 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold border-2 border-white/30">
                <Link to="/sample-dashboard">View Sample Dashboard</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                <Link to="/features">Solutions</Link>
              </Button>
              <ShareButton 
                variant="outline" 
                size="lg" 
                className="bg-transparent border-white text-white hover:bg-white/10"
              />
            </div>
            
            {/* Security & Trust Badges */}
            <div className="mt-8 pt-6 border-t border-white/20 animate-fade-in">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm opacity-90">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>256-bit AES Encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>SOC 2 Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                  </svg>
                  <span>AWS Cloud Storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>GDPR Ready</span>
                </div>
              </div>
              <div className="mt-3 text-center lg:text-left">
                <Link to="/legal" className="text-sm underline opacity-80 hover:opacity-100 transition-opacity">
                  Privacy Policy & Compliance Information
                </Link>
              </div>
            </div>
          </div>
          
          {/* YouTube Video */}
          <div className="lg:w-1/3">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 animate-fade-in">
              <div className="aspect-video">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src="https://www.youtube.com/embed/DPnzWlqTN6Q?controls=0" 
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
