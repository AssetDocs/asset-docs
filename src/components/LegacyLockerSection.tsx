import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import legacyLockerLogo from '@/assets/legacy-locker-logo.png';

const LegacyLockerSection: React.FC = () => {
  const [whatItIsOpen, setWhatItIsOpen] = useState(false);

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-8 mb-12">
            <div className="flex-1 text-center lg:text-left">
              <img src={legacyLockerLogo} alt="Legacy Locker - Secure Digital Estate Planning Vault" className="w-20 h-20 mx-auto lg:mx-0 mb-6" loading="lazy" />
              <h2 className="text-4xl font-bold text-brand-blue mb-4">Introducing Legacy Locker</h2>
              <p className="text-xl text-gray-700">
                A secure vault for organizing the information that matters most to your loved ones
              </p>

              {/* What It Is - Collapsible */}
              <button
                onClick={() => setWhatItIsOpen(!whatItIsOpen)}
                className="mt-4 flex items-center gap-2 text-brand-blue font-medium hover:underline mx-auto lg:mx-0"
              >
                <span>What It Is</span>
                {whatItIsOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  whatItIsOpen ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
                )}
              >
                <p className="text-gray-600 text-base">
                  Legacy Locker captures the things a legal will can't: your voice, your intentions, your stories, and the guidance your family will be grateful for. It's not a legal will—it's the heart behind it. Here you can securely store memories, notes, access details, and clear instructions for the people you trust most.
                </p>
              </div>
            </div>
            <div className="flex-1 w-full max-w-md lg:max-w-none">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src="https://www.youtube.com/embed/V9MvVbn7qfg?controls=0" 
                  title="Legacy Locker Introduction Video"
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin" 
                  allowFullScreen
                  className="absolute inset-0"
                ></iframe>
              </div>
            </div>
          </div>



          <div className="bg-brand-blue text-white p-10 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-4">A Simple, Powerful Way to Protect Your Legacy</h3>
            <p className="text-lg mb-6 max-w-3xl mx-auto">
              Trusted by homeowners and families preparing for the unexpected.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-brand-blue hover:bg-gray-100">
                <Link to="/pricing">Get Started Today</Link>
              </Button>
              <Button asChild size="lg" className="bg-white text-brand-blue hover:bg-gray-100">
                <Link to="/legacy-locker-info">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LegacyLockerSection;
