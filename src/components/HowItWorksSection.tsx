
import React from 'react';

const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="section-title">How Asset Docs Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="w-16 h-16 rounded-full bg-brand-blue text-white flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Document</h3>
            <p className="text-gray-600">
              Take photos and videos of your property and possessions using our mobile app or professional service.
            </p>
          </div>
          <div className="p-6">
            <div className="w-16 h-16 rounded-full bg-teal-500 text-white flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Store</h3>
            <p className="text-gray-600">
              Your documentation is securely stored in the cloud with privacy controls and encryption.
            </p>
          </div>
          <div className="p-6">
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-3">Protect</h3>
            <p className="text-gray-600">
              Access your documentation anytime for insurance claims, estate planning, or property sales.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
