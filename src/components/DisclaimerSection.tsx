
import React from 'react';
import { Info } from 'lucide-react';

const DisclaimerSection: React.FC = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-brand-blue mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-brand-blue mb-1">Asset Documentation Platform</p>
                <p className="text-sm text-gray-600">
                  AssetDocs is designed for property documentation and insurance protection, not inventory management or business operations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DisclaimerSection;
