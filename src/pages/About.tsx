
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import { Button } from '@/components/ui/button';
import { organizationSchema, breadcrumbSchema } from '@/utils/structuredData';

const About: React.FC = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema,
      breadcrumbSchema([
        { name: 'Home', url: 'https://getassetsafe.com/' },
        { name: 'About', url: 'https://getassetsafe.com/about' }
      ])
    ]
  };

  return (
    <div className="flex flex-col min-h-screen">
      <SEOHead
        title="About Asset Safe"
        description="Learn about Asset Safe's mission to help people organize and protect property, records, information, memories, and continuity details in one secure place."
        keywords="about asset safe, property documentation, household information, secure vault, digital legacy, preparedness, organize records, family information, asset protection"
        canonicalUrl="https://getassetsafe.com/about"
        structuredData={structuredData}
      />
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-brand-blue mb-8 text-center">About Asset Safe</h1>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-8 rounded-lg mb-8">
                <p className="text-xl text-gray-700 leading-relaxed text-center">
                  Asset Safe was built around a simple idea: the things you value, the information you rely on, 
                  and the memories you want to preserve should be easier to organize and protect.
                </p>
                <p className="text-xl text-brand-blue font-medium leading-relaxed text-center mt-4">
                  Everything you love. Protected in one place.
                </p>
                <p className="text-base text-gray-500 leading-relaxed text-center mt-3">
                  From property and asset documentation to important records, everyday household details, 
                  contacts, notes, memories, and sensitive legacy and digital-access information, 
                  Asset Safe helps you keep the details that matter together in one organized place.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div className="text-center p-6 bg-white rounded-lg shadow-md">
                  <div className="w-16 h-16 bg-brand-blue rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Document What Matters</h3>
                  <p className="text-gray-600">
                    Keep photos, receipts, records, values, and property details organized so important 
                    documentation is easier to find when you need it.
                  </p>
                </div>
                
                <div className="text-center p-6 bg-white rounded-lg shadow-md">
                  <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Keep Life Organized</h3>
                  <p className="text-gray-600">
                    Bring contacts, notes, reminders, household details, and meaningful family information 
                    together in one organized place.
                  </p>
                </div>
                
                <div className="text-center p-6 bg-white rounded-lg shadow-md">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Protect What’s Private</h3>
                  <p className="text-gray-600">
                    Keep sensitive digital-access and legacy information protected inside your Secure Vault.
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="text-center mb-12">
                <Button asChild className="bg-brand-orange hover:bg-brand-orange/90 text-white px-8 py-3 text-lg">
                  <Link to="/pricing">Get Started</Link>
                </Button>
              </div>
              
              <div className="bg-gray-50 p-8 rounded-lg">
                <h3 className="text-2xl font-semibold mb-4 text-center text-gray-800">Our Mission</h3>
                <p className="text-lg text-gray-700 leading-relaxed text-center mb-6">
                  Asset Safe exists to make preparedness simpler. We help people organize the property, records, 
                  information, and memories they may need today — and make sure important details are easier to find 
                  when they matter most.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed text-center mb-6">
                  From documenting belongings and maintaining household knowledge to preparing for emergencies and 
                  preserving important instructions, Asset Safe brings the details of everyday life together in one organized place.
                </p>
                
                <div className="bg-white p-6 rounded-lg border-l-4 border-brand-blue">
                  <p className="text-gray-700 italic text-center">
                    "Being prepared isn’t only about what happens after something goes wrong. It’s about knowing the information 
                    that matters is already organized when you need it."
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default About;
