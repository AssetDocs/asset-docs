
import React from 'react';

const PricingContactCTA: React.FC = () => {
  return (
    <section className="py-16 bg-brand-green text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Need a Custom Solution?</h2>
        <p className="text-xl mb-8 max-w-3xl mx-auto">
          Our team can create a tailored plan specific to your unique documentation needs.
        </p>
        <a href="/contact" className="bg-white text-brand-green hover:bg-gray-100 px-6 py-3 rounded-md font-medium inline-block">
          Contact Our Team
        </a>
      </div>
    </section>
  );
};

export default PricingContactCTA;
