
import React from 'react';

const PricingFAQ: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">Can I cancel my subscription at any time?</h3>
            <p className="text-gray-600">
              Yes, you can cancel your subscription at any time. Your documentation will remain accessible until the end of your billing period.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">Is there a free trial available?</h3>
            <p className="text-gray-600">
              Yes, we offer a 30-day free trial for all individual, family, and business plans. No credit card required to start.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">How secure is my data?</h3>
            <p className="text-gray-600">
              Your data is protected with enterprise-grade encryption both in transit and at rest. We use multi-factor authentication and regular security audits to ensure your information remains secure.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">Can I upgrade or downgrade my plan?</h3>
            <p className="text-gray-600">
              Yes, you can change your plan at any time. When upgrading, you'll have immediate access to new features. When downgrading, changes take effect at the end of your billing cycle.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">What happens to my data if I cancel?</h3>
            <p className="text-gray-600">
              After cancellation, your data remains stored for 30 days, during which you can reactivate your account or request a data export. After 30 days, your data is permanently deleted.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingFAQ;
