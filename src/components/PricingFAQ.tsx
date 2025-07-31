
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
              Yes, we offer a 30-day free trial for all individual, family, and business plans.
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
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">What if I don't want AI to scan my photos?</h3>
            <p className="text-gray-600">
              You have complete control over your privacy. You can choose between having AI valuation turned on or off at any time in your account settings.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">How much storage do I need?</h3>
            <p className="text-gray-600 mb-4">
              Storage needs vary based on file types and usage. Here's a quick reference for our plans:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Storage</th>
                    <th className="text-left py-2">Photos (3MB)</th>
                    <th className="text-left py-2">1080p Video</th>
                    <th className="text-left py-2">4K Video</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b">
                    <td className="py-2 font-medium">50GB</td>
                    <td className="py-2">~16,600</td>
                    <td className="py-2">~0.83 hours (50 min)</td>
                    <td className="py-2">~13 minutes</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-medium">200GB</td>
                    <td className="py-2">~66,600</td>
                    <td className="py-2">~3.3 hours</td>
                    <td className="py-2">~53 minutes</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium">750GB</td>
                    <td className="py-2">~250,000</td>
                    <td className="py-2">~12.5 hours</td>
                    <td className="py-2">~3.3 hours</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">How do you determine the valuation of my items?</h3>
            <p className="text-gray-600">
              Our AI analyzes current market values from multiple sources including eBay, Amazon, specialized auction sites, and industry databases. We consider factors like item condition, rarity, brand, age, and recent sales data to provide accurate valuations. For unique or antique items, we also reference collector guides and expert appraisals to ensure comprehensive assessments.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingFAQ;
