import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import legacyLockerLogo from '@/assets/legacy-locker-logo.png';

const LegacyLockerSection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <img src={legacyLockerLogo} alt="Legacy Locker" className="w-20 h-20 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-brand-blue mb-4">Introducing Legacy Locker</h2>
            <p className="text-xl text-gray-700">
              A secure vault for organizing the information that matters most to your loved ones
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-brand-blue">What It Is</h3>
              <p className="text-gray-700 leading-relaxed">
                A secure, encrypted vault inside Asset Safe where you can store the most important 
                details your loved ones will need—photos, videos, account access, personal notes, 
                and instructions that clarify your wishes. It's a modern way to organize the 
                information that often gets lost, forgotten, or overlooked.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-brand-blue">What It's Not</h3>
              <p className="text-gray-700 leading-relaxed">
                Legacy Locker is not a legally recognized will or electronic will. It does not 
                replace formal estate-planning documents, notarized paperwork, or attorney guidance. 
                Instead, it serves as a companion resource that supports and enhances them.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-brand-blue">Why It Matters</h3>
              <p className="text-gray-700 leading-relaxed">
                Legacy Locker gives peace of mind by ensuring your family or trusted contacts can 
                easily access essential information about your home, your assets, and your digital life. 
                It reduces confusion, speeds up decisions during emergencies or transitions, and 
                preserves the story behind your belongings.
              </p>
            </div>
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
