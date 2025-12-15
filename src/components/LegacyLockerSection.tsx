import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import legacyLockerLogo from '@/assets/legacy-locker-logo.png';
import { cn } from '@/lib/utils';

interface ExpandableBoxProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const ExpandableBox: React.FC<ExpandableBoxProps> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-2xl font-semibold text-brand-blue">{title}</h3>
        <ChevronDown className={cn("h-6 w-6 text-brand-blue transition-transform", isOpen && "rotate-180")} />
      </button>
      <div className={cn("px-8 pb-8 transition-all", isOpen ? "block" : "hidden")}>
        {children}
      </div>
    </div>
  );
};

const LegacyLockerSection: React.FC = () => {
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

          <div className="flex flex-col gap-4 mb-8">
            <ExpandableBox title="What It Is" defaultOpen={true}>
              <p className="text-gray-700 leading-relaxed mb-4">
                Legacy Locker is a secure, encrypted digital vault inside Asset Safe designed to store the most important information your loved ones may need—photos, videos, account usernames, saved passwords, property details, personal notes, and clear instructions that explain your wishes.
              </p>
              <p className="text-gray-700 leading-relaxed">
                It provides a centralized, organized place for critical information that is often scattered, forgotten, or inaccessible when it's needed most.
              </p>
            </ExpandableBox>

            <ExpandableBox title="What It's Not">
              <p className="text-gray-700 leading-relaxed mb-4">
                Legacy Locker is not a legally recognized will or electronic will. It does not replace formal estate-planning documents, notarized paperwork, or guidance from an attorney.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Instead, it acts as a secure companion resource, helping ensure the practical, day-to-day details that legal documents often exclude are preserved and accessible.
              </p>
            </ExpandableBox>

            <ExpandableBox title="Why It Matters">
              <p className="text-gray-700 leading-relaxed mb-4">
                Legacy Locker offers peace of mind by ensuring your family or trusted contacts can securely access essential information about your home, assets, digital accounts, and online services when you choose to grant access.
              </p>
              <ul className="text-gray-700 leading-relaxed space-y-2 list-disc list-inside">
                <li>Reduce confusion during emergencies or transitions</li>
                <li>Eliminate time-consuming account recovery processes</li>
                <li>Prevent lost or inaccessible digital assets</li>
                <li>Preserve the context, meaning, and instructions behind your belongings</li>
              </ul>
            </ExpandableBox>
          </div>

          <div className="text-center mb-12">
            <Button asChild variant="outline" size="lg" className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white">
              <Link to="/legacy-locker-info">Learn More</Link>
            </Button>
          </div>

          <div className="bg-brand-blue text-white p-10 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-4">A Simple, Powerful Way to Protect Your Legacy</h3>
            <p className="text-lg mb-6 max-w-3xl mx-auto">
              Start organizing the information your loved ones will need, all in one secure, encrypted location.
            </p>
            <Button asChild size="lg" className="bg-white text-brand-blue hover:bg-gray-100">
              <Link to="/signup">Get Started Today</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LegacyLockerSection;
