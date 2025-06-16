
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const About: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-brand-blue mb-8 text-center">About Asset Docs</h1>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">
                Your Digital Guardian for What Matters Most
              </h2>
              
              <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-8 rounded-lg mb-8">
                <p className="text-xl text-gray-700 leading-relaxed text-center mb-6">
                  Asset Docs was born from a simple yet powerful belief: protecting your family's most valuable 
                  possessions shouldn't be complicated, stressful, or uncertain.
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="text-center p-6 bg-white rounded-lg shadow-md">
                  <div className="w-16 h-16 bg-brand-blue rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Simplify Protection</h3>
                  <p className="text-gray-600">
                    Transform the overwhelming task of documenting your property into an effortless, 
                    organized digital experience that fits seamlessly into your life.
                  </p>
                </div>
                
                <div className="text-center p-6 bg-white rounded-lg shadow-md">
                  <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Verified Claims</h3>
                  <p className="text-gray-600">
                    Create bulletproof documentation that insurance companies trust, turning potential 
                    claim disputes into swift, verified settlements in your favor.
                  </p>
                </div>
                
                <div className="text-center p-6 bg-white rounded-lg shadow-md">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800">Peace of Mind</h3>
                  <p className="text-gray-600">
                    Sleep soundly knowing that your family's treasures are digitally safeguarded, 
                    accessible anywhere, and protected against life's unexpected moments.
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-8 rounded-lg">
                <h3 className="text-2xl font-semibold mb-4 text-center text-gray-800">Our Mission</h3>
                <p className="text-lg text-gray-700 leading-relaxed text-center mb-6">
                  We believe every family deserves the confidence that comes with knowing their most precious 
                  belongings are properly documented and protected. Asset Docs transforms the traditional, 
                  tedious process of property documentation into a modern, intuitive experience that actually 
                  works when you need it most.
                </p>
                
                <div className="bg-white p-6 rounded-lg border-l-4 border-brand-blue">
                  <p className="text-gray-700 italic text-center">
                    "Because when disaster strikes, the last thing you should worry about is whether 
                    you can prove what you've lost. With Asset Docs, you're not just documenting possessions—
                    you're securing your family's future."
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
