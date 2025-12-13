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
            <img src={legacyLockerLogo} alt="Legacy Locker - Secure Digital Estate Planning Vault" className="w-20 h-20 mx-auto mb-6" loading="lazy" />
            <h2 className="text-4xl font-bold text-brand-blue mb-4">Introducing Legacy Locker</h2>
            <p className="text-xl text-gray-700">
              A secure vault for organizing the information that matters most to your loved ones
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-brand-blue">What It Is</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Legacy Locker is a secure, encrypted digital vault inside Asset Safe designed to store the most important information your loved ones may need—photos, videos, account usernames, saved passwords, property details, personal notes, and clear instructions that explain your wishes.
              </p>
              <p className="text-gray-700 leading-relaxed">
                It provides a centralized, organized place for critical information that is often scattered, forgotten, or inaccessible when it's needed most.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-brand-blue">What It's Not</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Legacy Locker is not a legally recognized will or electronic will. It does not replace formal estate-planning documents, notarized paperwork, or guidance from an attorney.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Instead, it acts as a secure companion resource, helping ensure the practical, day-to-day details that legal documents often exclude are preserved and accessible.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-brand-blue">Why It Matters</h3>
              <p className="text-gray-700 leading-relaxed">
                Legacy Locker offers peace of mind by ensuring your family or trusted contacts can securely access essential information about your home, assets, digital accounts, and online services when you choose to grant access.
              </p>
            </div>
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
