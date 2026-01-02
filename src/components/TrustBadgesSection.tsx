import React from 'react';

const TrustBadgesSection: React.FC = () => {
  return (
    <section className="py-6 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <span className="text-sm md:text-base font-medium text-gray-700">🔒 Secure & Encrypted by Design</span>
            <span className="text-sm md:text-base font-medium text-gray-700">🏠 Built for Real Homes & Real Life</span>
            <span className="text-sm md:text-base font-medium text-gray-700">📄 Insurance & Estate Ready</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustBadgesSection;
