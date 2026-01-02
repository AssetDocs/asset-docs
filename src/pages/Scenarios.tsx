import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Shield, Timer, UserCheck } from 'lucide-react';
import { breadcrumbSchema, serviceSchema } from '@/utils/structuredData';

const Scenarios: React.FC = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      serviceSchema(
        "Property Documentation for Insurance Claims",
        "Comprehensive pre-incident documentation to expedite insurance claims for natural disasters, theft, fire, and other property losses.",
        "Insurance Documentation"
      ),
      breadcrumbSchema([
        { name: 'Home', url: 'https://www.assetsafe.net/' },
        { name: 'Scenarios', url: 'https://www.assetsafe.net/scenarios' }
      ])
    ]
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead
        title="Insurance Claim Scenarios - When Documentation Matters Most"
        description="Protect your property against natural disasters, theft, fire, and more. Learn how Asset Safe documentation helps expedite insurance claims and maximize settlements."
        keywords="insurance claim scenarios, natural disaster documentation, theft claim, fire damage claim, property loss documentation, hurricane claim, flood damage, home inventory for insurance"
        canonicalUrl="https://www.assetsafe.net/scenarios"
        structuredData={structuredData}
      />
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-brand-blue text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">Scenarios</h1>
          <p className="text-xl max-w-4xl mx-auto">
            Asset Safe is invaluable in these situations where comprehensive documentation protects your interests and streamlines the claims process.
          </p>
        </div>
      </section>
      
      {/* Scenarios Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Natural Disasters */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="text-2xl mb-4">🔥</div>
              <h3 className="text-xl font-semibold mb-3 text-brand-blue">Natural Disasters</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">🌪️ Weather & Storm-Related</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Tornadoes</li>
                    <li>• Hurricanes</li>
                    <li>• Hailstorms</li>
                    <li>• Thunderstorms / Windstorms</li>
                    <li>• Blizzards</li>
                    <li>• Ice Storms / Freezing Rain</li>
                    <li>• Lightning Strikes</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">🌊 Water-Related</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Flooding (from heavy rain, river overflow, storm surge)</li>
                    <li>• Tsunamis</li>
                    <li>• Snowmelt Runoff / Ice Dams</li>
                    <li>• Sewer Backup (covered by endorsements)</li>
                    <li>• Burst Pipes due to Freeze</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">🌋 Geological</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Earthquakes</li>
                    <li>• Landslides / Mudslides</li>
                    <li>• Sinkholes</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">🔥 Fire-Related</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Wildfires</li>
                    <li>• Lightning-induced fires</li>
                    <li>• Smoke Damage (from nearby fires)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Man-Made Events */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="text-2xl mb-4">🏚️</div>
              <h3 className="text-xl font-semibold mb-3 text-brand-blue">Man-Made Events / Other Insurable Incidents</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">🚗 Property & Liability-Related</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• House fires (non-natural cause)</li>
                    <li>• Theft or burglary</li>
                    <li>• Vandalism</li>
                    <li>• Riots / Civil commotion</li>
                    <li>• Explosion (e.g., gas leaks)</li>
                    <li>• Power surge (e.g., electrical damage)</li>
                    <li>• Vehicle crashing into property</li>
                    <li>• Falling objects (e.g., trees, construction debris)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">🏢 Business-Specific</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Business interruption (due to disaster)</li>
                    <li>• Cyberattacks (for cyber liability insurance)</li>
                    <li>• Equipment breakdown</li>
                    <li>• Loss of income due to forced closure</li>
                    <li>• Supply chain disruption</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Special Insurance Scenarios */}
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="text-2xl mb-4">🌀</div>
              <h3 className="text-xl font-semibold mb-3 text-brand-blue">Special Insurance Scenarios</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Loss during evacuation (ALE - Additional Living Expenses)</li>
                <li>• Mold damage (if caused by a covered peril)</li>
                <li>• Loss of use or habitability</li>
                <li>• Damage from construction defects (builder's risk insurance)</li>
                <li>• HVAC or appliance failure (covered by warranties or service plans)</li>
              </ul>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-brand-blue mb-2">Why Documentation Matters</h4>
                <p className="text-sm text-gray-700">
                  In any of these scenarios, having comprehensive pre-incident documentation through Asset Safe can:
                </p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  <li>• Expedite insurance claims processing</li>
                  <li>• Ensure accurate settlement amounts</li>
                  <li>• Provide proof of ownership and condition</li>
                  <li>• Support legal proceedings if necessary</li>
                  <li>• Facilitate emergency planning and recovery</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Asset Docs Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-brand-blue mb-4">Why Choose Asset Safe?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <Shield className="h-12 w-12 text-brand-blue mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Comprehensive Protection</h4>
                <p className="text-sm text-gray-600">Complete documentation for insurance claims, legal proceedings, and regulatory compliance.</p>
              </div>
              <div className="text-center">
                <Timer className="h-12 w-12 text-brand-blue mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Time & Cost Savings</h4>
                <p className="text-sm text-gray-600">Streamlined documentation process reduces administrative burden and operational costs.</p>
              </div>
              <div className="text-center">
                <UserCheck className="h-12 w-12 text-brand-blue mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Professional Standards</h4>
                <p className="text-sm text-gray-600">Industry-specific documentation that meets professional and regulatory requirements.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-brand-green text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Protect What Matters Most</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of property owners, renters, and business professionals who trust Asset Safe for comprehensive asset protection.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a href="/auth" className="bg-white text-orange-500 hover:bg-gray-100 px-6 py-3 rounded-md font-medium">
              Secure Your Account
            </a>
            <a href="/pricing" className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-6 py-3 rounded-md font-medium">
              View Pricing
            </a>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Scenarios;