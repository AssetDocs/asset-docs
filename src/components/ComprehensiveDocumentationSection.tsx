import React from 'react';

const ComprehensiveDocumentationSection: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Comprehensive Documentation Tools
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Professional-grade documentation solutions for various industries and use cases
          </p>
        </div>
        
        <div className="max-w-md mx-auto">
          <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Real Estate</h3>
            <p className="text-gray-600">
              Property condition reports, improvement documentation, and value authentication.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComprehensiveDocumentationSection;